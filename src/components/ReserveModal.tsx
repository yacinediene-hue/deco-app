"use client";

import { useState } from "react";
import type { CatalogItem } from "@/types/recommendation";

interface Props {
  item: CatalogItem;
  onClose: () => void;
}

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function ReserveModal({ item, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, productId: item.id, productName: item.name }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-bold text-stone-900">Demande envoyée !</h2>
            <p className="text-stone-500 text-sm">
              Le vendeur va te contacter dans les 24h pour confirmer ta réservation.
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-semibold"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Réserver ce produit</h2>
                <p className="text-sm text-stone-500 mt-0.5">{item.name} — <span className="font-semibold text-stone-800">{formatFcfa(item.priceFcfa)}</span></p>
              </div>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xl leading-none">✕</button>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-amber-700">
                🛒 MVP — La réservation envoie une demande au vendeur par email. Le paiement en ligne sera disponible prochainement (Wave, Orange Money).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Prénom *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
                  placeholder="Ton prénom"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Email *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
                  placeholder="toi@email.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">WhatsApp / Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-400 bg-white"
                  placeholder="+225 07 00 00 00"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-stone-700 transition-colors"
              >
                {sending ? "Envoi en cours…" : "Envoyer ma demande"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
