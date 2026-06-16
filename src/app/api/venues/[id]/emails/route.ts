import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/venues/:id/emails — ajoute un email à la main (envoyé ou reçu)
// Body: { direction: "OUTBOUND" | "INBOUND", subject?, body? }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const d = await req.json().catch(() => ({}));
  const direction = d.direction === "INBOUND" ? "INBOUND" : "OUTBOUND";

  const email = await prisma.emailMessage.create({
    data: {
      venueId: id,
      direction,
      subject: d.subject?.trim() || null,
      body: d.body?.trim() || null,
    },
  });

  // Met à jour le statut de la fiche selon le sens du mail
  await prisma.venue
    .update({
      where: { id },
      data: direction === "INBOUND" ? { status: "REPLIED" } : { status: "CONTACTED" },
    })
    .catch(() => {});

  return NextResponse.json(email);
}
