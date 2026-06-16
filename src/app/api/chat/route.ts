import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/model";
import { prisma } from "@/lib/prisma";
import { friendlyAiError } from "@/lib/enrich";
import { CATEGORY_LABEL } from "@/lib/categories";
import { DEMO_VENUES } from "@/lib/demo";

export const maxDuration = 60;

// POST /api/chat — Donna, la wedding planneuse. Reçoit l'historique de
// conversation, lit toutes les fiches du planning, et répond.
export async function POST(req: Request) {
  const { messages } = await req.json().catch(() => ({ messages: [] }));

  // Récupère toutes les fiches (ou la démo si pas de base)
  let venues: Array<Record<string, unknown>> = [];
  try {
    venues = (await prisma.venue.findMany({
      orderBy: { category: "asc" },
    })) as unknown as Array<Record<string, unknown>>;
  } catch {
    venues = DEMO_VENUES as unknown as Array<Record<string, unknown>>;
  }

  const lines = venues
    .map((v) => {
      const parts = [
        `[${CATEGORY_LABEL[v.category as string] ?? v.category}]`,
        `${v.name}`,
        `(${v.country === "IT" ? "Italie" : "France"}${v.region ? `, ${v.region}` : ""})`,
        v.isFavorite ? "FAVORI" : "",
        `prix: ${v.price != null ? v.price + "€" : "non renseigné"}`,
        v.capacitySeated ? `${v.capacitySeated} invités` : "",
        v.beds ? `${v.beds} couchages` : "",
        v.availabilityNotes ? `dispo: ${v.availabilityNotes}` : "",
        v.notes ? `— ${v.notes}` : "",
      ].filter(Boolean);
      return "• " + parts.join(" · ");
    })
    .join("\n");

  const system = `Tu es Donna, la wedding planneuse de Nicole et Tom — pétillante, chaleureuse, avec de l'humour mais toujours pro. Tu les aides à organiser leur mariage à partir des prestataires enregistrés dans leur planning "Trovabello".

Réponds en français, de façon CONCISE et concrète. N'utilise JAMAIS d'emoji. Appuie-toi UNIQUEMENT sur les données ci-dessous : compare les prix, fais des totaux/budgets, recommande, repère ce qui manque (catégories sans option, prix non renseignés, prestataires pas encore contactés). Si l'info n'est pas dans les données, dis-le simplement et propose une piste. N'invente jamais de chiffres.

PRESTATAIRES DU PLANNING (${venues.length}) :
${lines || "(aucun prestataire pour l'instant)"}`;

  try {
    const { text } = await generateText({
      model: getModel(),
      system,
      messages,
      maxRetries: 1,
    });
    return NextResponse.json({ reply: text });
  } catch (e) {
    return NextResponse.json({
      reply: `Oups, je suis un peu débordée là (${friendlyAiError(e)})`,
      error: true,
    });
  }
}
