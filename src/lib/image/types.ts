export interface PlacementHint {
  xPercent: number;  // 0–100, position horizontale relative
  yPercent: number;  // 0–100, position verticale relative
  widthPercent: number; // 0–100, largeur relative à la pièce
}

export interface CompositionInput {
  roomBuffer: Buffer;
  furnitureBuffer: Buffer;
  placement?: PlacementHint;
}

export interface IBackgroundRemover {
  removeBackground(buffer: Buffer, mimeType: string): Promise<Buffer>;
}

export interface IImageComposer {
  compose(input: CompositionInput): Promise<Buffer>;
}

export interface IImageStorage {
  upload(buffer: Buffer, filename: string, folder?: string): Promise<string>;
}

export interface CompositionResult {
  composedImageUrl: string;
  furnitureNoBackgroundUrl: string;
}

export interface RugOptions {
  color: string;         // hex e.g. "#C8A882"
  widthPercent?: number; // % de la largeur de la pièce (défaut 55)
  xPercent?: number;     // position horizontale (défaut 22)
  yPercent?: number;     // position verticale depuis le haut (défaut 58)
  opacity?: number;      // 0–255 (défaut 220)
}

export type WallpaperPattern = "plain" | "stripes_v" | "stripes_h" | "geometric";

export interface WallpaperOptions {
  color: string;
  pattern?: WallpaperPattern;
  heightPercent?: number; // % du haut de l'image occupé par le mur (défaut 60)
  opacity?: number;        // 0–255 (défaut 160)
}
