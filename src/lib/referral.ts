import { prisma } from "./prisma";

// Génère un code court unique ex: DECO-A4K2P1
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DECO-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Attribue un code si l'utilisateur n'en a pas encore
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  // Générer un code unique (retry si collision)
  let code: string;
  let attempts = 0;
  do {
    code = generateReferralCode();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  await prisma.user.update({ where: { id: userId }, data: { referralCode: code! } });
  return code!;
}

// Traiter un parrainage lors de l'inscription d'un filleul
export async function redeemReferralCode(referralCode: string, refereeId: string): Promise<boolean> {
  const parrain = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });

  if (!parrain || parrain.id === refereeId) return false;

  // Vérifier que ce filleul n'a pas déjà été parrainé
  const existing = await prisma.referral.findUnique({ where: { refereeId } });
  if (existing) return false;

  // Créer la relation de parrainage
  await prisma.referral.create({
    data: { referrerId: parrain.id, refereeId, creditAwarded: true },
  });

  // Attribuer 1 crédit IA au parrain
  await prisma.user.update({
    where: { id: parrain.id },
    data: {
      aiCredits: { increment: 1 },
      referredBy: parrain.id, // marquer le filleul
    },
  });

  // Marquer le filleul comme parrainé
  await prisma.user.update({
    where: { id: refereeId },
    data: { referredBy: parrain.id },
  });

  return true;
}

// Classement mensuel des meilleurs parrains
export async function getMonthlyLeaderboard(limit = 10) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const referrals = await prisma.referral.groupBy({
    by: ["referrerId"],
    where: { createdAt: { gte: startOfMonth } },
    _count: { refereeId: true },
    orderBy: { _count: { refereeId: "desc" } },
    take: limit,
  });

  const enriched = await Promise.all(
    referrals.map(async (r) => {
      const user = await prisma.user.findUnique({
        where: { id: r.referrerId },
        select: { id: true, name: true, email: true },
      });
      return {
        userId: r.referrerId,
        name: user?.name ?? user?.email?.split("@")[0] ?? "Anonyme",
        count: r._count.refereeId,
      };
    })
  );

  return enriched;
}
