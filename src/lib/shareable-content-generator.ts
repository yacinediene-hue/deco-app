import sharp from "sharp";
import { CloudinaryStorage } from "./image/cloudinary-storage";
import type { CatalogItem } from "@/types/recommendation";

interface ShareInput {
  beforeBuffer: Buffer;
  afterBuffer: Buffer;
  style: string;
  budgetFcfa: number;
  catalogItems?: CatalogItem[];
}

export interface ShareableContent {
  squareImageUrl: string;    // 1080×1080 split avant/après
  carouselUrls: string[];    // 5 slides 1080×1080
  shotstackRenderId?: string; // ID Shotstack pour la vidéo (async)
}

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

// Créer le watermark SVG
function watermarkSvg(w: number): string {
  return `<svg width="${w}" height="40" xmlns="http://www.w3.org/2000/svg">
    <text x="${w - 12}" y="28" font-family="sans-serif" font-size="20" font-weight="700"
      fill="rgba(255,255,255,0.7)" text-anchor="end">DecoApp ✨</text>
  </svg>`;
}

// Texte badge SVG
function badgeSvg(text: string, w: number, align: "left" | "right" = "left"): string {
  const x = align === "left" ? 16 : w - 16;
  const anchor = align === "left" ? "start" : "end";
  return `<svg width="${w}" height="60" xmlns="http://www.w3.org/2000/svg">
    <rect x="${align === "left" ? 10 : w - 130}" y="8" width="120" height="44"
      rx="8" fill="rgba(0,0,0,0.55)"/>
    <text x="${x}" y="36" font-family="sans-serif" font-size="22" font-weight="700"
      fill="white" text-anchor="${anchor}">${text}</text>
  </svg>`;
}

export class ShareableContentGenerator {
  private readonly storage = new CloudinaryStorage();

  // ── Image 1080×1080 split avant/après ────────────────────────────────────
  async generateSquareImage(input: ShareInput): Promise<Buffer> {
    const SIZE = 1080;
    const HALF = 540;

    const [left, right] = await Promise.all([
      sharp(input.beforeBuffer).resize(HALF, SIZE, { fit: "cover" }).toBuffer(),
      sharp(input.afterBuffer).resize(HALF, SIZE, { fit: "cover" }).toBuffer(),
    ]);

    const styleLabel = input.style.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const budgetLabel = formatFcfa(input.budgetFcfa);

    // Légende bas de l'image
    const captionSvg = `<svg width="${SIZE}" height="90" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="90" fill="rgba(28,25,23,0.75)"/>
      <text x="20" y="38" font-family="sans-serif" font-size="26" font-weight="700" fill="white">${styleLabel}</text>
      <text x="20" y="68" font-family="sans-serif" font-size="20" fill="rgba(255,255,255,0.8)">Budget : ${budgetLabel}</text>
      <text x="${SIZE - 20}" y="55" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.6)" text-anchor="end">DecoApp ✨</text>
    </svg>`;

    const dividerSvg = `<svg width="4" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="4" height="${SIZE}" fill="rgba(255,255,255,0.8)"/>
    </svg>`;

    return sharp({
      create: { width: SIZE, height: SIZE, channels: 3, background: "#1C1917" },
    })
      .composite([
        { input: left,                           left: 0,      top: 0 },
        { input: right,                          left: HALF,   top: 0 },
        { input: Buffer.from(dividerSvg),        left: HALF - 2, top: 0 },
        { input: Buffer.from(badgeSvg("AVANT", HALF)), left: 0, top: 0 },
        { input: Buffer.from(badgeSvg("APRÈS ✨", HALF, "right")), left: HALF, top: 0 },
        { input: Buffer.from(captionSvg),        left: 0,      top: SIZE - 90 },
        { input: Buffer.from(watermarkSvg(SIZE)), left: 0,     top: SIZE - 120 },
      ])
      .jpeg({ quality: 92 })
      .toBuffer();
  }

