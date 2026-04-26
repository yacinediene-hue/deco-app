import Replicate from "replicate";
import type { IImageComposer, CompositionInput } from "./types";

const MODEL = "zsxkib/flux-dev-inpainting:7ede8652e977ce45b2a2a910a5e7ab9f95b5dc1b92ae6ce43f6f6aef3bafec64";

export class ReplicateComposer implements IImageComposer {
  private readonly client: Replicate;

  constructor(apiToken?: string) {
    const token = apiToken ?? process.env.REPLICATE_API_TOKEN;
    if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
    this.client = new Replicate({ auth: token });
  }

  async compose({ roomBuffer, furnitureBuffer, placement }: CompositionInput): Promise<Buffer> {
    const roomBase64 = `data:image/jpeg;base64,${roomBuffer.toString("base64")}`;
    const furnitureBase64 = `data:image/png;base64,${furnitureBuffer.toString("base64")}`;

    const px = placement ?? { xPercent: 15, yPercent: 40, widthPercent: 40 };

    const output = await this.client.run(MODEL, {
      input: {
        image: roomBase64,
        prompt: `Place a furniture piece in the room at position ${px.xPercent}% from left, ${px.yPercent}% from top. Realistic lighting, photorealistic interior design.`,
        mask: furnitureBase64,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        strength: 0.85,
      },
    });

    const url = Array.isArray(output) ? String(output[0]) : String(output as unknown);
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
