import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const simulations = await prisma.simulation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      furnitureType: true,
      dominantColor: true,
      style: true,
      budgetLevel: true,
      totalFcfa: true,
      createdAt: true,
    },
  });

  return NextResponse.json(simulations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { furnitureType, dominantColor, style, budgetFcfa, budgetLevel, accessories, totalFcfa } = body;

  const FURNITURE_LABELS: Record<string, string> = {
    canape: "Canapé", lit: "Lit", fauteuil: "Fauteuil", table: "Table", bureau: "Bureau",
  };
  const title = `${FURNITURE_LABELS[furnitureType] ?? furnitureType} ${style} — ${new Date().toLocaleDateString("fr-FR")}`;

  const simulation = await prisma.simulation.create({
    data: {
      userId: session.user.id,
      title,
      furnitureType,
      dominantColor,
      style,
      budgetFcfa,
      budgetLevel,
      accessories,
      totalFcfa,
    },
  });

  return NextResponse.json(simulation, { status: 201 });
}
