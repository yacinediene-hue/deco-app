import { NextResponse } from "next/server";
import { CurtainService } from "@/lib/image/curtain-service";
import type { CurtainOptions } from "@/lib/image/curtain-service";

export async function POST(req: Request) {
  const form = await req.formData();
  const roomFile = form.get("room") as File | null;
  const optsRaw = form.get("options") as string | null;

  if (!roomFile) return NextResponse.json({ error: "Fichier room manquant" }, { status: 400 });

  const opts: CurtainOptions = optsRaw ? JSON.parse(optsRaw) : { preset: "light" };

  try {
    const buffer = Buffer.from(await roomFile.arrayBuffer());
    const result = await new CurtainService().apply(buffer, opts);
    return NextResponse.json({ url: `data:image/jpeg;base64,${result.toString("base64")}` });
  } catch (e) {
    console.error("[curtain]", e);
    return NextResponse.json({ error: "Erreur rideaux" }, { status: 500 });
  }
}
