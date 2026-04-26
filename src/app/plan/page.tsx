"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/toast";
import type { AccessoryRecommendation } from "@/types/recommendation";
import type { PurchasePlan, PurchaseMonth } from "@/lib/purchase-plan-generator";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

const PRIORITY_COLOR: Record<string, string> = {
  "Essentiels":    "bg-amber-50 text-amber-800 border-amber-200",
  "Confort":       "bg-blue-50 text-blue-800 border-blue-200",
  "Finitions":     "bg-green-50 text-green-800 border-green-200",
  "Touche finale": "bg-stone-100 text-stone-600 border-stone-200",
};

function MonthCard({ m, isFirst }: { m: PurchaseMonth; isFirst: boolean }) {
  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${isFirst ? "border-amber-400" : "border-stone-100"}`}>
      {isFirst && (
        <div className="bg-amber-400 px-4 py-1.5 flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">📦 Ce mois-ci</span>
        </div>
      )}
      <div className="bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-900">{m.label}</h3>
          <span className="text-sm font-bold text-stone-700">{formatFcfa(m.totalFcfa)}</span>
        </div>

        <div className="flex flex-col gap-2">
          {m.items.map((item) => (
            <div key={item.item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${PRIORITY_COLOR[item.priorityLabel] ?? "bg-stone-100 text-stone-500 border-stone-200"}`}>
                  {item.priorityLabel}
                </span>
                <span className="text-sm text-stone-700 truncate">{item.item.name}</span>
              </div>
              <span className="text-xs font-semibold text-stone-600 whitespace-nowrap">{formatFcfa(item.item.priceFcfa)}</span>
            </div>
          ))}
        </div>

        {m.budgetRemaining > 0 && (
          <p className="mt-3 text-xs text-green-600 font-medium">
            ✓ Reste {formatFcfa(m.budgetRemaining)} disponible ce mois-ci
          </p>
        )}
      </div>
    </div>
  );
}

export default function PlanPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [accessories, setAccessories] = useState<AccessoryRecommendation[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState("75000");
  const [reminder, setReminder] = useState(false);
  const [plan, setPlan] = useState<PurchasePlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("recommendations");
    if (!raw) { router.replace("/"); return; }
    const data = JSON.parse(raw);
    setAccessories(data.accessories ?? []);
  }, [router]);

  const generatePlan = async () => {
    if (!monthlyBudget || isNaN(Number(monthlyBudget))) {
      toast("Saisis un budget mensuel valide.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyBudgetFcfa: Number(monthlyBudget),
          accessories,
          reminderEnabled: reminder,
        }),
      });
      const data = await res.json();
      setPlan(data);
      if (reminder) toast("Rappels mensuels activés — vérifie ta boîte email !", "success");
    } catch {
      toast("Erreur lors de la génération du plan.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-xs text-stone-400 hover:text-stone-700 mb-3 flex items-center gap-1">
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-stone-900">Mon plan déco 🗓️</h1>
        <p className="text-stone-500 text-sm mt-1">Étale tes achats sur plusieurs mois selon ton budget.</p>
      </div>

      {/* Saisie budget mensuel */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-5">
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Budget mensuel disponible</label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="number"
            min={10000}
            step={5000}
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white font-semibold"
            placeholder="75000"
          />
          <span className="text-stone-500 text-sm font-medium whitespace-nowrap">FCFA / mois</span>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {[50000, 75000, 100000, 150000].map((v) => (
            <button
              key={v}
              onClick={() => setMonthlyBudget(String(v))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                ${monthlyBudget === String(v) ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400"}`}
            >
              {formatFcfa(v)}
            </button>
          ))}
        </div>

        {/* Rappel mensuel */}
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <div
            onClick={() => setReminder((v) => !v)}
            className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${reminder ? "bg-amber-500" : "bg-stone-200"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${reminder ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <div>
            <span className="text-sm font-medium text-stone-700">Rappel mensuel par email</span>
            <p className="text-xs text-stone-400">Reçois un email en début de mois avec tes achats prévus</p>
          </div>
        </label>

        <Button fullWidth disabled={loading || !accessories.length} onClick={generatePlan} className="mt-4">
          {loading ? "Génération…" : "Générer mon plan"}
        </Button>
      </div>

      {/* Plan généré */}
      {plan && (
        <div className="flex flex-col gap-4">
          {/* Résumé */}
          <div className="bg-stone-900 rounded-2xl p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Résumé du plan</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold">{plan.durationMonths}</p>
                <p className="text-xs text-stone-400">mois</p>
              </div>
              <div>
                <p className="text-lg font-bold">{formatFcfa(plan.totalFcfa)}</p>
                <p className="text-xs text-stone-400">total</p>
              </div>
              <div>
                <p className="text-lg font-bold">{formatFcfa(plan.monthlyBudgetFcfa)}</p>
                <p className="text-xs text-stone-400">/ mois</p>
              </div>
            </div>
          </div>

          {/* Mois */}
          {plan.months.map((m, i) => (
            <MonthCard key={m.month} m={m} isFirst={i === 0} />
          ))}

          <Button variant="secondary" fullWidth onClick={() => router.push("/results")}>
            ← Retour aux recommandations
          </Button>
        </div>
      )}
    </main>
  );
}
