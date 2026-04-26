"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/toast";

interface Submission {
  id: string;
  imageUrl: string;
  caption: string | null;
  votes: number;
  createdAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  hashtag: string;
  budgetFcfa: number | null;
  style: string | null;
  startDate: string;
  endDate: string;
  submissions: Submission[];
}

function daysLeft(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000));
}

export default function ChallengePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/community/challenge")
      .then((r) => r.json())
      .then((d) => { setChallenge(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast("Connecte-toi pour participer.", "info"); return; }
    if (!challenge) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/challenge/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption }),
      });
      if (!res.ok) throw new Error();
      toast("Participation envoyée ! 🎉", "success");
      setShowForm(false);
      setImageUrl(""); setCaption("");
      // Rafraîchir
      const updated = await fetch("/api/community/challenge").then((r) => r.json());
      setChallenge(updated);
    } catch {
      toast("Erreur lors de la soumission.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <div className="h-48 bg-stone-100 rounded-2xl animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map((i) => <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center max-w-lg mx-auto px-4">
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-stone-500 text-sm">Aucun défi actif ce mois-ci.</p>
        <p className="text-stone-400 text-xs mt-1">Reviens bientôt !</p>
      </main>
    );
  }

  const remaining = daysLeft(challenge.endDate);

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      {/* Header défi */}
      <div className="bg-stone-900 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs bg-amber-500 text-white px-2.5 py-1 rounded-full font-semibold">
            🏆 Défi du mois
          </span>
          <span className="text-xs text-stone-400">{remaining} jour{remaining > 1 ? "s" : ""} restant{remaining > 1 ? "s" : ""}</span>
        </div>
        <h1 className="text-xl font-bold mb-2">{challenge.title}</h1>
        <p className="text-stone-300 text-sm mb-3">{challenge.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-stone-800 px-2.5 py-1 rounded-full text-amber-400 font-mono">
            {challenge.hashtag}
          </span>
          {challenge.budgetFcfa && (
            <span className="text-xs bg-stone-800 px-2.5 py-1 rounded-full text-stone-300">
              Budget max : {new Intl.NumberFormat("fr-FR").format(challenge.budgetFcfa)} FCFA
            </span>
          )}
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 w-full bg-amber-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          {showForm ? "Fermer" : "✨ Participer au défi"}
        </button>
      </div>

      {/* Formulaire participation */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 p-5 mb-5 flex flex-col gap-4">
          <h2 className="font-bold text-stone-900">Ta participation</h2>
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">URL de ton image *</label>
            <input
              required
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
              placeholder="https://…"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Génère d&apos;abord ton rendu sur la page principale, puis copie l&apos;URL de l&apos;image.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Légende</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white resize-none"
              placeholder={`Ma participation au ${challenge.hashtag} ✨`}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? "Envoi…" : "Soumettre ma participation"}
          </button>
        </form>
      )}

      {/* Top soumissions */}
      <h2 className="font-bold text-stone-900 mb-3">
        🏅 Top participations ({challenge.submissions.length})
      </h2>

      {challenge.submissions.length === 0 ? (
        <div className="text-center py-10 text-stone-400 text-sm">
          Sois le premier à participer ! 🎨
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {challenge.submissions.map((sub, i) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
              <div className="relative aspect-square">
                <Image src={sub.imageUrl} alt="Participation" fill className="object-cover" loading="lazy" />
                {i < 3 && (
                  <span className="absolute top-2 left-2 text-lg">
                    {["🥇", "🥈", "🥉"][i]}
                  </span>
                )}
              </div>
              {sub.caption && (
                <p className="text-xs text-stone-500 p-2 line-clamp-2">{sub.caption}</p>
              )}
              <p className="text-xs text-stone-400 px-2 pb-2">❤️ {sub.votes} votes</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
