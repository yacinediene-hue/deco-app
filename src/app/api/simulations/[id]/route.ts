import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const simulation = await prisma.simulation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!simulation) {
    return NextResponse.json({ error: "Simulation introuvable" }, { status: 404 });
  }

  return NextResponse.json(simulation);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.simulation.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Simulation introuvable" }, { status: 404 });
  }

  await prisma.simulation.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
