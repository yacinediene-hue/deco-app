"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface SimulationSummary {
  id: string;
  title: string | null;
  furnitureType: string;
  dominantColor: string;
  style: string;
  budgetLevel: string;
  totalFcfa: number;
  createdAt: string;
}

const STYLE_EMOJI: Record<string, string> = {
  moderne: "◼", chic: "✦", minimaliste: "—", africain: "◈", boheme: "✿", luxe: "◇",
};

const BUDGET_LABEL: Record<string, string> = {
  bas: "Économique", moyen: "Intermédiaire", eleve: "Premium",
};

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function HistoryPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<SimulationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/simulations")
      .then((r) => r.json())
      .then((data) => { setSimulations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/simulations/${id}`, { method: "DELETE" });
    setSimulations((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mes simulations</h1>
        <p className="text-stone-500 text-sm mt-1">{simulations.length} simulation{simulations.length !== 1 ? "s" : ""} sauvegardée{simulations.length !== 1 ? "s" : ""}</p>
      </div>

      {simulations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="text-5xl">🏠</div>
          <p className="text-stone-500 text-sm">Aucune simulation pour l&apos;instant.</p>
          <Button onClick={() => router.push("/")}>Créer ma première simulation →</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/history/${sim.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{STYLE_EMOJI[sim.style] ?? "•"}</span>
                    <span className="font-semibold text-stone-800 text-sm truncate">
                      {sim.title ?? `${sim.furnitureType} ${sim.style}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full capitalize">
                      {sim.style}
                    </span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {BUDGET_LABEL[sim.budgetLevel]}
                    </span>
                    <span className="text-xs text-stone-400">
                      ≈ {formatFcfa(sim.totalFcfa)}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1.5">
                    {new Date(sim.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </Link>

                <button
                  onClick={() => handleDelete(sim.id)}
                  disabled={deleting === sim.id}
                  className="text-stone-300 hover:text-red-400 transition-colors p-1 flex-shrink-0 disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === sim.id ? "…" : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button variant="secondary" fullWidth onClick={() => router.push("/")}>
          + Nouvelle simulation
        </Button>
      </div>
    </main>
  );
}
