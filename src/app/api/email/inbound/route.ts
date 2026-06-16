import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEmailReply } from "@/lib/enrich";
import { factsToUpdate } from "@/lib/apply";
import { missingEssentials } from "@/lib/schema";

export const maxDuration = 60;

// Webhook des emails entrants (Resend inbound).
// On rattache la réponse à une fiche, on l'analyse par IA, on complète les champs.
export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));

  // Resend encapsule les données dans `data` pour les webhooks
  const d = payload.data ?? payload;
  const from: string = d.from?.address ?? d.from ?? "";
  const subject: string = d.subject ?? "";
  const text: string = d.text ?? d.body ?? d.html ?? "";
  const headers = d.headers ?? {};

  // 1. Retrouver la fiche concernée
  let venueId: string | undefined =
    headers["X-Venue-Id"] || headers["x-venue-id"];
  if (!venueId) {
    const m = text.match(/Réf\.?\s*([a-z0-9]{20,})/i);
    if (m) venueId = m[1];
  }

  let venue = venueId
    ? await prisma.venue.findUnique({ where: { id: venueId } })
    : null;
  if (!venue && from) {
    venue = await prisma.venue.findFirst({
      where: { contactEmail: { equals: from, mode: "insensitive" } },
      orderBy: { lastContacted: "desc" },
    });
  }
  if (!venue) {
    return NextResponse.json({ ok: false, reason: "fiche introuvable" });
  }

  // 2. Tracer l'email entrant
  await prisma.emailMessage.create({
    data: {
      venueId: venue.id,
      direction: "INBOUND",
      subject,
      body: text,
      fromAddr: from,
    },
  });

  // 3. Analyser la réponse et compléter la fiche
  try {
    const facts = await parseEmailReply(text, {
      price: venue.price ?? undefined,
      capacitySeated: venue.capacitySeated ?? undefined,
      catererPricePerGuest: venue.catererPricePerGuest ?? undefined,
    });
    const missing = missingEssentials({
      price: facts.price ?? venue.price,
      availabilityNotes: facts.availabilityNotes ?? venue.availabilityNotes,
    });
    await prisma.venue.update({
      where: { id: venue.id },
      data: {
        ...factsToUpdate(facts),
        status: missing.length === 0 ? "COMPLETE" : "REPLIED",
      },
    });
    return NextResponse.json({ ok: true, venueId: venue.id, missing });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
