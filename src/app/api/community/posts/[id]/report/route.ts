import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await prisma.communityPost.update({ where: { id }, data: { reported: true } });
  return NextResponse.json({ reported: true });
}
