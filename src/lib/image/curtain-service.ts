import sharp from "sharp";

export type CurtainPreset = "solid" | "light" | "sheer" | "double";

export interface CurtainOptions {
  preset: CurtainPreset;
  color?: string; // hex, défaut crème
}

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
}

const PRESET_CONFIG: Record<CurtainPreset, { outerOpacity: number; innerOpacity: number; foldDepth: number }> = {
  solid:  { outerOpacity: 0.88, innerOpacity: 0,    foldDepth: 0.06 },
  light:  { outerOpacity: 0.55, innerOpacity: 0,    foldDepth: 0.04 },
  sheer:  { outerOpacity: 0.22, innerOpacity: 0,    foldDepth: 0.02 },
  double: { outerOpacity: 0.82, innerOpacity: 0.25, foldDepth: 0.05 },
};

function curtainPanel(
  x: number, y: number, w: number, h: number,
  side: "left" | "right",
  r: number, g: number, b: number,
  opacity: number, foldDepth: number
): string {
  const fd = Math.round(w * foldDepth);
  // Forme du rideau avec replis simulés (bezier)
  const folds = side === "left"
    ? `M ${x},${y} Q ${x + fd},${y + h * 0.25} ${x},${y + h * 0.5} Q ${x + fd},${y + h * 0.75} ${x},${y + h} L ${x + w},${y + h} L ${x + w},${y} Z`
    : `M ${x + w},${y} Q ${x + w - fd},${y + h * 0.25} ${x + w},${y + h * 0.5} Q ${x + w - fd},${y + h * 0.75} ${x + w},${y + h} L ${x},${y + h} L ${x},${y} Z`;

  return `<path d="${folds}" fill="rgba(${r},${g},${b},${opacity})"/>
    <line x1="${side === "left" ? x + w : x}" y1="${y}" x2="${side === "left" ? x + w : x}" y2="${y + h}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
}

export class CurtainService {
  async apply(roomBuffer: Buffer, opts: CurtainOptions): Promise<Buffer> {
    const room = sharp(roomBuffer);
    const { width: W = 800, height: H = 600 } = await room.metadata();

    const color = opts.color ?? "#E8DCC8";
    const { r, g, b } = hexToRgb(color);
    const cfg = PRESET_CONFIG[opts.preset];
    const panelW = Math.round(W * 0.16);

    let panels = "";

    // Panneau gauche
    panels += curtainPanel(0, 0, panelW, H, "left", r, g, b, cfg.outerOpacity, cfg.foldDepth);
    // Panneau droit
    panels += curtainPanel(W - panelW, 0, panelW, H, "right", r, g, b, cfg.outerOpacity, cfg.foldDepth);

    if (opts.preset === "double") {
      const innerW = Math.round(W * 0.10);
      const ir = Math.min(255, r + 30);
      const ig = Math.min(255, g + 30);
      const ib = Math.min(255, b + 30);
      panels += curtainPanel(panelW - 4, 0, innerW, H, "left", ir, ig, ib, cfg.innerOpacity, cfg.foldDepth * 0.5);
      panels += curtainPanel(W - panelW - innerW + 4, 0, innerW, H, "right", ir, ig, ib, cfg.innerOpacity, cfg.foldDepth * 0.5);
    }

    // Tringle en haut
    const barH = Math.max(6, Math.round(H * 0.012));
    panels += `<rect x="0" y="0" width="${W}" height="${barH}" fill="rgba(120,100,80,0.6)"/>`;

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${panels}</svg>`;
    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

    return room
      .composite([{ input: overlay, left: 0, top: 0, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
