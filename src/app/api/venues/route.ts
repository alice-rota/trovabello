import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichVenue } from "@/lib/enrich";
import { factsToUpdate } from "@/lib/apply";
import { missingEssentials } from "@/lib/schema";
import { CATEGORY_LABEL } from "@/lib/categories";
import { DEMO_VENUES } from "@/lib/demo";

export const maxDuration = 60;

// GET /api/venues - liste toutes les fiches.
// Si aucune base n'est connectée → renvoie des fiches de démo (mode aperçu).
export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { addedAt: "desc" },
      include: { comments: { orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json(venues);
  } catch {
    return NextResponse.json(DEMO_VENUES);
  }
}

// POST /api/venues - crée une fiche puis l'enrichit via l'IA
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }
  const category = CATEGORY_LABEL[body.category] ? body.category : "LIEU";

  // 1. Création immédiate
  const venue = await prisma.venue.create({
    data: {
      name,
      category,
      website: body.website?.trim() || null,
      country: body.country === "IT" ? "IT" : "FR",
      contactName: body.contactName?.trim() || null,
      contactEmail: body.contactEmail?.trim() || null,
      contactPhone: body.contactPhone?.trim() || null,
      status: "PENDING",
    },
  });

  // 2. Enrichissement IA (best-effort - n'échoue pas la création)
  try {
    const facts = await enrichVenue({
      name: venue.name,
      website: venue.website,
      country: venue.country,
      categoryLabel: CATEGORY_LABEL[category],
    });
    const update = factsToUpdate(facts);
    const missing = missingEssentials({
      price: facts.price,
      availabilityNotes: facts.availabilityNotes,
    });
    const updated = await prisma.venue.update({
      where: { id: venue.id },
      data: {
        ...update,
        sources: venue.website,
        status: missing.length === 0 ? "COMPLETE" : "ENRICHED",
      },
    });
    return NextResponse.json({ venue: updated, missing });
  } catch (e) {
    // L'enrichissement a échoué (clé IA manquante, etc.) - la fiche existe quand même
    return NextResponse.json({
      venue,
      missing: [],
      warning: `Enrichissement IA indisponible: ${(e as Error).message}`,
    });
  }
}
