import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInfoRequest } from "@/lib/email";
import { missingEssentials } from "@/lib/schema";

export const maxDuration = 60;

// GET /api/cron/relance - relance les domaines contactés sans réponse depuis 7j.
// Déclenché par Vercel Cron (voir vercel.json). Protégé par CRON_SECRET.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const venues = await prisma.venue.findMany({
    where: {
      status: "CONTACTED",
      contactEmail: { not: null },
      lastContacted: { lt: sevenDaysAgo },
    },
  });

  let relances = 0;
  for (const v of venues) {
    const missing = missingEssentials({
      price: v.price,
      availabilityNotes: v.availabilityNotes,
    });
    const r = await sendInfoRequest({
      venueId: v.id,
      venueName: v.name,
      to: v.contactEmail!,
      missing: missing.length ? missing : ["availabilityNotes"],
    });
    if (r.ok) {
      await prisma.venue.update({
        where: { id: v.id },
        data: { lastContacted: new Date() },
      });
      relances++;
    }
  }

  return NextResponse.json({ checked: venues.length, relances });
}
