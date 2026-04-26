"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogItem } from "@/types/recommendation";

interface Props {
  item: CatalogItem;
  onReserve: (item: CatalogItem) => void;
}

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

const VENDOR_TYPE_LABEL: Record<string, string> = {
  artisan: "🎨 Artisan",
  boutique: "🏪 Boutique",
  marketplace: "🛒 Marché",
};

export default function ProductCard({ item, onReserve }: Props) {
  const [imgError, setImgError] = useState(false);

  const whatsappUrl = item.vendorContactWhatsapp
    ? `https://wa.me/${item.vendorContactWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé(e) par "${item.name}" à ${formatFcfa(item.priceFcfa)}. Pouvez-vous me donner plus d'informations ?`
      )}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {/* Image */}
      {item.imageUrl && !imgError ? (
        <div className="relative w-full h-36">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-stone-100 flex items-center justify-center">
          <span className="text-3xl text-stone-300">🛋️</span>
        </div>
      )}

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {item.isHandmade && (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-medium">
              ✋ Fait main
            </span>
          )}
          {item.tropicalFriendly && (
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-medium">
              🌴 Tropical
            </span>
          )}
          {item.city && (
            <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">
              📍 {item.city}
            </span>
          )}
        </div>

        {/* Nom + description */}
        <h3 className="font-semibold text-stone-800 text-sm leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-stone-400 mt-1 line-clamp-2">{item.description}</p>
        )}

        {/* Vendeur */}
        {item.vendorName && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-stone-500">
              {item.vendorType ? VENDOR_TYPE_LABEL[item.vendorType] ?? item.vendorType : ""}
            </span>
            {item.vendorType && <span className="text-stone-200">·</span>}
            <span className="text-xs font-medium text-stone-600 truncate">{item.vendorName}</span>
          </div>
        )}

        {/* Prix */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-stone-900">{formatFcfa(item.priceFcfa)}</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-green-700 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.118 1.528 5.849L.057 23.928a.5.5 0 0 0 .609.61l6.213-1.499A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.955 0-3.779-.567-5.32-1.547l-.38-.232-3.956.956.957-3.878-.255-.398A9.951 9.951 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </a>
          )}
          <button
            onClick={() => onReserve(item)}
            className="flex-1 text-xs font-semibold py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
