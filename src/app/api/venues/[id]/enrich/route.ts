import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichVenue } from "@/lib/enrich";
import { factsToUpdate } from "@/lib/apply";
import { missingEssentials } from "@/lib/schema";

export const maxDuration = 60;

// POST /api/venues/:id/enrich - relance l'enrichissement IA
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  try {
    const facts = await enrichVenue({
      name: venue.name,
      website: venue.website,
      country: venue.country,
    });
    const missing = missingEssentials({
      capacitySeated: facts.capacitySeated ?? venue.capacitySeated,
      priceVenue: facts.priceVenue ?? venue.priceVenue,
      pricePerNightPerGuest: facts.pricePerNightPerGuest ?? venue.pricePerNightPerGuest,
      catererType: facts.catererType ?? venue.catererType,
      availabilityNotes: facts.availabilityNotes ?? venue.availabilityNotes,
    });
    const updated = await prisma.venue.update({
      where: { id },
      data: {
        ...factsToUpdate(facts),
        status: missing.length === 0 ? "COMPLETE" : "ENRICHED",
      },
    });
    return NextResponse.json({ venue: updated, missing });
  } catch (e) {
    return NextResponse.json(
      { error: `Enrichissement indisponible: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
