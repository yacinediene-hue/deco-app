import { NextResponse } from "next/server";
import { CushionService } from "@/lib/image/cushion-service";
import type { CushionOptions } from "@/lib/image/cushion-service";

export async function POST(req: Request) {
  const form = await req.formData();
  const roomFile = form.get("room") as File | null;
  const optsRaw = form.get("options") as string | null;

  if (!roomFile) return NextResponse.json({ error: "Fichier room manquant" }, { status: 400 });

  const opts: CushionOptions = optsRaw ? JSON.parse(optsRaw) : { color: "#C8A882" };

  try {
    const buffer = Buffer.from(await roomFile.arrayBuffer());
    const result = await new CushionService().apply(buffer, opts);
    return NextResponse.json({ url: `data:image/jpeg;base64,${result.toString("base64")}` });
  } catch (e) {
    console.error("[cushion]", e);
    return NextResponse.json({ error: "Erreur coussins" }, { status: 500 });
  }
}
