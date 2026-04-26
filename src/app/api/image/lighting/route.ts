import { NextResponse } from "next/server";
import { LightingService } from "@/lib/image/lighting-service";
import type { LightingOptions } from "@/lib/image/lighting-service";

export async function POST(req: Request) {
  const form = await req.formData();
  const roomFile = form.get("room") as File | null;
  const optsRaw = form.get("options") as string | null;

  if (!roomFile) return NextResponse.json({ error: "Fichier room manquant" }, { status: 400 });

  const opts: LightingOptions = optsRaw ? JSON.parse(optsRaw) : { shape: "pendant" };

  try {
    const buffer = Buffer.from(await roomFile.arrayBuffer());
    const result = await new LightingService().apply(buffer, opts);
    return NextResponse.json({ url: `data:image/jpeg;base64,${result.toString("base64")}` });
  } catch (e) {
    console.error("[lighting]", e);
    return NextResponse.json({ error: "Erreur luminaire" }, { status: 500 });
  }
}
