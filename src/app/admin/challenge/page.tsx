"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/toast";

const STYLE_OPTIONS = [
  "", "moderne", "chic", "minimaliste", "boheme", "luxe",
  "sahel_chic", "wax_moderne", "bantou_minimaliste", "bogolan_urbain",
];

export default function AdminChallengePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    theme: "",
    hashtag: "#DefiDeco",
    budgetFcfa: "",
    style: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split("T")[0],
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Défi créé et activé !", "success");
      router.push("/admin/community");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Créer un défi mensuel 🏆</h1>
        <p className="text-stone-500 text-sm mt-1">Le défi précédent sera automatiquement désactivé.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {[
          { key: "title",       label: "Titre *",       placeholder: "Relooke ton salon pour 100 000 FCFA" },
          { key: "description", label: "Description *",  placeholder: "Transforme ton espace avec un budget limité…" },
          { key: "theme",       label: "Thème *",        placeholder: "Budget maîtrisé" },
          { key: "hashtag",     label: "Hashtag *",      placeholder: "#DefiDecoAvril" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{label}</label>
            <input
              required={label.endsWith("*")}
              value={(form as Record<string, string>)[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Budget max (FCFA)</label>
            <input
              type="number"
              value={form.budgetFcfa}
              onChange={(e) => set("budgetFcfa", e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
              placeholder="100000"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Style imposé</label>
            <select
              value={form.style}
              onChange={(e) => set("style", e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm bg-white outline-none"
            >
              {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s || "Libre"}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Début *</label>
            <input
              required type="date" value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Fin *</label>
            <input
              required type="date" value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none bg-white"
            />
          </div>
        </div>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? "Création…" : "🏆 Créer et activer le défi"}
        </Button>
      </form>
    </main>
  );
}
