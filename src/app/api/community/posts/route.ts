import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city    = searchParams.get("city")    ?? undefined;
  const style   = searchParams.get("style")   ?? undefined;
  const budget  = searchParams.get("budget")  ?? undefined;
  const cursor  = searchParams.get("cursor")  ?? undefined;
  const take    = 12;

  const posts = await prisma.communityPost.findMany({
    where: {
      isPublic: true,
      reported: false,
      ...(city   ? { city: { contains: city,   mode: "insensitive" } } : {}),
      ...(style  ? { style }  : {}),
      ...(budget ? { budgetLevel: budget } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: { _count: { select: { comments: true } } },
  });

  const hasMore = posts.length > take;
  const items = hasMore ? posts.slice(0, take) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { imageUrl, beforeUrl, style, budgetFcfa, budgetLevel, caption } = await req.json();
  if (!imageUrl || !style || !budgetFcfa || !caption) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 422 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { city: true, country: true },
  });

  const post = await prisma.communityPost.create({
    data: {
      userId: session.user.id,
      imageUrl,
      beforeUrl: beforeUrl ?? null,
      style,
      budgetFcfa,
      budgetLevel: budgetLevel ?? "bas",
      caption,
      city: user?.city ?? null,
      country: user?.country ?? null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
