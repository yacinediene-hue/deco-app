"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const TYPE_OPTIONS = ["tapis", "rideaux", "coussins", "luminaire", "table_basse", "papier_peint", "objet_mural", "console", "accessoires"];
const BUDGET_OPTIONS = [{ value: "bas", label: "Économique (< 500 000 FCFA)" }, { value: "moyen", label: "Intermédiaire (500k – 1,5M)" }, { value: "eleve", label: "Premium (> 1,5M FCFA)" }];
const STYLE_OPTIONS = ["moderne", "chic", "minimaliste", "africain", "boheme", "luxe"];

export interface CatalogFormData {
  name: string;
  type: string;
  styles: string[];
  colors: string[];
  priceFcfa: string;
  budgetLevel: string;
  imageUrl: string;
  description: string;
  externalUrl: string;
  available: boolean;
  inStock: boolean;
}

const EMPTY: CatalogFormData = {
  name: "", type: "tapis", styles: [], colors: [],
  priceFcfa: "", budgetLevel: "bas",
  imageUrl: "", description: "", externalUrl: "",
  available: true, inStock: true,
};

interface Props {
  initial?: Partial<CatalogFormData>;
  onSubmit: (data: CatalogFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}

export default function CatalogForm({ initial, onSubmit, onDelete, submitLabel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CatalogFormData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CatalogFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleArray = (field: "styles" | "colors", value: string) =>
    set(field, form[field].includes(value)
      ? form[field].filter((v) => v !== value)
      : [...form[field], value]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm("Supprimer ce produit définitivement ?")) return;
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      {/* Nom */}
      <div>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Nom *</label>
        <input required value={form.name} onChange={(e) => set("name", e.target.value)}
          className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
          placeholder="Tapis berbère ivoire" />
      </div>

      {/* Type + Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Type *</label>
          <select required value={form.type} onChange={(e) => set("type", e.target.value)}
            className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm bg-white outline-none">
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Budget *</label>
          <select required value={form.budgetLevel} onChange={(e) => set("budgetLevel", e.target.value)}
            className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-3 text-sm bg-white outline-none">
            {BUDGET_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
      </div>

      {/* Prix */}
      <div>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Prix (FCFA) *</label>
        <input required type="number" min="0" value={form.priceFcfa} onChange={(e) => set("priceFcfa", e.target.value)}
          className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
          placeholder="85000" />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Description</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white resize-none"
          placeholder="Description courte du produit" />
      </div>

      {/* Styles compatibles */}
      <div>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Styles compatibles</label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((s) => (
            <button key={s} type="button" onClick={() => toggleArray("styles", s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                ${form.styles.includes(s) ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lien externe */}
      <div>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Lien d&apos;achat (URL)</label>
        <input type="url" value={form.externalUrl} onChange={(e) => set("externalUrl", e.target.value)}
          className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
          placeholder="https://…" />
      </div>

      {/* Image URL */}
      <div>
        <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">URL image</label>
        <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
          className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
          placeholder="https://…" />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        {[
          { field: "available" as const, label: "Disponible" },
          { field: "inStock" as const, label: "En stock" },
        ].map(({ field, label }) => (
          <label key={field} className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => set(field, !form[field])}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5
                ${form[field] ? "bg-stone-900" : "bg-stone-200"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${form[field] ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-stone-600">{label}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} fullWidth>
          {saving ? "Enregistrement…" : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/catalog")}>
          Annuler
        </Button>
        {onDelete && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="text-sm text-red-400 hover:text-red-600 disabled:opacity-50 px-2">
            {deleting ? "…" : "Supprimer"}
          </button>
        )}
      </div>
    </form>
  );
}
