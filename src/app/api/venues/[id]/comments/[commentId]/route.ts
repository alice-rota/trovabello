import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/venues/:id/comments/:commentId — supprime un commentaire
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { commentId } = await params;
  await prisma.venueComment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
