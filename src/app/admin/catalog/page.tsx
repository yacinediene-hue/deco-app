"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CatalogItem {
  id: string;
  name: string;
  type: string;
  budgetLevel: string;
  priceFcfa: number;
  available: boolean;
  inStock: boolean;
  externalUrl: string | null;
}

const TYPE_OPTIONS = ["tapis", "rideaux", "coussins", "luminaire", "table_basse", "papier_peint", "objet_mural", "console", "accessoires"];
const BUDGET_OPTIONS = ["bas", "moyen", "eleve"];
const BUDGET_LABEL: Record<string, string> = { bas: "Éco", moyen: "Moyen", eleve: "Premium" };

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function AdminCatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (budgetFilter) params.set("budgetLevel", budgetFilter);
    if (search) params.set("search", search);

    fetch(`/api/admin/catalog?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [typeFilter, budgetFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setDeleting(id);
    await fetch(`/api/admin/catalog/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleting(null);
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Catalogue produits</h1>
          <p className="text-stone-500 text-sm mt-0.5">{items.length} produits</p>
        </div>
        <Link
          href="/admin/catalog/new"
          className="bg-stone-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors"
        >
          + Ajouter
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-stone-400 bg-white"
          />
          <button type="submit" className="bg-stone-100 text-stone-600 text-sm px-3 py-2 rounded-xl hover:bg-stone-200">
            →
          </button>
        </form>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">Tous types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={budgetFilter}
          onChange={(e) => setBudgetFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">Tous budgets</option>
          {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{BUDGET_LABEL[b]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Budget</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Prix</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400 text-sm">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.available ? "bg-green-400" : "bg-stone-300"}`} />
                      <span className="font-medium text-stone-800 truncate max-w-48">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500 hidden sm:table-cell">{item.type}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{BUDGET_LABEL[item.budgetLevel]}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-stone-700 whitespace-nowrap">{formatFcfa(item.priceFcfa)}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`text-xs font-medium ${item.inStock ? "text-green-600" : "text-red-400"}`}>
                      {item.inStock ? "✓" : "✗"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/catalog/${item.id}/edit`} className="text-xs text-stone-400 hover:text-stone-700 underline">
                        Éditer
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-xs text-red-300 hover:text-red-500 disabled:opacity-50"
                      >
                        {deleting === item.id ? "…" : "Suppr."}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
