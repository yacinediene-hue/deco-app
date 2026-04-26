import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, city: true, country: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { name, city, country } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name ?? undefined, city: city ?? null, country: country ?? null },
    select: { id: true, name: true, email: true, city: true, country: true },
  });

  return NextResponse.json(user);
}
