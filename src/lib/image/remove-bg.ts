import type { IBackgroundRemover } from "./types";

export class RemoveBgService implements IBackgroundRemover {
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.REMOVE_BG_API_KEY;
    if (!key) throw new Error("REMOVE_BG_API_KEY is not set");
    this.apiKey = key;
  }

  async removeBackground(buffer: Buffer, mimeType: string): Promise<Buffer> {
    const form = new FormData();
    const ab = new ArrayBuffer(buffer.length);
    new Uint8Array(ab).set(buffer);
    const blob = new Blob([ab], { type: mimeType });
    form.append("image_file", blob, "image.png");
    form.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": this.apiKey },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`remove.bg error ${res.status}: ${err}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
