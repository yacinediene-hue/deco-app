// Shotstack API — génération vidéo before/after asynchrone

const FREE_TRACKS = [
  "https://cdn.pixabay.com/download/audio/2022/10/25/audio_948f2af7fd.mp3",
  "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3",
  "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0ef8e7f6d.mp3",
  "https://cdn.pixabay.com/download/audio/2021/09/06/audio_1cf6b4fc23.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c4aef88b10.mp3",
];

function randomTrack(): string {
  return FREE_TRACKS[Math.floor(Math.random() * FREE_TRACKS.length)];
}

export interface ShotstackRenderInput {
  beforeImageUrl: string;
  afterImageUrl: string;
  style: string;
  budgetFcfa: number;
  transition?: "fade" | "slideLeft" | "zoom";
}

export interface ShotstackRenderResult {
  renderId: string;
  status: "queued" | "fetching" | "rendering" | "done" | "failed";
  url?: string;
}

export class ShotstackService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    const key = process.env.SHOTSTACK_API_KEY;
    if (!key) throw new Error("SHOTSTACK_API_KEY is not set");
    this.apiKey = key;
    const env = process.env.SHOTSTACK_ENV ?? "stage";
    this.baseUrl = `https://api.shotstack.io/${env}`;
  }

  async submitRender(input: ShotstackRenderInput): Promise<string> {
    const { beforeImageUrl, afterImageUrl, style, budgetFcfa, transition = "fade" } = input;

    const budgetFormatted = new Intl.NumberFormat("fr-FR").format(budgetFcfa) + " FCFA";
    const styleLabel = style.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const payload = {
      timeline: {
        soundtrack: {
          src: randomTrack(),
          effect: "fadeOut",
          volume: 0.6,
        },
        background: "#1C1917",
        tracks: [
          // Track 1 : images
          {
            clips: [
              {
                asset: { type: "image", src: beforeImageUrl },
                start: 0,
                length: 3.5,
                effect: "zoomInSlow",
                transition: { out: transition },
              },
              {
                asset: { type: "image", src: afterImageUrl },
                start: 3.5,
                length: 4,
                effect: "zoomInSlow",
              },
            ],
          },
          // Track 2 : labels "Avant" / "Après"
          {
            clips: [
              {
                asset: {
                  type: "html",
                  html: `<p style="font-family:sans-serif;font-size:52px;font-weight:700;color:white;letter-spacing:4px;text-shadow:0 2px 8px rgba(0,0,0,0.6)">AVANT</p>`,
                  width: 600, height: 120,
                },
                start: 0.3,
                length: 2.5,
                position: "bottomLeft",
                offset: { x: 0.05, y: 0.08 },
                transition: { in: "fade", out: "fade" },
              },
              {
                asset: {
                  type: "html",
                  html: `<p style="font-family:sans-serif;font-size:52px;font-weight:700;color:white;letter-spacing:4px;text-shadow:0 2px 8px rgba(0,0,0,0.6)">APRÈS ✨</p>`,
                  width: 600, height: 120,
                },
                start: 3.8,
                length: 3.5,
                position: "bottomLeft",
                offset: { x: 0.05, y: 0.08 },
                transition: { in: "fade" },
              },
            ],
          },
          // Track 3 : légende finale
          {
            clips: [
              {
                asset: {
                  type: "html",
                  html: `<div style="font-family:sans-serif;color:white;text-align:center;padding:12px 20px;background:rgba(0,0,0,0.55);border-radius:12px;line-height:1.5">
                    <p style="font-size:28px;font-weight:700;margin:0">${styleLabel}</p>
                    <p style="font-size:22px;margin:4px 0 0;opacity:0.9">Budget : ${budgetFormatted}</p>
                    <p style="font-size:18px;margin:6px 0 0;opacity:0.7">#DecoApp</p>
                  </div>`,
                  width: 700, height: 150,
                },
                start: 4.5,
                length: 3,
                position: "bottom",
                offset: { x: 0, y: 0.05 },
                transition: { in: "fade" },
              },
            ],
          },
        ],
      },
      output: {
        format: "mp4",
        resolution: "hd",
        aspectRatio: "9:16",
        fps: 25,
      },
    };

    const res = await fetch(`${this.baseUrl}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Shotstack error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.response.id as string;
  }

  async getStatus(renderId: string): Promise<ShotstackRenderResult> {
    const res = await fetch(`${this.baseUrl}/render/${renderId}`, {
      headers: { "x-api-key": this.apiKey },
    });

    if (!res.ok) throw new Error(`Shotstack status error ${res.status}`);

    const data = await res.json();
    const { id, status, url } = data.response;
    return { renderId: id, status, url };
  }
}
