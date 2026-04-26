import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? undefined;
  const budgetLevel = searchParams.get("budgetLevel") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const items = await prisma.accessoryCatalog.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(budgetLevel ? { budgetLevel } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const body = await req.json();
  const { name, type, styles, colors, priceFcfa, budgetLevel, imageUrl, description, externalUrl, available, inStock } = body;

  if (!name || !type || !priceFcfa || !budgetLevel) {
    return NextResponse.json({ error: "Champs requis : name, type, priceFcfa, budgetLevel" }, { status: 422 });
  }

  const item = await prisma.accessoryCatalog.create({
    data: {
      name,
      type,
      styles: styles ?? [],
      colors: colors ?? [],
      priceFcfa: parseInt(priceFcfa),
      budgetLevel,
      imageUrl: imageUrl ?? null,
      description: description ?? null,
      externalUrl: externalUrl ?? null,
      available: available ?? true,
      inStock: inStock ?? true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
