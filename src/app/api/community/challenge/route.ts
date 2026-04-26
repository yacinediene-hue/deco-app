import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const challenge = await prisma.monthlyChallenge.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      submissions: {
        orderBy: { votes: "desc" },
        take: 10,
      },
    },
  });

  return NextResponse.json(challenge);
}
