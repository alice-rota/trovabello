import type { Venue } from "@prisma/client";

export type BudgetParams = {
  guests: number; // nombre d'invités
  nights: number; // nombre de nuits sur place
};

export type BudgetEstimate = {
  total: number | null;
  perGuest: number | null;
  breakdown: { label: string; amount: number }[];
  incomplete: boolean; // true si des données manquaient pour estimer
};

// Estime le coût total d'un mariage dans ce domaine pour N invités / N nuits.
export function estimateBudget(
  v: Pick<
    Venue,
    | "priceVenue"
    | "pricePerNightPerGuest"
    | "catererPricePerGuest"
    | "minSpend"
  >,
  p: BudgetParams,
): BudgetEstimate {
  const breakdown: { label: string; amount: number }[] = [];
  let incomplete = false;

  if (v.priceVenue != null) {
    breakdown.push({ label: "Location du lieu", amount: v.priceVenue });
  } else incomplete = true;

  if (v.pricePerNightPerGuest != null) {
    const amount = v.pricePerNightPerGuest * p.guests * p.nights;
    breakdown.push({ label: "Hébergement", amount });
  } else incomplete = true;

  if (v.catererPricePerGuest != null) {
    breakdown.push({
      label: "Traiteur",
      amount: v.catererPricePerGuest * p.guests,
    });
  } else incomplete = true;

  let total = breakdown.reduce((s, b) => s + b.amount, 0);
  // Respecte un éventuel minimum de dépense
  if (v.minSpend != null && total < v.minSpend) {
    breakdown.push({ label: "Ajustement minimum de dépense", amount: v.minSpend - total });
    total = v.minSpend;
  }

  if (breakdown.length === 0) {
    return { total: null, perGuest: null, breakdown: [], incomplete: true };
  }

  return {
    total,
    perGuest: p.guests > 0 ? Math.round(total / p.guests) : null,
    breakdown,
    incomplete,
  };
}

export function formatEUR(n: number | null | undefined): string {
  if (n == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
