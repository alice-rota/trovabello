// Helpers partagés UI (client) - pas d'import serveur ici.
export const COUNTRY_LABEL: Record<string, string> = {
  FR: "🇫🇷 France",
  IT: "🇮🇹 Italie",
};

export const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-paper-soft text-ink/50" },
  ENRICHED: {
    label: "Pré-rempli IA",
    color: "bg-paper text-ink/70 border border-ink/20",
  },
  CONTACTED: {
    label: "Email envoyé",
    color: "bg-wine/10 text-wine border border-wine/30",
  },
  REPLIED: { label: "Réponse reçue", color: "bg-wine text-paper" },
  COMPLETE: { label: "Complet", color: "bg-ink text-paper" },
};

export const CATERER_LABEL: Record<string, string> = {
  INCLUDED: "Inclus / maison",
  IMPOSED: "Imposé",
  FREE: "Libre",
  UNKNOWN: "-",
};

export function eur(n: number | null | undefined): string {
  if (n == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
