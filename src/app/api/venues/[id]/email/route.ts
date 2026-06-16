import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInfoRequest } from "@/lib/email";
import { missingEssentials } from "@/lib/schema";

// POST /api/venues/:id/email - envoie (ou prévisualise) la demande d'infos
// Body: { targetDate?, guests?, preview?: boolean }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  if (!venue.contactEmail)
    return NextResponse.json(
      { error: "Aucun email de contact pour ce domaine" },
      { status: 400 },
    );

  const missing = missingEssentials({
    capacitySeated: venue.capacitySeated,
    priceVenue: venue.priceVenue,
    pricePerNightPerGuest: venue.pricePerNightPerGuest,
    catererType: venue.catererType,
    availabilityNotes: venue.availabilityNotes,
  });

  const result = await sendInfoRequest({
    venueId: venue.id,
    venueName: venue.name,
    to: venue.contactEmail,
    missing: missing.length ? missing : ["availabilityNotes"],
    targetDate: body.targetDate,
    guests: body.guests,
  });

  // Mode aperçu OU clé Resend absente : on ne persiste rien, on renvoie le texte
  if (body.preview || !result.ok) {
    return NextResponse.json({
      sent: result.ok,
      preview: result.preview,
      error: result.error,
    });
  }

  // Envoi réussi : on trace l'email et on met à jour le statut
  await prisma.emailMessage.create({
    data: {
      venueId: venue.id,
      direction: "OUTBOUND",
      subject: result.preview?.subject,
      body: result.preview?.text,
      toAddr: venue.contactEmail,
      providerId: result.id,
    },
  });
  const updated = await prisma.venue.update({
    where: { id },
    data: { status: "CONTACTED", lastContacted: new Date() },
  });

  return NextResponse.json({ sent: true, id: result.id, venue: updated });
}
