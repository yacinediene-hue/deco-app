import { NextResponse } from "next/server";
import { RugService } from "@/lib/image/rug-service";
import type { RugOptions } from "@/lib/image/types";

export async function POST(req: Request) {
  const form = await req.formData();
  const roomFile = form.get("room") as File | null;
  const optsRaw = form.get("options") as string | null;

  if (!roomFile) {
    return NextResponse.json({ error: "Fichier room manquant" }, { status: 400 });
  }

  const opts: RugOptions = optsRaw ? JSON.parse(optsRaw) : { color: "#C8A882" };

  try {
    const roomBuffer = Buffer.from(await roomFile.arrayBuffer());
    const service = new RugService();
    const result = await service.apply(roomBuffer, opts);
    const base64 = result.toString("base64");
    return NextResponse.json({ url: `data:image/jpeg;base64,${base64}` });
  } catch (error) {
    console.error("[rug]", error);
    return NextResponse.json({ error: "Erreur lors de l'application du tapis" }, { status: 500 });
  }
}
