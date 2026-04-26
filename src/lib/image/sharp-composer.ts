import sharp from "sharp";
import type { IImageComposer, CompositionInput } from "./types";

export class SharpComposer implements IImageComposer {
  async compose({ roomBuffer, furnitureBuffer, placement }: CompositionInput): Promise<Buffer> {
    const room = sharp(roomBuffer);
    const { width: roomW = 800, height: roomH = 600 } = await room.metadata();

    const px = placement ?? { xPercent: 15, yPercent: 40, widthPercent: 40 };

    const furnitureW = Math.round((roomW * px.widthPercent) / 100);

    const furnitureResized = await sharp(furnitureBuffer)
      .resize({ width: furnitureW, withoutEnlargement: false })
      .png()
      .toBuffer();

    const { height: furnitureH = 200 } = await sharp(furnitureResized).metadata();

    const left = Math.round((roomW * px.xPercent) / 100);
    const top = Math.min(
      Math.round((roomH * px.yPercent) / 100),
      roomH - furnitureH
    );

    return room
      .composite([{ input: furnitureResized, left, top, blend: "over" }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
