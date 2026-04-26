import sharp from "sharp";

export type LightShape = "pendant" | "floor" | "table";

export interface LightingOptions {
  shape?: LightShape;
  color?: string; // hex de la lampe (défaut laiton)
  xPercent?: number;
  yPercent?: number;
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
}

function pendantSvg(cx: number, cy: number, W: number, H: number, r: number, g: number, b: number): string {
  const cordLen = Math.round(H * 0.18);
  const lampW = Math.round(W * 0.1);
  const lampH = Math.round(lampW * 0.7);
  const glowR = Math.round(lampW * 1.8);

  return `
    <!-- Halo lumineux -->
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,240,180,0.35)"/>
      <stop offset="100%" stop-color="rgba(255,240,180,0)"/>
    </radialGradient>
    <circle cx="${cx}" cy="${cy + cordLen + lampH}" r="${glowR}" fill="url(#glow)"/>
    <!-- Cordon -->
    <line x1="${cx}" y1="0" x2="${cx}" y2="${cy + cordLen}" stroke="rgb(${r},${g},${b})" stroke-width="2"/>
    <!-- Abat-jour (cône tronqué) -->
    <polygon points="${cx - lampW * 0.4},${cy + cordLen} ${cx + lampW * 0.4},${cy + cordLen} ${cx + lampW * 0.5},${cy + cordLen + lampH} ${cx - lampW * 0.5},${cy + cordLen + lampH}"
      fill="rgb(${r},${g},${b})"/>
    <!-- Reflet intérieur -->
    <polygon points="${cx - lampW * 0.38},${cy + cordLen + 2} ${cx + lampW * 0.38},${cy + cordLen + 2} ${cx + lampW * 0.42},${cy + cordLen + lampH - 2} ${cx - lampW * 0.42},${cy + cordLen + lampH - 2}"
      fill="rgba(255,240,180,0.25)"/>
    <!-- Culot -->
    <circle cx="${cx}" cy="${cy + cordLen + lampH}" r="${Math.round(lampW * 0.08)}" fill="rgba(0,0,0,0.4)"/>`;
}

function floorLampSvg(cx: number, cy: number, W: number, H: number, r: number, g: number, b: number): string {
  const baseY = Math.round(H * 0.9);
  const poleH = Math.round(H * 0.55);
  const shadeW = Math.round(W * 0.09);
  const shadeH = Math.round(shadeW * 0.65);
  const shadeY = baseY - poleH - shadeH;

  return `
    <!-- Pied -->
    <rect x="${cx - 3}" y="${baseY - poleH}" width="6" height="${poleH}" fill="rgb(${r},${g},${b})"/>
    <!-- Base -->
    <ellipse cx="${cx}" cy="${baseY}" rx="${Math.round(shadeW * 0.45)}" ry="${Math.round(shadeW * 0.12)}" fill="rgb(${r},${g},${b})"/>
    <!-- Halo -->
    <radialGradient id="glow2" cx="50%" cy="60%" r="50%">
      <stop offset="0%" stop-color="rgba(255,240,180,0.3)"/>
      <stop offset="100%" stop-color="rgba(255,240,180,0)"/>
    </radialGradient>
    <ellipse cx="${cx}" cy="${shadeY + shadeH}" rx="${Math.round(shadeW * 1.4)}" ry="${Math.round(shadeH * 1.2)}" fill="url(#glow2)"/>
    <!-- Abat-jour -->
    <polygon points="${cx - shadeW * 0.4},${shadeY} ${cx + shadeW * 0.4},${shadeY} ${cx + shadeW * 0.5},${shadeY + shadeH} ${cx - shadeW * 0.5},${shadeY + shadeH}"
      fill="rgb(${r},${g},${b})"/>
    <polygon points="${cx - shadeW * 0.38},${shadeY + 2} ${cx + shadeW * 0.38},${shadeY + 2} ${cx + shadeW * 0.42},${shadeY + shadeH - 2} ${cx - shadeW * 0.42},${shadeY + shadeH - 2}"
      fill="rgba(255,240,180,0.2)"/>`;
}

export class LightingService {
  async apply(roomBuffer: Buffer, opts: LightingOptions): Promise<Buffer> {
    const room = sharp(roomBuffer);
    const { width: W = 800, height: H = 600 } = await room.metadata();

    const color = opts.color ?? "#B8922A";
    const { r, g, b } = hexToRgb(color);
    const shape = opts.shape ?? "pendant";
    const cx = Math.round((W * (opts.xPercent ?? 50)) / 100);
    const cy = Math.round((H * (opts.yPercent ?? 5)) / 100);

    const body = shape === "floor"
      ? floorLampSvg(cx, cy, W, H, r, g, b)
      : pendantSvg(cx, cy, W, H, r, g, b);

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

    return room
      .composite([{ input: overlay, left: 0, top: 0, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
