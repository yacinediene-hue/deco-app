import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { PurchasePlanGenerator } from "@/lib/purchase-plan-generator";
import type { AccessoryRecommendation } from "@/types/recommendation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const session = await auth();
  const { monthlyBudgetFcfa, accessories, reminderEnabled = false } = await req.json();

  if (!monthlyBudgetFcfa || !accessories) {
    return NextResponse.json({ error: "monthlyBudgetFcfa et accessories requis" }, { status: 422 });
  }

  const generator = new PurchasePlanGenerator();
  const plan = generator.generate(accessories as AccessoryRecommendation[], monthlyBudgetFcfa);

  // Sauvegarder si authentifié
  if (session?.user?.id) {
    await prisma.purchasePlan.create({
      data: {
        userId: session.user.id,
        monthlyBudgetFcfa,
        months: plan.months as object[],
        totalFcfa: plan.totalFcfa,
        durationMonths: plan.durationMonths,
        reminderEnabled,
        startMonth: plan.startMonth,
        startYear: plan.startYear,
      },
    });

    // Email de confirmation + premier mois si rappel activé
    if (reminderEnabled && session.user.email) {
      const firstMonth = plan.months[0];
      const items = firstMonth?.items.map((i) =>
        `• ${i.item.name} — ${new Intl.NumberFormat("fr-FR").format(i.item.priceFcfa)} FCFA`
      ).join("<br/>") ?? "";

      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "DecoApp <noreply@decoapp.co>",
        to: [session.user.email],
        subject: `🗓️ Ton plan déco sur ${plan.durationMonths} mois est prêt !`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#1c1917;">Ton plan déco est prêt ! 🏠✨</h2>
            <p>Budget mensuel : <strong>${new Intl.NumberFormat("fr-FR").format(monthlyBudgetFcfa)} FCFA/mois</strong></p>
            <p>Durée : <strong>${plan.durationMonths} mois</strong> — Total estimé : <strong>${new Intl.NumberFormat("fr-FR").format(plan.totalFcfa)} FCFA</strong></p>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #fde68a;">
              <p style="margin:0;font-weight:700;color:#92400e;">📦 Ce mois-ci (${firstMonth?.label ?? ""}) :</p>
              <br/>${items}
              <p style="margin-top:8px;color:#92400e;font-weight:600;">Total : ${new Intl.NumberFormat("fr-FR").format(firstMonth?.totalFcfa ?? 0)} FCFA</p>
            </div>
            <p>Tu recevras un rappel au début de chaque mois.</p>
            <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
            <p style="font-size:12px;color:#a8a29e;">DecoApp · Première app déco pensée pour l'Afrique francophone</p>
          </div>
        `,
      }).catch(() => {});
    }
  }

  return NextResponse.json(plan, { status: 201 });
}

// Récupérer les plans de l'utilisateur
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const plans = await prisma.purchasePlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json(plans);
}
