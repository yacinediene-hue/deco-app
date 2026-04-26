import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redeemReferralCode } from "@/lib/referral";

export async function POST(req: Request) {
  const { name, email, password, referralCode } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 422 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Mot de passe : 8 caractères minimum" }, { status: 422 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name ?? null, email, password: hashed, role: "USER" },
    select: { id: true, email: true, name: true },
  });

  // Traiter le code de parrainage si fourni
  if (referralCode && typeof referralCode === "string") {
    await redeemReferralCode(referralCode, user.id).catch(() => {});
  }

  return NextResponse.json(user, { status: 201 });
}
