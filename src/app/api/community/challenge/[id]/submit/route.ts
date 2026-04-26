import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { imageUrl, caption } = await req.json();

  if (!imageUrl) return NextResponse.json({ error: "imageUrl requis" }, { status: 422 });

  const submission = await prisma.challengeSubmission.create({
    data: { challengeId: id, userId: session.user.id, imageUrl, caption: caption ?? null },
  });

  return NextResponse.json(submission, { status: 201 });
}
