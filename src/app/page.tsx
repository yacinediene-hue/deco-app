"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import Button from "@/components/ui/Button";

const STEPS = ["Photo", "Meuble", "Style", "Résultats"];

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      sessionStorage.setItem("roomImage", dataUrl);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleNext = () => {
    if (!preview) return;
    router.push("/setup/furniture");
  };

  return (
    <main className="min-h-screen flex flex-col max-w-lg mx-auto px-4 pb-10">
      <StepIndicator current={1} total={4} labels={STEPS} />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Photo de ta pièce</h1>
        <p className="text-stone-500 text-sm mt-1">
          Prends une photo de la pièce que tu veux décorer.
        </p>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-colors
          ${dragging ? "border-amber-500 bg-amber-50" : "border-stone-300 bg-white hover:border-stone-400"}
          ${preview ? "p-2" : "p-10 gap-3"}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="Aperçu pièce" className="w-full rounded-xl object-cover max-h-72" />
            <button
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/80"
              onClick={(e) => { e.stopPropagation(); setPreview(null); sessionStorage.removeItem("roomImage"); }}
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <div className="text-4xl">🏠</div>
            <p className="text-stone-600 font-medium text-sm text-center">
              Clique ou glisse une photo ici
            </p>
            <p className="text-stone-400 text-xs">JPG, PNG, WEBP — max 10 Mo</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      <div className="mt-8">
        <Button fullWidth disabled={!preview} onClick={handleNext}>
          Continuer →
        </Button>
      </div>
    </main>
  );
}
