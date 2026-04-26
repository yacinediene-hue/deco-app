import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const challenges = await prisma.monthlyChallenge.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return NextResponse.json(challenges);
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const { title, description, theme, hashtag, budgetFcfa, style, startDate, endDate } = await req.json();

  if (!title || !description || !theme || !hashtag || !startDate || !endDate) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 422 });
  }

  // Désactiver les défis actifs précédents
  await prisma.monthlyChallenge.updateMany({ where: { isActive: true }, data: { isActive: false } });

  const challenge = await prisma.monthlyChallenge.create({
    data: {
      title, description, theme, hashtag,
      budgetFcfa: budgetFcfa ? parseInt(budgetFcfa) : null,
      style: style || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    },
  });

  return NextResponse.json(challenge, { status: 201 });
}
