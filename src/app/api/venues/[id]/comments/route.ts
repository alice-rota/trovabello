import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/venues/:id/comments — liste les commentaires d'un domaine
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const comments = await prisma.venueComment.findMany({
    where: { venueId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

// POST /api/venues/:id/comments — ajoute un commentaire { body, author? }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await req.json().catch(() => ({}));
  const body = (data.body ?? "").trim();
  if (!body) {
    return NextResponse.json({ error: "Commentaire vide" }, { status: 400 });
  }
  const comment = await prisma.venueComment.create({
    data: { venueId: id, body, author: data.author?.trim() || null },
  });
  return NextResponse.json(comment);
}
