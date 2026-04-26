"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import Button from "@/components/ui/Button";
import type { Style } from "@/types/recommendation";

const STEPS = ["Photo", "Meuble", "Style", "Résultats"];

const STYLES: { id: Style; label: string; emoji: string; desc: string; group?: string }[] = [
  { id: "moderne",          label: "Moderne",               emoji: "◼", desc: "Formes épurées, métal noir" },
  { id: "chic",             label: "Chic",                  emoji: "✦", desc: "Laiton, velours, marbre" },
  { id: "minimaliste",      label: "Minimaliste",            emoji: "—", desc: "Beige, blanc, bois clair" },
  { id: "boheme",           label: "Bohème",                emoji: "✿", desc: "Rotin, jute, lin, plantes" },
  { id: "luxe",             label: "Luxe discret",           emoji: "◇", desc: "Crème, doré doux" },
  // Afrique contemporaine
  { id: "sahel_chic",       label: "Sahel chic",             emoji: "🏜️", desc: "Sable, cuivre, bois clair", group: "africa" },
  { id: "wax_moderne",      label: "Wax moderne",            emoji: "🎨", desc: "Motifs wax, tons profonds", group: "africa" },
  { id: "bantou_minimaliste",label: "Bantou minimaliste",    emoji: "🪵", desc: "Ébène, terre cuite, lignes pures", group: "africa" },
  { id: "bogolan_urbain",   label: "Bogolan urbain",         emoji: "🧶", desc: "Noir, ocre, cotons africains", group: "africa" },
];

const BUDGETS = [
  { level: "bas",   label: "Économique",  range: "< 500 000 FCFA",             color: "bg-green-50 border-green-200", active: "border-green-600 bg-green-50" },
  { level: "moyen", label: "Intermédiaire",range: "500 000 – 1 500 000 FCFA",  color: "bg-amber-50 border-amber-200", active: "border-amber-600 bg-amber-50" },
  { level: "eleve", label: "Premium",     range: "> 1 500 000 FCFA",           color: "bg-rose-50 border-rose-200",   active: "border-rose-600 bg-rose-50" },
];

const BUDGET_AMOUNTS: Record<string, number> = {
  bas: 250_000,
  moyen: 900_000,
  eleve: 2_000_000,
};

function StyleButton({
  s, selected, onSelect, african = false,
}: {
  s: { id: Style; label: string; emoji: string; desc: string };
  selected: boolean;
  onSelect: (id: Style) => void;
  african?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(s.id)}
      className={`text-left p-4 rounded-xl border-2 transition-all
        ${selected
          ? african ? "border-amber-700 bg-amber-700 text-white" : "border-stone-900 bg-stone-900 text-white"
          : african ? "border-amber-100 bg-amber-50 hover:border-amber-300" : "border-stone-200 bg-white hover:border-stone-300"
        }`}
    >
      <div className="text-lg mb-1">{s.emoji}</div>
      <div className="font-semibold text-sm">{s.label}</div>
      <div className={`text-[11px] mt-0.5 leading-tight ${selected ? "text-stone-300" : african ? "text-amber-600" : "text-stone-400"}`}>
        {s.desc}
      </div>
    </button>
  );
}

function StylePageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [style, setStyle] = useState<Style | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = style && budget;

  const handleSubmit = async () => {
    if (!canContinue) return;
    setLoading(true);

    const furnitureType = params.get("type") ?? "canape";
    const dominantColor = params.get("color") ?? "beige";
    const widthCm = params.get("width") ? parseFloat(params.get("width")!) : null;

    // Récupérer ville/pays depuis le profil (silencieux)
    let city: string | undefined;
    let country: string | undefined;
    try {
      const profile = await fetch("/api/profile").then((r) => r.json());
      city = profile.city ?? undefined;
      country = profile.country ?? undefined;
    } catch {}

    const body = {
      furnitureType,
      dominantColor,
      room: "salon",
      style,
      budgetFcfa: BUDGET_AMOUNTS[budget],
      city,
      country,
    };

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      sessionStorage.setItem("recommendations", JSON.stringify(data));
      sessionStorage.setItem("furnitureWidthCm", widthCm?.toString() ?? "");

      // Sauvegarde en DB (silencieuse — ne bloque pas la navigation si échec)
      fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          furnitureType: body.furnitureType,
          dominantColor: body.dominantColor,
          style: body.style,
          budgetFcfa: body.budgetFcfa,
          budgetLevel: data.budgetLevel,
          accessories: data.accessories,
          totalFcfa: data.totalEstimateFcfa,
        }),
      }).catch(() => {});

      router.push("/results");
    } catch {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col max-w-lg mx-auto px-4 pb-10">
      <StepIndicator current={3} total={4} labels={STEPS} />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Style & budget</h1>
        <p className="text-stone-500 text-sm mt-1">Choisis l'ambiance que tu veux créer.</p>
      </div>

      {/* Styles */}
      <section className="mb-7">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Style</h2>

        {/* Styles universels */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {STYLES.filter((s) => !s.group).map((s) => (
            <StyleButton key={s.id} s={s} selected={style === s.id} onSelect={setStyle} />
          ))}
        </div>

        {/* Afrique contemporaine */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">🌍 Afrique contemporaine</span>
            <div className="flex-1 h-px bg-amber-100" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.filter((s) => s.group === "africa").map((s) => (
              <StyleButton key={s.id} s={s} selected={style === s.id} onSelect={setStyle} african />
            ))}
          </div>
        </div>
      </section>

      {/* Budget */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Budget total déco</h2>
        <div className="flex flex-col gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.level}
              onClick={() => setBudget(b.level)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all
                ${budget === b.level ? b.active : `${b.color} hover:opacity-80`}`}
            >
              <span className="font-semibold text-sm text-stone-800">{b.label}</span>
              <span className="text-xs text-stone-500">{b.range}</span>
            </button>
          ))}
        </div>
      </section>

      <Button fullWidth disabled={!canContinue || loading} onClick={handleSubmit}>
        {loading ? "Analyse en cours…" : "Voir mes recommandations →"}
      </Button>

      {loading && (
        <div className="mt-6 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-stone-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}
    </main>
  );
}

export default function StylePage() {
  return (
    <Suspense>
      <StylePageContent />
    </Suspense>
  );
}
