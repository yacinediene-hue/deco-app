import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { roomType, widthCm, heightCm, depthCm } = body;

  if (!roomType) {
    return NextResponse.json({ error: "roomType requis" }, { status: 422 });
  }

  const room = await prisma.room.create({
    data: {
      userId: "anonymous",
      name: `${roomType} — scan iOS`,
      roomType,
    },
  });

  return NextResponse.json({
    id: room.id,
    roomType,
    dimensions: { widthCm, heightCm, depthCm },
  }, { status: 201 });
}
