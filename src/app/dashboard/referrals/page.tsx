"use client";

import { useEffect, useState } from "react";

interface LeaderEntry {
  userId: string;
  name: string;
  count: number;
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function ReferralsDashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [myData, setMyData] = useState<{ referralCount: number; aiCredits: number; code: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/referral/leaderboard").then((r) => r.json()),
      fetch("/api/referral/code").then((r) => r.json()).catch(() => null),
    ]).then(([lb, me]) => {
      setLeaderboard(lb);
      if (me?.code) setMyData({ referralCount: me.referralCount, aiCredits: me.aiCredits, code: me.code });
      setLoading(false);
    });
  }, []);

  const currentMonth = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Top Ambassadeurs 🏆</h1>
        <p className="text-stone-500 text-sm mt-1 capitalize">{currentMonth}</p>
      </div>

      {/* Ma position */}
      {myData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-1">Ma position</p>
              <p className="text-sm font-bold text-stone-800">Code : {myData.code}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-700">{myData.referralCount}</p>
              <p className="text-xs text-amber-600">filleul(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
              💎 {myData.aiCredits} crédits IA
            </span>
            <a href="/invite" className="text-xs text-amber-700 underline font-medium">
              Inviter plus d'amis →
            </a>
          </div>
        </div>
      )}

      {/* Classement */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-stone-500 text-sm">Aucun parrainage ce mois-ci.</p>
          <p className="text-stone-400 text-xs mt-1">Sois le premier à parrainer un ami !</p>
          <a href="/invite" className="inline-block mt-4 bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
            Mon lien de parrainage →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaderboard.map((entry, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all
                  ${isTop3 ? "bg-white border-amber-100 shadow-sm" : "bg-white border-stone-100"}`}
              >
                <span className="text-2xl w-8 text-center">
                  {MEDAL[rank] ?? <span className="text-base font-bold text-stone-400">{rank}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isTop3 ? "text-stone-900" : "text-stone-700"}`}>
                    {entry.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${isTop3 ? "text-amber-600" : "text-stone-600"}`}>
                    {entry.count}
                  </span>
                  <p className="text-[10px] text-stone-400">filleul{entry.count > 1 ? "s" : ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
