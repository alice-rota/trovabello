import type { Prisma } from "@prisma/client";
import type { VenueFacts } from "./schema";
import { missingEssentials } from "./schema";

// Transforme des "faits" extraits par l'IA en données Prisma à écrire.
// Ne remplace que les valeurs non-nulles (on ne perd pas l'existant).
export function factsToUpdate(facts: VenueFacts): Prisma.VenueUpdateInput {
  const data: Prisma.VenueUpdateInput = {};
  const set = <K extends keyof Prisma.VenueUpdateInput>(
    key: K,
    val: unknown,
  ) => {
    if (val !== null && val !== undefined && val !== "")
      (data as Record<string, unknown>)[key as string] = val;
  };

  set("region", facts.region);
  set("country", facts.country);
  set("photoUrl", facts.photoUrl);
  set("price", facts.price);
  set("capacitySeated", facts.capacitySeated);
  set("capacityStanding", facts.capacityStanding);
  set("beds", facts.beds);
  set("priceVenue", facts.priceVenue);
  set("pricePerNightPerGuest", facts.pricePerNightPerGuest);
  if (facts.catererType && facts.catererType !== "UNKNOWN")
    set("catererType", facts.catererType);
  set("catererPricePerGuest", facts.catererPricePerGuest);
  set("minSpend", facts.minSpend);
  set("exclusivity", facts.exclusivity);
  set("availabilityNotes", facts.availabilityNotes);
  set("contactEmail", facts.contactEmail);
  set("contactPhone", facts.contactPhone);
  set("notes", facts.notes);

  return data;
}

export { missingEssentials };
