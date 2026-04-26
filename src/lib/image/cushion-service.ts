import sharp from "sharp";

export interface CushionOptions {
  color: string;       // hex
  count?: 1 | 2 | 3;
  xPercent?: number;   // centre horizontal (défaut 50)
  yPercent?: number;   // position verticale (défaut 68)
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
}

function cushionSvg(cx: number, cy: number, w: number, h: number, r: number, g: number, b: number): string {
  const rx = Math.round(w * 0.12);
  const x = cx - w / 2;
  const y = cy - h / 2;
  // Bouton central décoratif
  const btnR = Math.round(w * 0.06);
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="rgb(${r},${g},${b})"/>
    <rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="${rx - 2}"
      fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="${btnR}" fill="rgba(0,0,0,0.12)"/>
    <circle cx="${cx}" cy="${cy}" r="${Math.round(btnR * 0.5)}" fill="rgba(255,255,255,0.15)"/>
    <line x1="${x + Math.round(w * 0.15)}" y1="${cy}" x2="${cx - btnR - 2}" y2="${cy}" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
    <line x1="${cx + btnR + 2}" y1="${cy}" x2="${x + w - Math.round(w * 0.15)}" y2="${cy}" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
    <ellipse cx="${cx}" cy="${y + h + 4}" rx="${Math.round(w * 0.45)}" ry="${Math.round(h * 0.12)}"
      fill="rgba(0,0,0,0.12)"/>`;
}

export class CushionService {
  async apply(roomBuffer: Buffer, opts: CushionOptions): Promise<Buffer> {
    const room = sharp(roomBuffer);
    const { width: W = 800, height: H = 600 } = await room.metadata();

    const count = opts.count ?? 2;
    const cx = Math.round((W * (opts.xPercent ?? 50)) / 100);
    const cy = Math.round((H * (opts.yPercent ?? 68)) / 100);

    const cw = Math.round(W * 0.13);
    const ch = Math.round(cw * 0.72);
    const gap = Math.round(cw * 0.12);

    const { r, g, b } = hexToRgb(opts.color);

    const offsets: number[] = count === 1 ? [0] : count === 2 ? [-1, 1] : [-2, 0, 2];
    const cushions = offsets
      .map((o) => cushionSvg(cx + o * (cw + gap), cy, cw, ch, r, g, b))
      .join("\n");

    const svgW = W;
    const svgH = H;
    const svg = `<svg width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">${cushions}</svg>`;

    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

    return room
      .composite([{ input: overlay, left: 0, top: 0, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
