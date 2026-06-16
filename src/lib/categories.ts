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

export const CATEGORIES: Category[] = [
  { key: "LIEU", label: "Lieu", plural: "Lieux", group: "Lieu & réception" },
  { key: "CEREMONIE", label: "Lieu de cérémonie", plural: "Cérémonie", group: "Lieu & réception" },
  { key: "HEBERGEMENT", label: "Hébergement", plural: "Hébergement", group: "Lieu & réception" },
  { key: "TRAITEUR", label: "Traiteur", plural: "Traiteurs", group: "Lieu & réception" },
  { key: "BOISSONS", label: "Boissons & bar", plural: "Boissons", group: "Lieu & réception" },
  { key: "GATEAU", label: "Gâteau", plural: "Gâteau", group: "Lieu & réception" },
  { key: "LOCATION", label: "Location matériel", plural: "Location", group: "Lieu & réception" },
  { key: "PHOTOGRAPHE", label: "Photographe", plural: "Photographes", group: "Prestataires" },
  { key: "VIDEASTE", label: "Vidéaste", plural: "Vidéastes", group: "Prestataires" },
  { key: "MUSIQUE", label: "DJ / Musique", plural: "Musique", group: "Prestataires" },
  { key: "FLEURISTE", label: "Fleuriste", plural: "Fleuristes", group: "Prestataires" },
  { key: "DECORATION", label: "Décoration", plural: "Décoration", group: "Prestataires" },
  { key: "PLANNER", label: "Wedding planner", plural: "Planner", group: "Prestataires" },
  { key: "OFFICIANT", label: "Officiant", plural: "Officiant", group: "Prestataires" },
  { key: "ROBE", label: "Robe de mariée", plural: "Robe", group: "Tenues & beauté" },
  { key: "COSTUME", label: "Costume", plural: "Costume", group: "Tenues & beauté" },
  { key: "COIFFURE", label: "Coiffure", plural: "Coiffure", group: "Tenues & beauté" },
  { key: "MAQUILLAGE", label: "Maquillage", plural: "Maquillage", group: "Tenues & beauté" },
  { key: "ALLIANCES", label: "Alliances", plural: "Alliances", group: "Tenues & beauté" },
  { key: "ACCESSOIRES", label: "Accessoires", plural: "Accessoires", group: "Tenues & beauté" },
  { key: "PAPETERIE", label: "Papeterie", plural: "Papeterie", group: "Invités & extras" },
  { key: "SITE_INVITES", label: "Site & invités", plural: "Invités", group: "Invités & extras" },
  { key: "CADEAUX", label: "Liste / cadeaux", plural: "Cadeaux", group: "Invités & extras" },
  { key: "ANIMATION", label: "Animations", plural: "Animations", group: "Invités & extras" },
  { key: "TRANSPORT", label: "Transport", plural: "Transport", group: "Invités & extras" },
  { key: "ENFANTS", label: "Garde d'enfants", plural: "Enfants", group: "Invités & extras" },
  { key: "LUNE_DE_MIEL", label: "Lune de miel", plural: "Lune de miel", group: "Invités & extras" },
  { key: "AUTRE", label: "Autre", plural: "Autre", group: "Invités & extras" },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
);

export const CATEGORY_GROUPS = [
  "Lieu & réception",
  "Prestataires",
  "Tenues & beauté",
  "Invités & extras",
];

// Catégories qui affichent les champs détaillés "lieu" (capacité, couchages,
// traiteur, hébergement) en plus du prix.
export function isVenueLike(cat: string): boolean {
  return cat === "LIEU" || cat === "HEBERGEMENT";
}
