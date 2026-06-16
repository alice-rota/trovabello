import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/venues/:id/emails/:emailId — supprime un email
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; emailId: string }> },
) {
  const { emailId } = await params;
  await prisma.emailMessage.delete({ where: { id: emailId } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
