// Catégories de prestations du planner. `key` = valeur en base (enum Prisma).
export type CategoryKey =
  | "LIEU"
  | "CEREMONIE"
  | "HEBERGEMENT"
  | "TRAITEUR"
  | "BOISSONS"
  | "GATEAU"
  | "LOCATION"
  | "PHOTOGRAPHE"
  | "VIDEASTE"
  | "MUSIQUE"
  | "FLEURISTE"
  | "DECORATION"
  | "PLANNER"
  | "OFFICIANT"
  | "ROBE"
  | "COSTUME"
  | "COIFFURE"
  | "MAQUILLAGE"
  | "ALLIANCES"
  | "ACCESSOIRES"
  | "PAPETERIE"
  | "SITE_INVITES"
  | "CADEAUX"
  | "ANIMATION"
  | "TRANSPORT"
  | "ENFANTS"
  | "LUNE_DE_MIEL"
  | "AUTRE";

export type Category = {
  key: CategoryKey;
  label: string; // singulier (fiche)
  plural: string; // pour l'onglet
  group: string; // regroupement thématique
};

// Liste resserrée à l'essentiel (les clés non utilisées restent dans l'enum
// Prisma sans souci). On regroupe coiffure+maquillage et les tenues.
export const CATEGORIES: Category[] = [
  { key: "LIEU", label: "Lieu", plural: "Lieu", group: "Lieu et réception" },
  { key: "TRAITEUR", label: "Traiteur", plural: "Traiteur", group: "Lieu et réception" },
  { key: "GATEAU", label: "Gâteau", plural: "Gâteau", group: "Lieu et réception" },
  { key: "PHOTOGRAPHE", label: "Photo / Vidéo", plural: "Photo / Vidéo", group: "Prestataires" },
  { key: "MUSIQUE", label: "DJ / Musique", plural: "Musique", group: "Prestataires" },
  { key: "FLEURISTE", label: "Fleuriste", plural: "Fleuriste", group: "Prestataires" },
  { key: "DECORATION", label: "Décoration", plural: "Décoration", group: "Prestataires" },
  { key: "PLANNER", label: "Wedding planner", plural: "Planner", group: "Prestataires" },
  { key: "ROBE", label: "Tenues", plural: "Tenues", group: "Tenues et beauté" },
  { key: "COIFFURE", label: "Coiffure et maquillage", plural: "Coiffure", group: "Tenues et beauté" },
  { key: "ALLIANCES", label: "Alliances", plural: "Alliances", group: "Tenues et beauté" },
  { key: "PAPETERIE", label: "Papeterie", plural: "Papeterie", group: "Extras" },
  { key: "ANIMATION", label: "Animations", plural: "Animations", group: "Extras" },
  { key: "AUTRE", label: "Autre", plural: "Autre", group: "Extras" },
];

// Libellés pour TOUTES les clés (affichage des fiches), même celles retirées
// du menu d'ajout.
export const CATEGORY_LABEL: Record<string, string> = {
  LIEU: "Lieu",
  CEREMONIE: "Lieu de cérémonie",
  HEBERGEMENT: "Hébergement",
  TRAITEUR: "Traiteur",
  BOISSONS: "Boissons et bar",
  GATEAU: "Gâteau",
  LOCATION: "Location matériel",
  PHOTOGRAPHE: "Photo / Vidéo",
  VIDEASTE: "Vidéaste",
  MUSIQUE: "DJ / Musique",
  FLEURISTE: "Fleuriste",
  DECORATION: "Décoration",
  PLANNER: "Wedding planner",
  OFFICIANT: "Officiant",
  ROBE: "Tenues",
  COSTUME: "Costume",
  COIFFURE: "Coiffure et maquillage",
  MAQUILLAGE: "Maquillage",
  ALLIANCES: "Alliances",
  ACCESSOIRES: "Accessoires",
  PAPETERIE: "Papeterie",
  SITE_INVITES: "Site et invités",
  CADEAUX: "Liste / cadeaux",
  ANIMATION: "Animations",
  TRANSPORT: "Transport",
  ENFANTS: "Garde d'enfants",
  LUNE_DE_MIEL: "Lune de miel",
  AUTRE: "Autre",
};

export const CATEGORY_GROUPS = [
  "Lieu et réception",
  "Prestataires",
  "Tenues et beauté",
  "Extras",
];

// Catégories qui affichent les champs détaillés "lieu" (capacité, couchages,
// traiteur, hébergement) en plus du prix.
export function isVenueLike(cat: string): boolean {
  return cat === "LIEU" || cat === "HEBERGEMENT";
}
