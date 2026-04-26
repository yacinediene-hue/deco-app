import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { ensureReferralCode } from "@/lib/referral";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const code = await ensureReferralCode(session.user.id);

  const [referralCount, aiCredits] = await Promise.all([
    prisma.referral.count({ where: { referrerId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { aiCredits: true } }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.json({
    code,
    referralCount,
    aiCredits: aiCredits?.aiCredits ?? 3,
    shareUrl: `${appUrl}/auth/register?ref=${code}`,
  });
}
