import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.postComment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Commentaire vide" }, { status: 422 });

  const comment = await prisma.postComment.create({
    data: { postId: id, userId: session.user.id, text: text.trim() },
  });

  return NextResponse.json(comment, { status: 201 });
}