  // ── Carrousel 5 slides 1080×1080 ────────────────────────────────────────
  async generateCarousel(input: ShareInput): Promise<Buffer[]> {
    const SIZE = 1080;
    const slides: Buffer[] = [];

    // Slide 1 : rendu final
    const slide1 = await sharp(input.afterBuffer)
      .resize(SIZE, SIZE, { fit: "cover" })
      .composite([
        { input: Buffer.from(watermarkSvg(SIZE)), left: 0, top: SIZE - 50 },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();
    slides.push(slide1);

    // Slides 2-5 : produits du catalogue
    const items = (input.catalogItems ?? []).slice(0, 4);
    for (const item of items) {
      slides.push(await this.generateProductSlide(item, SIZE));
    }

    // Compléter si moins de 4 produits
    while (slides.length < 5) {
      slides.push(await this.generatePlaceholderSlide(slides.length, SIZE));
    }

    return slides.slice(0, 5);
  }

  private async generateProductSlide(item: CatalogItem, SIZE: number): Promise<Buffer> {
    const priceText = formatFcfa(item.priceFcfa);
    const vendorText = item.vendorName ? `📍 ${item.city ?? ""} · ${item.vendorName}` : "";

    const overlay = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="${SIZE}" fill="#F5F5F4"/>
      <rect x="0" y="${SIZE - 280}" width="${SIZE}" height="280" fill="rgba(28,25,23,0.85)"/>
      <text x="40" y="${SIZE - 210}" font-family="sans-serif" font-size="34" font-weight="700" fill="white">${item.name.slice(0, 30)}</text>
      ${item.description ? `<text x="40" y="${SIZE - 165}" font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.7)">${item.description.slice(0, 50)}</text>` : ""}
      <text x="40" y="${SIZE - 100}" font-family="sans-serif" font-size="42" font-weight="900" fill="white">${priceText}</text>
      ${vendorText ? `<text x="40" y="${SIZE - 55}" font-family="sans-serif" font-size="20" fill="rgba(255,255,255,0.6)">${vendorText}</text>` : ""}
      <text x="${SIZE - 40}" y="${SIZE - 20}" font-family="sans-serif" font-size="16" fill="rgba(255,255,255,0.5)" text-anchor="end">DecoApp</text>
    </svg>`;

    // Si le produit a une image, l'utiliser en fond
    if (item.imageUrl) {
      try {
        const imgRes = await fetch(item.imageUrl);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          return sharp(imgBuffer)
            .resize(SIZE, SIZE, { fit: "cover" })
            .composite([{ input: Buffer.from(overlay), left: 0, top: 0 }])
            .jpeg({ quality: 88 })
            .toBuffer();
        }
      } catch {}
    }

    // Fallback : fond coloré
    return sharp({
      create: { width: SIZE, height: SIZE, channels: 3, background: "#2C2A28" },
    })
      .composite([{ input: Buffer.from(overlay), left: 0, top: 0 }])
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  private async generatePlaceholderSlide(index: number, SIZE: number): Promise<Buffer> {
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${SIZE}" height="${SIZE}" fill="#3C3A38"/>
      <text x="${SIZE / 2}" y="${SIZE / 2}" font-family="sans-serif" font-size="28" fill="rgba(255,255,255,0.4)"
        text-anchor="middle" dominant-baseline="middle">Slide ${index + 1}</text>
    </svg>`;
    return sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
  }

  // ── Générer + uploader tout ───────────────────────────────────────────────
  async generate(input: ShareInput): Promise<{
    squareImageUrl: string;
    carouselUrls: string[];
    shotstackRenderId?: string;
  }> {
    const ts = Date.now();

    const [squareBuffer, carouselBuffers] = await Promise.all([
      this.generateSquareImage(input),
      this.generateCarousel(input),
    ]);

    const [squareImageUrl, ...carouselUrls] = await Promise.all([
      this.storage.upload(squareBuffer, `share-square-${ts}`, "decoapp/share"),
      ...carouselBuffers.map((b, i) =>
        this.storage.upload(b, `share-carousel-${ts}-${i}`, "decoapp/share")
      ),
    ]);

    // Vidéo Shotstack si les URLs source sont disponibles (after image via Cloudinary)
    let shotstackRenderId: string | undefined;
    try {
      const { ShotstackService } = await import("./shotstack");
      const shotstack = new ShotstackService();
      // Uploader les images source sur Cloudinary pour que Shotstack puisse les atteindre
      const beforeUrl = await this.storage.upload(input.beforeBuffer, `share-before-${ts}`, "decoapp/share");
      const afterUrl = squareImageUrl; // réutiliser l'image après déjà uploadée
      shotstackRenderId = await shotstack.submitRender({
        beforeImageUrl: beforeUrl,
        afterImageUrl: afterUrl,
        style: input.style,
        budgetFcfa: input.budgetFcfa,
      });
    } catch {
      // Shotstack optionnel — ne bloque pas si clé manquante
    }

    return { squareImageUrl, carouselUrls, shotstackRenderId };
  }
}
