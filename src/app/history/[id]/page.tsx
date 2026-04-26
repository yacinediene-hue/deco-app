"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { usePdfExport } from "@/hooks/usePdfExport";
import type { AccessoryRecommendation } from "@/types/recommendation";

interface SimulationDetail {
  id: string;
  title: string | null;
  furnitureType: string;
  dominantColor: string;
  style: string;
  budgetFcfa: number;
  budgetLevel: string;
  accessories: AccessoryRecommendation[];
  totalFcfa: number;
  createdAt: string;
}

const ACCESSORY_LABELS: Record<string, string> = {
  tapis: "Tapis", rideaux: "Rideaux", coussins: "Coussins", luminaire: "Luminaire",
  table_basse: "Table basse", papier_peint: "Papier peint", objet_mural: "Objet mural",
  console: "Console", accessoires: "Accessoires",
};

const BUDGET_LABEL: Record<string, string> = {
  bas: "Économique", moyen: "Intermédiaire", eleve: "Premium",
};

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function SimulationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { exportPdf, exporting } = usePdfExport();

  const [sim, setSim] = useState<SimulationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/simulations/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => { if (data) setSim(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (notFound || !sim) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center max-w-lg mx-auto px-4 gap-4">
        <div className="text-5xl">🔍</div>
        <p className="text-stone-500 text-sm">Simulation introuvable.</p>
        <Button onClick={() => router.push("/history")}>← Retour à l&apos;historique</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      <button
        onClick={() => router.push("/history")}
        className="text-xs text-stone-400 hover:text-stone-700 mb-5 flex items-center gap-1"
      >
        ← Retour
      </button>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-stone-900">{sim.title ?? "Simulation"}</h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full capitalize">{sim.style}</span>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{BUDGET_LABEL[sim.budgetLevel]}</span>
          <span className="text-xs text-stone-400">≈ {formatFcfa(sim.totalFcfa)}</span>
        </div>
        <p className="text-[11px] text-stone-300 mt-1.5">
          {new Date(sim.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {(sim.accessories as AccessoryRecommendation[]).map((acc) => (
          <div key={acc.type} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="font-semibold text-stone-800 text-sm mb-2">
              {ACCESSORY_LABELS[acc.type] ?? acc.type}
            </p>

            {acc.colorSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {acc.colorSuggestions.map((s) => (
                  <span key={s} className="bg-amber-50 text-amber-800 text-xs px-2 py-0.5 rounded-full border border-amber-100">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {acc.catalogItems?.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {acc.catalogItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-medium text-stone-700">{item.name}</span>
                    <span className="text-xs font-semibold text-stone-600 whitespace-nowrap ml-2">
                      {formatFcfa(item.priceFcfa)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          fullWidth
          disabled={exporting}
          onClick={() => exportPdf({
            title: sim.title ?? `${sim.furnitureType} ${sim.style}`,
            decoStyle: sim.style,
            budgetLevel: sim.budgetLevel,
            totalFcfa: sim.totalFcfa,
            accessories: sim.accessories,
            date: new Date(sim.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
            }),
          })}
        >
          {exporting ? "Génération PDF…" : "⬇ Exporter en PDF"}
        </Button>
        <Button variant="secondary" fullWidth onClick={() => router.push("/")}>
          + Nouvelle simulation
        </Button>
      </div>
    </main>
  );
}
