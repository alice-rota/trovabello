import { generateObject } from "ai";
import { VenueFactsSchema, type VenueFacts } from "./schema";
import { getModel } from "./model";

// Modèle IA - gratuit par défaut (Google Gemini free tier). Voir src/lib/model.ts
const MODEL = getModel();

// Récupère le contenu textuel d'une page web (best-effort, sans rendu JS).
async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 MariageBot/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Nettoyage grossier du HTML -> texte
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 20000);
  } catch {
    return "";
  }
}

// Extrait une première og:image depuis le HTML brut si possible
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 MariageBot/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    const m =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

export type EnrichInput = {
  name: string;
  website?: string | null;
  country?: "FR" | "IT" | null;
};

// Enrichit une fiche domaine : lit le site web s'il est fourni, puis
// demande au modèle d'extraire des faits structurés.
export async function enrichVenue(input: EnrichInput): Promise<VenueFacts> {
  const pageText = input.website ? await fetchPageText(input.website) : "";
  const ogImage = input.website ? await fetchOgImage(input.website) : null;

  const prompt = [
    `Tu aides à comparer des domaines pour un mariage (France 🇫🇷 et Italie 🇮🇹).`,
    `Voici un domaine à analyser :`,
    `- Nom : ${input.name}`,
    input.website ? `- Site web : ${input.website}` : `- Site web : inconnu`,
    input.country ? `- Pays indiqué : ${input.country}` : "",
    "",
    pageText
      ? `Contenu extrait de leur site web (peut être incomplet) :\n"""${pageText}"""`
      : `Aucun contenu de site disponible. Remplis uniquement ce que tu sais de façon fiable, laisse le reste à null.`,
    "",
    `Extrais les informations demandées. N'INVENTE RIEN : si une info n'est pas clairement présente, mets null. Les prix sont en euros (nombres entiers).`,
  ]
    .filter(Boolean)
    .join("\n");

  const { object } = await generateObject({
    model: MODEL,
    schema: VenueFactsSchema,
    prompt,
  });

  // Complète la photo avec og:image si l'IA n'a rien trouvé
  if (!object.photoUrl && ogImage) object.photoUrl = ogImage;
  if (!object.country && input.country) object.country = input.country;

  return object;
}

// Analyse la réponse email d'un domaine pour en extraire des faits.
export async function parseEmailReply(
  body: string,
  known: Partial<VenueFacts>,
): Promise<VenueFacts> {
  const prompt = [
    `Un domaine de mariage vient de répondre à notre email de demande d'informations.`,
    `Voici ce qu'on sait déjà (ne le contredis pas sans raison) :`,
    JSON.stringify(known),
    "",
    `Contenu de leur réponse email :`,
    `"""${body.slice(0, 12000)}"""`,
    "",
    `Extrais toute information chiffrée ou factuelle (prix, capacité, disponibilités, traiteur...). Mets à null ce qui n'est pas mentionné. Prix en euros, nombres entiers.`,
  ].join("\n");

  const { object } = await generateObject({
    model: MODEL,
    schema: VenueFactsSchema,
    prompt,
  });
  return object;
}
