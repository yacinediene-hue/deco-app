import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const item = await prisma.accessoryCatalog.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const body = await req.json();

  const item = await prisma.accessoryCatalog.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      styles: body.styles ?? [],
      colors: body.colors ?? [],
      priceFcfa: parseInt(body.priceFcfa),
      budgetLevel: body.budgetLevel,
      imageUrl: body.imageUrl ?? null,
      description: body.description ?? null,
      externalUrl: body.externalUrl ?? null,
      available: body.available ?? true,
      inStock: body.inStock ?? true,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  await prisma.accessoryCatalog.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
