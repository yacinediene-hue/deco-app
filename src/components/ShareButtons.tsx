"use client";

import { useState } from "react";
import { useToast } from "@/contexts/toast";

interface Props {
  shareUrl: string;         // URL publique /share/:id
  caption: string;          // Légende pré-remplie
  imageUrl?: string;        // Image carrée pour la prévisualisation
  videoUrl?: string;        // Vidéo Shotstack
  onShare?: (platform: string) => void; // Callback tracking
}

function buildUtm(url: string, source: string): string {
  const u = new URL(url, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "share");
  u.searchParams.set("utm_campaign", "decoapp");
  return u.toString();
}

export default function ShareButtons({ shareUrl, caption, imageUrl, videoUrl, onShare }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const fullShareUrl = shareUrl.startsWith("http") ? shareUrl : `${appUrl}${shareUrl}`;

  const track = (platform: string) => onShare?.(platform);

  // WhatsApp — texte + lien
  const handleWhatsApp = () => {
    const text = `${caption}\n\n${buildUtm(fullShareUrl, "whatsapp")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    track("whatsapp");
  };

  // TikTok — deep link app mobile, fallback web
  const handleTikTok = () => {
    const videoToShare = videoUrl ?? imageUrl ?? fullShareUrl;
    const utmUrl = buildUtm(fullShareUrl, "tiktok");
    // Sur mobile, le deep link ouvre TikTok directement si installé
    const deepLink = `snssdk1233://share?content=${encodeURIComponent(videoToShare)}&description=${encodeURIComponent(caption + " " + utmUrl)}`;
    const webFallback = `https://www.tiktok.com/`;

    // Tenter le deep link, fallback immédiat
    const timeout = setTimeout(() => window.open(webFallback, "_blank"), 1500);
    try {
      window.location.href = deepLink;
      setTimeout(() => clearTimeout(timeout), 500);
    } catch {
      clearTimeout(timeout);
      window.open(webFallback, "_blank");
    }
    track("tiktok");
  };

  // Facebook
  const handleFacebook = () => {
    const utmUrl = buildUtm(fullShareUrl, "facebook");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(utmUrl)}`, "_blank", "width=600,height=400");
    track("facebook");
  };

  // Instagram — pas d'API web, on copie le lien pour que l'utilisateur partage manuellement
  const handleInstagram = async () => {
    const utmUrl = buildUtm(fullShareUrl, "instagram");
    await navigator.clipboard.writeText(utmUrl);
    toast("Lien copié ! Colle-le dans ta story Instagram.", "info");
    track("instagram");
  };

  // Copier le lien
  const handleCopyLink = async () => {
    const utmUrl = buildUtm(fullShareUrl, "copy");
    await navigator.clipboard.writeText(utmUrl);
    setCopied(true);
    toast("Lien copié !", "success");
    track("copy");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Partager</p>

      {/* Boutons principaux */}
      <div className="grid grid-cols-2 gap-2">
        {/* WhatsApp — priorité 1 */}
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
        >
          <WhatsAppIcon />
          WhatsApp
        </button>

        {/* TikTok */}
        <button
          onClick={handleTikTok}
          className="flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold py-3 rounded-xl hover:bg-stone-800 transition-colors"
        >
          <TikTokIcon />
          TikTok
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <FacebookIcon />
          Facebook
        </button>

        {/* Instagram */}
        <button
          onClick={handleInstagram}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          <InstagramIcon />
          Instagram
        </button>
      </div>

      {/* Copier le lien */}
      <button
        onClick={handleCopyLink}
        className="flex items-center justify-center gap-2 border border-stone-200 text-stone-700 text-sm font-medium py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
      >
        {copied ? "✓ Lien copié !" : "🔗 Copier le lien"}
      </button>

      <p className="text-[11px] text-stone-400 text-center">
        Chaque partage contient un lien de suivi pour mesurer la viralité.
      </p>
    </div>
  );
}

// ── Icônes SVG ───────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.118 1.528 5.849L.057 23.928a.5.5 0 00.609.61l6.213-1.499A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.22 8.22 0 004.81 1.55V6.79a4.86 4.86 0 01-1.04-.1z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
      <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}
