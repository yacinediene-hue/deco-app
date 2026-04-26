"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/ui/StepIndicator";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/toast";
import { usePdfExport } from "@/hooks/usePdfExport";
import type { RecommendationResult, AccessoryRecommendation } from "@/types/recommendation";

const STEPS = ["Photo", "Meuble", "Style", "Résultats"];

const ACCESSORY_LABELS: Record<string, string> = {
  tapis: "Tapis",
  rideaux: "Rideaux",
  coussins: "Coussins",
  luminaire: "Luminaire",
  table_basse: "Table basse",
  papier_peint: "Papier peint",
  objet_mural: "Objet mural",
  console: "Console",
  accessoires: "Accessoires",
};

const ACCESSORY_EMOJI: Record<string, string> = {
  tapis: "🪔",
  rideaux: "🪟",
  coussins: "🛋️",
  luminaire: "💡",
  table_basse: "🪵",
  papier_peint: "🖼️",
  objet_mural: "🎨",
  console: "🗄️",
  accessoires: "✨",
};

const BUDGET_LABEL: Record<string, string> = {
  bas: "Économique",
  moyen: "Intermédiaire",
  eleve: "Premium",
};

function formatFcfa(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function AccessoryCard({ acc }: { acc: AccessoryRecommendation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{ACCESSORY_EMOJI[acc.type] ?? "•"}</span>
          <span className="font-semibold text-stone-800">{ACCESSORY_LABELS[acc.type] ?? acc.type}</span>
        </div>
        <span className="text-stone-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-stone-50">
          {/* Couleurs recommandées */}
          {acc.colorSuggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Couleurs conseillées
              </p>
              <div className="flex flex-wrap gap-1.5">
                {acc.colorSuggestions.map((s) => (
                  <span key={s} className="bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-full border border-amber-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matériaux de style */}
          {acc.styleMaterials.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Matériaux style
              </p>
              <div className="flex flex-wrap gap-1.5">
                {acc.styleMaterials.map((m) => (
                  <span key={m} className="bg-stone-100 text-stone-600 text-xs px-2.5 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Produits catalogue */}
          {acc.catalogItems.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Suggestions produits
              </p>
              <div className="flex flex-col gap-2">
                {acc.catalogItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-stone-700 whitespace-nowrap ml-2">
                      {formatFcfa(item.priceFcfa)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Constantes déco ─────────────────────────────────────────────────────────

const CURTAIN_PRESETS = [
  { id: "solid",  label: "Plein",         emoji: "▐" },
  { id: "light",  label: "Léger",         emoji: "┃" },
  { id: "sheer",  label: "Voilage",       emoji: "│" },
  { id: "double", label: "Double rideau", emoji: "▐▐" },
];

const CURTAIN_COLORS = [
  { label: "Crème",     hex: "#E8DCC8" },
  { label: "Lin",       hex: "#C8A882" },
  { label: "Blanc",     hex: "#F5F0E8" },
  { label: "Gris",      hex: "#B8BEC7" },
  { label: "Bordeaux",  hex: "#8B2040" },
  { label: "Bleu nuit", hex: "#1B2B4B" },
];

const CUSHION_COLORS = [
  { label: "Moutarde",  hex: "#D4A017" },
  { label: "Terracotta",hex: "#C0603A" },
  { label: "Vert sauge",hex: "#8FAF8A" },
  { label: "Bleu",      hex: "#4A6FA5" },
  { label: "Crème",     hex: "#E8DCC8" },
  { label: "Bordeaux",  hex: "#8B2040" },
];

const LIGHT_OPTIONS = [
  { shape: "pendant", color: "#B8922A", label: "Laiton suspendu" },
  { shape: "pendant", color: "#1A1A1A", label: "Noir mat" },
  { shape: "floor",   color: "#B8922A", label: "Lampadaire laiton" },
  { shape: "floor",   color: "#7C4B2A", label: "Lampadaire bois" },
];

const RUG_COLORS = [
  { label: "Beige",      hex: "#C8A882" },
  { label: "Terracotta", hex: "#C0603A" },
  { label: "Gris",       hex: "#9CA3AF" },
  { label: "Bleu",       hex: "#4A6FA5" },
  { label: "Marron",     hex: "#7C4B2A" },
  { label: "Vert olive", hex: "#6B7A3A" },
];

const WALL_OPTIONS: { label: string; hex: string; pattern: string }[] = [
  { label: "Blanc cassé",  hex: "#F5F0E8", pattern: "plain" },
  { label: "Beige chaud",  hex: "#D4B896", pattern: "plain" },
  { label: "Gris doux",    hex: "#B8BEC7", pattern: "plain" },
  { label: "Bleu clair",   hex: "#A8C5DA", pattern: "plain" },
  { label: "Vert sauge",   hex: "#8FAF8A", pattern: "plain" },
  { label: "Terracotta",   hex: "#C07055", pattern: "plain" },
  { label: "Rayures",      hex: "#C8A882", pattern: "stripes_v" },
  { label: "Géométrique",  hex: "#7C8A9E", pattern: "geometric" },
];

function dataUrlToBlob(dataUrl: string, mime: string): Blob {
  const bytes = atob(dataUrl.split(",")[1]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export default function ResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { exportPdf, exporting } = usePdfExport();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [composedImage, setComposedImage] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  // Tapis
  const [rugImage, setRugImage] = useState<string | null>(null);
  const [rugLoading, setRugLoading] = useState(false);
  const [activeRug, setActiveRug] = useState<string | null>(null);

  // Papier peint
  const [wallAfter, setWallAfter] = useState<string | null>(null);
  const [wallBefore, setWallBefore] = useState<string | null>(null);
  const [wallLoading, setWallLoading] = useState(false);
  const [activeWall, setActiveWall] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(false);

  // Rideaux
  const [curtainImage, setCurtainImage] = useState<string | null>(null);
  const [curtainLoading, setCurtainLoading] = useState(false);
  const [activeCurtain, setActiveCurtain] = useState<string | null>(null);
  const [curtainColor, setCurtainColor] = useState("#E8DCC8");

  // Coussins
  const [cushionImage, setCushionImage] = useState<string | null>(null);
  const [cushionLoading, setCushionLoading] = useState(false);
  const [activeCushion, setActiveCushion] = useState<string | null>(null);

  // Luminaire
  const [lightImage, setLightImage] = useState<string | null>(null);
  const [lightLoading, setLightLoading] = useState(false);
  const [activeLight, setActiveLight] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("recommendations");
    const img = sessionStorage.getItem("roomImage");
    if (!raw) { router.replace("/"); return; }
    setResult(JSON.parse(raw));
    setRoomImage(img);
  }, [router]);

  const handleCompose = async () => {
    const roomDataUrl = sessionStorage.getItem("roomImage");
    const furnitureDataUrl = sessionStorage.getItem("furnitureImage");
    const furnitureMime = sessionStorage.getItem("furnitureMime") ?? "image/png";
    if (!roomDataUrl) { toast("Aucune photo de pièce trouvée.", "error"); return; }
    if (!furnitureDataUrl) { toast("Ajoute une photo du meuble à l'étape précédente.", "info"); return; }

    setComposing(true);
    try {
      const widthCm = sessionStorage.getItem("furnitureWidthCm");
      const form = new FormData();
      form.append("room", dataUrlToBlob(roomDataUrl, "image/jpeg"), "room.jpg");
      form.append("furniture", dataUrlToBlob(furnitureDataUrl, furnitureMime), "furniture.png");
      if (widthCm) form.append("widthCm", widthCm);
      const res = await fetch("/api/image/compose", { method: "POST", body: form });
      const data = await res.json();
      if (data.composedImageUrl) {
        setComposedImage(data.composedImageUrl);
        toast("Rendu généré !", "success");
      } else {
        toast(data.error ?? "Erreur lors de la composition.", "error");
      }
    } catch {
      toast("Erreur réseau. Vérifie tes clés API.", "error");
    } finally {
      setComposing(false);
    }
  };

  const callImageApi = async (
    endpoint: string,
    options: object,
    setLoading: (v: boolean) => void,
    setImage: (url: string) => void,
    label = "élément"
  ) => {
    const roomDataUrl = sessionStorage.getItem("roomImage");
    if (!roomDataUrl) { toast("Photo de pièce manquante.", "error"); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("room", dataUrlToBlob(roomDataUrl, "image/jpeg"), "room.jpg");
      form.append("options", JSON.stringify(options));
      const res = await fetch(endpoint, { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setImage(data.url);
      } else {
        toast(data.error ?? `Erreur lors de l'application : ${label}.`, "error");
      }
    } catch {
      toast(`Erreur réseau (${label}).`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCurtain = (preset: string) => {
    setActiveCurtain(preset + curtainColor);
    callImageApi("/api/image/curtain", { preset, color: curtainColor }, setCurtainLoading, setCurtainImage, "rideaux");
  };

  const handleCushion = (color: string) => {
    setActiveCushion(color);
    callImageApi("/api/image/cushion", { color, count: 2 }, setCushionLoading, setCushionImage, "coussins");
  };

  const handleLight = (shape: string, color: string) => {
    setActiveLight(shape + color);
    callImageApi("/api/image/lighting", { shape, color }, setLightLoading, setLightImage, "luminaire");
  };

  const handleRug = async (color: string) => {
    const roomDataUrl = sessionStorage.getItem("roomImage");
    if (!roomDataUrl) { toast("Photo de pièce manquante.", "error"); return; }
    setActiveRug(color);
    setRugLoading(true);
    try {
      const form = new FormData();
      form.append("room", dataUrlToBlob(roomDataUrl, "image/jpeg"), "room.jpg");
      form.append("options", JSON.stringify({ color }));
      const res = await fetch("/api/image/rug", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) setRugImage(data.url);
      else toast(data.error ?? "Erreur tapis.", "error");
    } catch {
      toast("Erreur réseau (tapis).", "error");
    } finally {
      setRugLoading(false);
    }
  };

  const handleWallpaper = async (hex: string, pattern: string) => {
    const roomDataUrl = sessionStorage.getItem("roomImage");
    if (!roomDataUrl) { toast("Photo de pièce manquante.", "error"); return; }
    setActiveWall(hex + pattern);
    setWallLoading(true);
    setShowBefore(false);
    try {
      const form = new FormData();
      form.append("room", dataUrlToBlob(roomDataUrl, "image/jpeg"), "room.jpg");
      form.append("options", JSON.stringify({ color: hex, pattern }));
      const res = await fetch("/api/image/wallpaper", { method: "POST", body: form });
      const data = await res.json();
      if (data.after) {
        setWallAfter(data.after);
        setWallBefore(data.before ?? roomDataUrl);
      } else {
        toast(data.error ?? "Erreur papier peint.", "error");
      }
    } catch {
      toast("Erreur réseau (papier peint).", "error");
    } finally {
      setWallLoading(false);
    }
  };

  if (!result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center max-w-lg mx-auto px-4 gap-4">
        <div className="text-5xl">🏠</div>
        <h1 className="text-xl font-bold text-stone-800">Aucune recommandation</h1>
        <p className="text-stone-500 text-sm text-center">
          Commence par uploader une photo de ta pièce.
        </p>
        <Button onClick={() => router.push("/")}>Démarrer →</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col max-w-lg mx-auto px-4 pb-10">
      <StepIndicator current={4} total={4} labels={STEPS} />

      <div className="mt-4 mb-5">
        <h1 className="text-2xl font-bold text-stone-900">Tes recommandations</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full capitalize">
            {result.input.style}
          </span>
          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
            {BUDGET_LABEL[result.budgetLevel]}
          </span>
          <span className="text-xs text-stone-400">
            ≈ {formatFcfa(result.totalEstimateFcfa)}
          </span>
        </div>
      </div>

      {(composedImage || roomImage) && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-stone-100 shadow-sm relative">
          <img
            src={composedImage ?? roomImage!}
            alt={composedImage ? "Rendu composé" : "Ta pièce"}
            className="w-full object-cover max-h-56"
          />
          {composedImage && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              ✦ Rendu IA
            </span>
          )}
        </div>
      )}

      {!composedImage && (
        <div className="mb-5">
          <button
            onClick={handleCompose}
            disabled={composing}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 rounded-2xl py-3 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            {composing ? "⏳ Composition en cours…" : "✦ Générer le rendu visuel (IA)"}
          </button>
          <p className="text-[11px] text-stone-400 text-center mt-1.5">
            Nécessite une photo du meuble à l'étape précédente
          </p>
        </div>
      )}

      <p className="text-sm text-stone-500 mb-4">{result.budgetDescription}</p>

      {/* ── Sélecteur tapis ── */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          🪔 Essayer un tapis
        </h2>
        <div className="flex gap-2 flex-wrap">
          {RUG_COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.label}
              disabled={rugLoading}
              onClick={() => handleRug(c.hex)}
              className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 disabled:opacity-50
                ${activeRug === c.hex ? "border-stone-900 scale-110" : "border-stone-200"}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {rugImage && (
            <button
              onClick={() => { setRugImage(null); setActiveRug(null); }}
              className="text-xs text-stone-400 underline self-center ml-1"
            >
              Effacer
            </button>
          )}
        </div>
        {rugLoading && <p className="text-xs text-stone-400 mt-1.5">⏳ Application du tapis…</p>}
      </section>

      {/* ── Sélecteur papier peint / mur ── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            🖼️ Changer la couleur des murs
          </h2>
          {wallAfter && (
            <button
              onClick={() => setShowBefore((v) => !v)}
              className="text-[11px] font-medium text-amber-600 underline"
            >
              {showBefore ? "Voir après" : "Voir avant"}
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {WALL_OPTIONS.map((w) => (
            <button
              key={w.label}
              title={w.label}
              disabled={wallLoading}
              onClick={() => handleWallpaper(w.hex, w.pattern)}
              className={`flex flex-col items-center gap-0.5 disabled:opacity-50`}
            >
              <span
                className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 block
                  ${activeWall === w.hex + w.pattern ? "border-stone-900 scale-110" : "border-stone-200"}`}
                style={{ backgroundColor: w.hex }}
              />
              <span className="text-[9px] text-stone-400 w-10 text-center leading-tight">{w.label}</span>
            </button>
          ))}
          {wallAfter && (
            <button
              onClick={() => { setWallAfter(null); setWallBefore(null); setActiveWall(null); }}
              className="text-xs text-stone-400 underline self-start mt-2 ml-1"
            >
              Effacer
            </button>
          )}
        </div>
        {wallLoading && <p className="text-xs text-stone-400 mt-1.5">⏳ Application en cours…</p>}
        {wallAfter && (
          <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 shadow-sm relative">
            <img
              src={showBefore ? (wallBefore ?? roomImage ?? "") : wallAfter}
              alt={showBefore ? "Avant" : "Après"}
              className="w-full object-cover max-h-52"
            />
            <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
              {showBefore ? "Avant" : "Après"}
            </span>
          </div>
        )}
      </section>

      {/* ── Rideaux ── */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">🪟 Rideaux</h2>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {CURTAIN_COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.label}
              onClick={() => setCurtainColor(c.hex)}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110
                ${curtainColor === c.hex ? "border-stone-900 scale-110" : "border-stone-200"}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CURTAIN_PRESETS.map((p) => (
            <button
              key={p.id}
              disabled={curtainLoading}
              onClick={() => handleCurtain(p.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-[11px] font-medium transition-all disabled:opacity-50
                ${activeCurtain === p.id + curtainColor ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"}`}
            >
              <span className="text-base">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
        {curtainLoading && <p className="text-xs text-stone-400 mt-1.5">⏳ Application rideaux…</p>}
        {curtainImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
            <img src={curtainImage} alt="Rideaux" loading="lazy" className="w-full object-cover max-h-52" />
          </div>
        )}
        {curtainImage && (
          <button onClick={() => { setCurtainImage(null); setActiveCurtain(null); }}
            className="text-xs text-stone-400 underline mt-1">Effacer</button>
        )}
      </section>

      {/* ── Coussins ── */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">🛋️ Coussins</h2>
        <div className="flex gap-2 flex-wrap">
          {CUSHION_COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.label}
              disabled={cushionLoading}
              onClick={() => handleCushion(c.hex)}
              className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 disabled:opacity-50
                ${activeCushion === c.hex ? "border-stone-900 scale-110" : "border-stone-200"}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {cushionImage && (
            <button onClick={() => { setCushionImage(null); setActiveCushion(null); }}
              className="text-xs text-stone-400 underline self-center ml-1">Effacer</button>
          )}
        </div>
        {cushionLoading && <p className="text-xs text-stone-400 mt-1.5">⏳ Application coussins…</p>}
        {cushionImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
            <img src={cushionImage} alt="Coussins" loading="lazy" className="w-full object-cover max-h-52" />
          </div>
        )}
      </section>

      {/* ── Luminaire ── */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">💡 Luminaire</h2>
        <div className="grid grid-cols-2 gap-2">
          {LIGHT_OPTIONS.map((l) => (
            <button
              key={l.label}
              disabled={lightLoading}
              onClick={() => handleLight(l.shape, l.color)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all disabled:opacity-50
                ${activeLight === l.shape + l.color ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"}`}
            >
              <span
                className="w-4 h-4 rounded-full border border-stone-300 flex-shrink-0"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </button>
          ))}
        </div>
        {lightLoading && <p className="text-xs text-stone-400 mt-1.5">⏳ Ajout luminaire…</p>}
        {lightImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
            <img src={lightImage} alt="Luminaire" loading="lazy" className="w-full object-cover max-h-52" />
          </div>
        )}
        {lightImage && (
          <button onClick={() => { setLightImage(null); setActiveLight(null); }}
            className="text-xs text-stone-400 underline mt-1">Effacer</button>
        )}
      </section>

      <div className="flex flex-col gap-3">
        {result.accessories.map((acc) => (
          <AccessoryCard key={acc.type} acc={acc} />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          fullWidth
          disabled={exporting}
          onClick={() => exportPdf({
            title: `${result.input.furnitureType} ${result.input.style}`,
            decoStyle: result.input.style,
            budgetLevel: result.budgetLevel,
            totalFcfa: result.totalEstimateFcfa,
            accessories: result.accessories,
            date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          })}
        >
          {exporting ? "Génération PDF…" : "⬇ Exporter en PDF"}
        </Button>
        <Button variant="secondary" fullWidth onClick={() => router.push("/")}>
          ← Recommencer
        </Button>
      </div>
    </main>
  );
}
