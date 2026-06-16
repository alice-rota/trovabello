import { z } from "zod";

// Schéma des champs qu'on cherche à extraire pour chaque domaine.
// Tout est optionnel : l'IA remplit ce qu'elle trouve, le reste sera
// complété par la boucle email.
export const VenueFactsSchema = z.object({
  region: z
    .string()
    .nullish()
    .describe("Région ou ville du domaine (ex: 'Toscane', 'Provence')"),
  country: z
    .enum(["FR", "IT"])
    .nullish()
    .describe("Pays : FR pour France, IT pour Italie"),
  photoUrl: z
    .string()
    .nullish()
    .describe("URL d'une photo représentative du domaine"),
  capacitySeated: z
    .number()
    .int()
    .nullish()
    .describe("Nombre maximum d'invités assis pour le dîner"),
  capacityStanding: z
    .number()
    .int()
    .nullish()
    .describe("Capacité debout / cocktail"),
  beds: z
    .number()
    .int()
    .nullish()
    .describe("Nombre de couchages / personnes logées sur place"),
  priceVenue: z
    .number()
    .int()
    .nullish()
    .describe("Prix de location/privatisation du lieu en EUR (week-end)"),
  pricePerNightPerGuest: z
    .number()
    .int()
    .nullish()
    .describe("Prix hébergement par nuit et par personne en EUR"),
  catererType: z
    .enum(["INCLUDED", "IMPOSED", "FREE", "UNKNOWN"])
    .nullish()
    .describe(
      "Traiteur: INCLUDED=inclus/maison, IMPOSED=imposé, FREE=libre, UNKNOWN=inconnu",
    ),
  catererPricePerGuest: z
    .number()
    .int()
    .nullish()
    .describe("Prix du traiteur par personne en EUR"),
  minSpend: z
    .number()
    .int()
    .nullish()
    .describe("Minimum de dépense imposé en EUR"),
  exclusivity: z
    .boolean()
    .nullish()
    .describe("Privatisation totale possible ?"),
  availabilityNotes: z
    .string()
    .nullish()
    .describe("Toute info sur les disponibilités trouvée"),
  contactEmail: z.string().nullish().describe("Email de contact du domaine"),
  contactPhone: z.string().nullish().describe("Téléphone de contact"),
  notes: z
    .string()
    .nullish()
    .describe("Avantages, contraintes, prestations notables (2-3 phrases max)"),
});

export type VenueFacts = z.infer<typeof VenueFactsSchema>;

// Champs considérés "essentiels" pour la comparaison - s'ils manquent,
// on déclenche un email au domaine.
export const ESSENTIAL_FIELDS: (keyof VenueFacts)[] = [
  "capacitySeated",
  "priceVenue",
  "pricePerNightPerGuest",
  "catererType",
  "availabilityNotes",
];

export function missingEssentials(facts: Partial<VenueFacts>): string[] {
  return ESSENTIAL_FIELDS.filter((f) => {
    const v = facts[f];
    return v === null || v === undefined || v === "" || v === "UNKNOWN";
  }) as string[];
}

// Libellés FR des champs, pour les emails et l'UI
export const FIELD_LABELS: Record<string, string> = {
  capacitySeated: "Capacité (invités assis au dîner)",
  capacityStanding: "Capacité debout / cocktail",
  beds: "Nombre de couchages sur place",
  priceVenue: "Tarif de location / privatisation du lieu (week-end)",
  pricePerNightPerGuest: "Prix de l'hébergement par nuit et par personne",
  catererType: "Traiteur (inclus, imposé, ou libre ?)",
  catererPricePerGuest: "Prix du traiteur par personne",
  minSpend: "Minimum de dépense éventuel",
  availabilityNotes: "Disponibilités sur 2026-2027",
  exclusivity: "Privatisation totale du domaine",
};
