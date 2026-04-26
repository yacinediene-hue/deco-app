import { NextResponse } from "next/server";
import { RemoveBgService } from "@/lib/image/remove-bg";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const service = new RemoveBgService();
    const result = await service.removeBackground(buffer, file.type);
    const base64 = result.toString("base64");
    return NextResponse.json({ url: `data:image/png;base64,${base64}` });
  } catch (error) {
    console.error("[remove-bg]", error);
    return NextResponse.json({ error: "Erreur lors du détourage" }, { status: 500 });
  }
}
