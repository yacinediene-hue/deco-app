"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/toast";

interface ReferralData {
  code: string;
  referralCount: number;
  aiCredits: number;
  shareUrl: string;
}

const BADGE_THRESHOLDS = [
  { count: 1,  label: "🌱 Débutant",    desc: "Premier filleul" },
  { count: 5,  label: "⭐ Ambassadeur", desc: "5 filleuls" },
  { count: 10, label: "🏆 Champion",    desc: "10 filleuls" },
  { count: 20, label: "👑 Légende",     desc: "20 filleuls" },
];

function currentBadge(count: number) {
  return [...BADGE_THRESHOLDS].reverse().find((b) => count >= b.count);
}

function nextBadge(count: number) {
  return BADGE_THRESHOLDS.find((b) => count < b.count);
}

export default function InvitePage() {
  const { toast } = useToast();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral/code")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    toast("Lien copié !", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!data) return;
    const text = `🏠 J'utilise DecoApp pour visualiser ma déco avant d'acheter !\n\nEssaie gratuitement avec mon lien :\n${data.shareUrl}\n\n#DecoApp #DecoAfrique`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      </main>
    );
  }

  if (!data?.code) {
    return (
      <main className="min-h-screen flex items-center justify-center max-w-lg mx-auto px-4">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Connecte-toi pour obtenir ton lien de parrainage.</p>
          <a href="/auth/login" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-semibold">Se connecter</a>
        </div>
      </main>
    );
  }

  const badge = currentBadge(data.referralCount);
  const next = nextBadge(data.referralCount);
  const progressToNext = next
    ? (data.referralCount / next.count) * 100
    : 100;

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Inviter des amis 🎁</h1>
        <p className="text-stone-500 text-sm mt-1">
          Partage ton lien — chaque ami inscrit te donne <strong>1 crédit IA gratuit</strong>.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
          <p className="text-2xl font-bold text-stone-900">{data.referralCount}</p>
          <p className="text-xs text-stone-400 mt-1">Filleuls</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{data.aiCredits}</p>
          <p className="text-xs text-amber-600 mt-1">Crédits IA</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
          <p className="text-xl font-bold text-stone-900">{badge?.label ?? "—"}</p>
          <p className="text-xs text-stone-400 mt-1">Badge</p>
        </div>
      </div>

      {/* Progression vers le prochain badge */}
      {next && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700">Prochain badge : {next.label}</span>
            <span className="text-xs text-stone-400">{data.referralCount}/{next.count}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-amber-500 transition-all"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">{next.count - data.referralCount} filleul(s) restant(s)</p>
        </div>
      )}

      {/* Lien de parrainage */}
      <div className="bg-stone-900 rounded-2xl p-5 mb-5">
        <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Ton code</p>
        <p className="text-2xl font-bold text-white tracking-widest mb-3">{data.code}</p>
        <div className="flex items-center gap-2 bg-stone-800 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-stone-300 truncate flex-1">{data.shareUrl}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
          >
            {copied ? "✓ Copié !" : "🔗 Copier le lien"}
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            📲 WhatsApp
          </button>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <h2 className="font-bold text-stone-900 mb-3">Comment ça marche ?</h2>
        <div className="flex flex-col gap-3">
          {[
            { icon: "📤", text: "Partage ton lien avec tes amis" },
            { icon: "✅", text: "Ton ami s'inscrit et crée sa première simulation" },
            { icon: "🎁", text: "Tu reçois automatiquement 1 crédit IA gratuit" },
            { icon: "🏆", text: "Débloque des badges selon ton nombre de filleuls" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <p className="text-sm text-stone-600">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <a href="/dashboard/referrals" className="text-sm text-stone-500 underline">
          Voir le classement des ambassadeurs →
        </a>
      </div>
    </main>
  );
}
