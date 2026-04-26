import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.user.id } },
  });

  if (existing) {
    // Unlike
    await prisma.postLike.delete({ where: { id: existing.id } });
    await prisma.communityPost.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
    return NextResponse.json({ liked: false });
  }

  await prisma.postLike.create({ data: { postId: id, userId: session.user.id } });
  await prisma.communityPost.update({ where: { id }, data: { likesCount: { increment: 1 } } });
  return NextResponse.json({ liked: true });
}
