import sharp from "sharp";
import type { WallpaperOptions, WallpaperPattern } from "./types";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function buildPatternSvg(
  w: number,
  h: number,
  pattern: WallpaperPattern,
  r: number,
  g: number,
  b: number,
  opacity: number
): string {
  const alpha = (opacity / 255).toFixed(2);

  if (pattern === "stripes_v") {
    const stripeW = Math.round(w / 20);
    const stripes = Array.from({ length: 20 }, (_, i) =>
      `<rect x="${i * stripeW * 2}" y="0" width="${stripeW}" height="${h}" fill="rgba(${r},${g},${b},0.12)"/>`
    ).join("");
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="rgba(${r},${g},${b},${alpha})"/>
      ${stripes}
    </svg>`;
  }

  if (pattern === "stripes_h") {
    const stripeH = Math.round(h / 15);
    const stripes = Array.from({ length: 15 }, (_, i) =>
      `<rect x="0" y="${i * stripeH * 2}" width="${w}" height="${stripeH}" fill="rgba(${r},${g},${b},0.12)"/>`
    ).join("");
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="rgba(${r},${g},${b},${alpha})"/>
      ${stripes}
    </svg>`;
  }

  if (pattern === "geometric") {
    const size = Math.round(w / 12);
    const diamonds = [];
    for (let row = 0; row < Math.ceil(h / size) + 1; row++) {
      for (let col = 0; col < Math.ceil(w / size) + 1; col++) {
        const cx = col * size + (row % 2 === 0 ? 0 : size / 2);
        const cy = row * size;
        diamonds.push(
          `<polygon points="${cx},${cy - size / 3} ${cx + size / 3},${cy} ${cx},${cy + size / 3} ${cx - size / 3},${cy}" fill="rgba(255,255,255,0.08)"/>`
        );
      }
    }
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="rgba(${r},${g},${b},${alpha})"/>
      ${diamonds.join("")}
    </svg>`;
  }

  // plain
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="rgba(${r},${g},${b},${alpha})"/>
  </svg>`;
}

export class WallpaperService {
  async apply(
    roomBuffer: Buffer,
    opts: WallpaperOptions
  ): Promise<{ before: string; after: Buffer }> {
    const room = sharp(roomBuffer);
    const { width: roomW = 800, height: roomH = 600 } = await room.metadata();

    const heightPct = opts.heightPercent ?? 60;
    const wallH = Math.round((roomH * heightPct) / 100);
    const opacity = opts.opacity ?? 160;
    const pattern = opts.pattern ?? "plain";

    const { r, g, b } = hexToRgb(opts.color);
    const svgWall = buildPatternSvg(roomW, wallH, pattern, r, g, b, opacity);
    const wallBuffer = await sharp(Buffer.from(svgWall)).png().toBuffer();

    const after = await room
      .composite([{ input: wallBuffer, left: 0, top: 0, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const before = roomBuffer.toString("base64");
    return { before, after };
  }
}
