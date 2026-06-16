import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/venues/:id - édition manuelle d'une fiche
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Liste blanche des champs éditables à la main
  const allowed = [
    "name", "website", "country", "region", "status",
    "contactName", "contactEmail", "contactPhone", "photoUrl",
    "capacitySeated", "capacityStanding", "beds",
    "priceVenue", "pricePerNightPerGuest", "catererType",
    "catererPricePerGuest", "minSpend", "availabilityNotes",
    "availableForDate", "exclusivity", "notes",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) data[k] = body[k];

  const venue = await prisma.venue.update({ where: { id }, data });
  return NextResponse.json(venue);
}

// DELETE /api/venues/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.venue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
