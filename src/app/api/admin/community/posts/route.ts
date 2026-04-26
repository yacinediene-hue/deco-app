import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// Liste des posts signalés pour modération
export async function GET() {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const reported = await prisma.communityPost.findMany({
    where: { reported: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(reported);
}

// Supprimer ou réhabiliter un post
export async function PATCH(req: Request) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const { id, action } = await req.json(); // action: "delete" | "restore"

  if (action === "delete") {
    await prisma.communityPost.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  }

  if (action === "restore") {
    await prisma.communityPost.update({ where: { id }, data: { reported: false } });
    return NextResponse.json({ restored: true });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
