import sharp from "sharp";
import type { RugOptions } from "./types";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export class RugService {
  async apply(roomBuffer: Buffer, opts: RugOptions): Promise<Buffer> {
    const room = sharp(roomBuffer);
    const { width: roomW = 800, height: roomH = 600 } = await room.metadata();

    const widthPct = opts.widthPercent ?? 55;
    const xPct = opts.xPercent ?? 22;
    const yPct = opts.yPercent ?? 58;
    const opacity = opts.opacity ?? 220;

    const rugW = Math.round((roomW * widthPct) / 100);

    // Simulation de perspective : le tapis est plus large en bas, plus étroit en haut.
    // On crée un trapèze SVG qui donne l'illusion de profondeur.
    const rugH = Math.round(rugW * 0.35);
    const topW = Math.round(rugW * 0.65);
    const bottomW = rugW;
    const topOffset = Math.round((bottomW - topW) / 2);

    const { r, g, b } = hexToRgb(opts.color);

    // SVG trapèze — corps du tapis
    const borderPx = Math.max(4, Math.round(rugW * 0.025));
    const innerBorderPx = Math.max(2, Math.round(rugW * 0.012));

    // Coordonnées du trapèze
    const pts = (dTop: number, dBot: number) =>
      `${topOffset + dTop},${dTop} ${topOffset + topW - dTop},${dTop} ${bottomW - dBot},${rugH - dBot} ${dBot},${rugH - dBot}`;

    const svgRug = `<svg width="${rugW}" height="${rugH}" xmlns="http://www.w3.org/2000/svg">
      <!-- Corps du tapis -->
      <polygon points="${pts(0, 0)}" fill="rgb(${r},${g},${b})" opacity="${(opacity / 255).toFixed(2)}"/>
      <!-- Bordure externe -->
      <polygon points="${pts(borderPx, borderPx)}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="${borderPx}"/>
      <!-- Bordure interne décorative -->
      <polygon points="${pts(borderPx * 2, borderPx * 2)}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="${innerBorderPx}"/>
      <!-- Ombre sous le tapis -->
      <polygon points="${pts(0, 0)}" fill="rgba(0,0,0,0.08)" transform="translate(0, ${Math.round(rugH * 0.04)})"/>
    </svg>`;

    const rugBuffer = await sharp(Buffer.from(svgRug)).png().toBuffer();

    const left = Math.round((roomW * xPct) / 100);
    const top = Math.min(
      Math.round((roomH * yPct) / 100),
      roomH - rugH - 10
    );

    return room
      .composite([{ input: rugBuffer, left, top, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
