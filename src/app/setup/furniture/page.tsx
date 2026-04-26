"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import Button from "@/components/ui/Button";
import type { DominantColor, FurnitureType } from "@/types/recommendation";

const STEPS = ["Photo", "Meuble", "Style", "Résultats"];

const FURNITURE_TYPES: { id: FurnitureType; label: string; emoji: string }[] = [
  { id: "canape",   label: "Canapé",   emoji: "🛋️" },
  { id: "lit",      label: "Lit",      emoji: "🛏️" },
  { id: "fauteuil", label: "Fauteuil", emoji: "🪑" },
  { id: "table",    label: "Table",    emoji: "🍽️" },
  { id: "bureau",   label: "Bureau",   emoji: "💼" },
];

const COLORS: { id: DominantColor; label: string; hex: string }[] = [
  { id: "beige",     label: "Beige",      hex: "#C8A882" },
  { id: "bleu_nuit", label: "Bleu nuit",  hex: "#1B2B4B" },
  { id: "vert_olive",label: "Vert olive", hex: "#6B7A3A" },
  { id: "gris",      label: "Gris",       hex: "#9CA3AF" },
  { id: "marron",    label: "Marron",     hex: "#7C4B2A" },
  { id: "blanc",     label: "Blanc",      hex: "#F5F0E8" },
];

export default function FurniturePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<FurnitureType | null>(null);
  const [color, setColor] = useState<DominantColor | null>(null);
  const [width, setWidth] = useState("");
  const [furniturePreview, setFurniturePreview] = useState<string | null>(null);

  const canContinue = type && color;

  const handleFurnitureFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      sessionStorage.setItem("furnitureImage", dataUrl);
      sessionStorage.setItem("furnitureMime", file.type);
      setFurniturePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (!canContinue) return;
    const params = new URLSearchParams({ type, color, ...(width ? { width } : {}) });
    router.push(`/setup/style?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex flex-col max-w-lg mx-auto px-4 pb-10">
      <StepIndicator current={2} total={4} labels={STEPS} />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Ton meuble principal</h1>
        <p className="text-stone-500 text-sm mt-1">Quel meuble vas-tu placer dans la pièce ?</p>
      </div>

      {/* Type de meuble */}
      <section className="mb-7">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Type</h2>
        <div className="grid grid-cols-5 gap-2">
          {FURNITURE_TYPES.map((f) => (
            <button
              key={f.id}
              onClick={() => setType(f.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                ${type === f.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"}`}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="text-[10px] font-medium">{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Couleur dominante */}
      <section className="mb-7">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Couleur dominante</h2>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all
                ${color === c.id ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white hover:border-stone-300"}`}
            >
              <span
                className="w-5 h-5 rounded-full border border-stone-200 flex-shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <span className={`text-xs font-medium ${color === c.id ? "text-stone-900" : "text-stone-600"}`}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Photo du meuble (optionnel) */}
      <section className="mb-7">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Photo du meuble <span className="text-stone-300 font-normal normal-case">(optionnel — pour le rendu visuel)</span>
        </h2>
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-colors
            ${furniturePreview ? "p-2 border-stone-300" : "p-6 gap-2 border-stone-200 bg-white hover:border-stone-400"}`}
          onClick={() => inputRef.current?.click()}
        >
          {furniturePreview ? (
            <div className="relative w-full">
              <img src={furniturePreview} alt="Meuble" className="w-full rounded-xl object-contain max-h-40" />
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                onClick={(e) => { e.stopPropagation(); setFurniturePreview(null); sessionStorage.removeItem("furnitureImage"); }}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <p className="text-stone-500 text-xs text-center">Clique pour ajouter une photo du meuble</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFurnitureFile(e.target.files[0]); }}
        />
      </section>

      {/* Largeur (optionnel) */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Largeur du meuble <span className="text-stone-300 font-normal normal-case">(optionnel)</span>
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={20}
            max={600}
            placeholder="ex: 200"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
          />
          <span className="text-stone-400 text-sm whitespace-nowrap">cm</span>
        </div>
      </section>

      <Button fullWidth disabled={!canContinue} onClick={handleNext}>
        Continuer →
      </Button>
    </main>
  );
}
