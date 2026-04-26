import { NextResponse } from "next/server";
import { ShareableContentGenerator } from "@/lib/shareable-content-generator";
import type { CatalogItem } from "@/types/recommendation";

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}

async function urlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function POST(req: Request) {
  const { beforeDataUrl, afterDataUrl, afterCloudUrl, style, budgetFcfa, catalogItems } = await req.json();

  if ((!beforeDataUrl && !afterCloudUrl) || !style || !budgetFcfa) {
    return NextResponse.json({ error: "beforeDataUrl/afterCloudUrl, style et budgetFcfa requis" }, { status: 422 });
  }

  try {
    const beforeBuffer = beforeDataUrl
      ? dataUrlToBuffer(beforeDataUrl)
      : await urlToBuffer(afterCloudUrl); // fallback : utiliser l'après comme avant si pas de before

    const afterBuffer = afterDataUrl
      ? dataUrlToBuffer(afterDataUrl)
      : afterCloudUrl
        ? await urlToBuffer(afterCloudUrl)
        : beforeBuffer;

    const generator = new ShareableContentGenerator();
    const result = await generator.generate({
      beforeBuffer,
      afterBuffer,
      style,
      budgetFcfa,
      catalogItems: (catalogItems ?? []) as CatalogItem[],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[share/generate]", error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
