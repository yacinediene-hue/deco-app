import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

const STYLE_LABELS: Record<string, string> = {
  moderne: "Moderne", chic: "Chic", minimaliste: "Minimaliste",
  africain: "Africain contemporain", boheme: "Bohème", luxe: "Luxe discret",
  sahel_chic: "Sahel chic", wax_moderne: "Wax moderne",
  bantou_minimaliste: "Bantou minimaliste", bogolan_urbain: "Bogolan urbain",
};

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();

  const { squareImageUrl, carouselUrls, videoUrl, style, budgetFcfa, budgetLevel } = body;

  if (!squareImageUrl || !style || !budgetFcfa) {
    return NextResponse.json({ error: "squareImageUrl, style et budgetFcfa requis" }, { status: 422 });
  }

  const budgetFormatted = new Intl.NumberFormat("fr-FR").format(budgetFcfa) + " FCFA";
  const styleLabel = STYLE_LABELS[style] ?? style;
  const caption = `J'ai relooké mon salon avec DecoApp ✨ Budget : ${budgetFormatted}. Style : ${styleLabel}. #DecoApp #DecoAfrique`;

  // Expiration 30 jours
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const post = await prisma.shareablePost.create({
    data: {
      userId: session?.user?.id ?? null,
      squareImageUrl,
      carouselUrls: carouselUrls ?? [],
      videoUrl: videoUrl ?? null,
      style,
      budgetFcfa,
      budgetLevel: budgetLevel ?? "bas",
      caption,
      expiresAt,
    },
  });

  return NextResponse.json({
    id: post.id,
    caption: post.caption,
    shareUrl: `/share/${post.id}`,
    expiresAt: post.expiresAt,
  }, { status: 201 });
}
