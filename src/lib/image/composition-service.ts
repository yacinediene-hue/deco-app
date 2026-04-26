import { RemoveBgService } from "./remove-bg";
import { SharpComposer } from "./sharp-composer";
import { CloudinaryStorage } from "./cloudinary-storage";
import type { IBackgroundRemover, IImageComposer, IImageStorage, CompositionResult, PlacementHint } from "./types";

interface Dependencies {
  backgroundRemover?: IBackgroundRemover;
  composer?: IImageComposer;
  storage?: IImageStorage;
}

export class ImageCompositionService {
  private readonly remover: IBackgroundRemover;
  private readonly composer: IImageComposer;
  private readonly storage: IImageStorage;

  constructor(deps: Dependencies = {}) {
    this.remover = deps.backgroundRemover ?? new RemoveBgService();
    this.composer = deps.composer ?? new SharpComposer();
    this.storage = deps.storage ?? new CloudinaryStorage();
  }

  async process(
    roomBuffer: Buffer,
    furnitureBuffer: Buffer,
    furnitureMime: string,
    placement?: PlacementHint
  ): Promise<CompositionResult> {
    const [furnitureNoBg] = await Promise.all([
      this.remover.removeBackground(furnitureBuffer, furnitureMime),
    ]);

    const composedBuffer = await this.composer.compose({
      roomBuffer,
      furnitureBuffer: furnitureNoBg,
      placement,
    });

    const timestamp = Date.now();
    const [furnitureNoBackgroundUrl, composedImageUrl] = await Promise.all([
      this.storage.upload(furnitureNoBg, `furniture-nobg-${timestamp}`, "decoapp/furniture"),
      this.storage.upload(composedBuffer, `composed-${timestamp}`, "decoapp/composed"),
    ]);

    return { composedImageUrl, furnitureNoBackgroundUrl };
  }
}
