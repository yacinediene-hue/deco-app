"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/toast";

const COUNTRIES = [
  { code: "CI", label: "🇨🇮 Côte d'Ivoire" },
  { code: "SN", label: "🇸🇳 Sénégal" },
  { code: "CM", label: "🇨🇲 Cameroun" },
  { code: "BJ", label: "🇧🇯 Bénin" },
  { code: "TG", label: "🇹🇬 Togo" },
  { code: "GA", label: "🇬🇦 Gabon" },
  { code: "GN", label: "🇬🇳 Guinée" },
  { code: "ML", label: "🇲🇱 Mali" },
  { code: "BF", label: "🇧🇫 Burkina Faso" },
  { code: "FR", label: "🇫🇷 France" },
  { code: "OTHER", label: "Autre" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  CI: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Korhogo"],
  SN: ["Dakar", "Touba", "Thiès", "Saint-Louis", "Ziguinchor"],
  CM: ["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Garoua"],
  BJ: ["Cotonou", "Porto-Novo", "Parakou"],
  TG: ["Lomé", "Sokodé", "Kara"],
  GA: ["Libreville", "Port-Gentil"],
  GN: ["Conakry", "Nzérékoré"],
  ML: ["Bamako", "Sikasso", "Ségou"],
  BF: ["Ouagadougou", "Bobo-Dioulasso"],
  FR: ["Paris", "Lyon", "Marseille", "Bordeaux"],
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setCountry(data.country ?? "");
        setCity(data.city ?? "");
        setLoading(false);
      });
  }, []);

  const cities = CITIES_BY_COUNTRY[country] ?? [];
  const showCustomCity = city === "__custom__" || (city && !cities.includes(city));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalCity = city === "__custom__" ? customCity : city;
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city: finalCity || null, country: country || null }),
      });
      if (!res.ok) throw new Error();
      toast("Profil mis à jour ✓", "success");
      router.refresh();
    } catch {
      toast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mon profil</h1>
        <p className="text-stone-500 text-sm mt-1">
          Ta ville permet de filtrer les produits disponibles près de chez toi.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Prénom */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Prénom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
            placeholder="Ton prénom"
          />
        </div>

        {/* Pays */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Pays</label>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setCity(""); }}
            className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white outline-none"
          >
            <option value="">— Sélectionne ton pays</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Ville */}
        {country && (
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Ville</label>
            {cities.length > 0 ? (
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white outline-none"
              >
                <option value="">— Sélectionne ta ville</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">Autre ville…</option>
              </select>
            ) : (
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
                placeholder="Saisie ta ville"
              />
            )}
            {showCustomCity && cities.length > 0 && (
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="mt-2 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
                placeholder="Nom de ta ville"
                autoFocus
              />
            )}
          </div>
        )}

        {country && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <span className="text-amber-600 mt-0.5">🌍</span>
            <p className="text-xs text-amber-700">
              Les recommandations seront filtrées pour afficher en priorité les produits disponibles
              {city ? ` à ${city}` : ` dans ton pays`}.
              {["CI", "SN", "CM", "BJ", "TG", "GA", "GN"].includes(country) &&
                " Filtre tropical activé : produits résistants à l'humidité et à la chaleur."}
            </p>
          </div>
        )}

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? "Enregistrement…" : "Sauvegarder"}
        </Button>
      </form>
    </main>
  );
}
