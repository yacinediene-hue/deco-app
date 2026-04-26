import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RecommendationEngine } from "@/lib/recommendation-engine";
import type { RecommendationInput } from "@/types/recommendation";

export async function POST(req: Request) {
  let body: RecommendationInput;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { furnitureType, dominantColor, room, style, budgetFcfa } = body;

  if (!furnitureType || !dominantColor || !room || !style || budgetFcfa == null) {
    return NextResponse.json(
      { error: "Champs requis : furnitureType, dominantColor, room, style, budgetFcfa" },
      { status: 422 }
    );
  }

  try {
    const engine = new RecommendationEngine(prisma);
    const result = await engine.recommend(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[recommendations]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
