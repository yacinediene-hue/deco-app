import { NextResponse } from "next/server";
import { WallpaperService } from "@/lib/image/wallpaper-service";
import type { WallpaperOptions } from "@/lib/image/types";

export async function POST(req: Request) {
  const form = await req.formData();
  const roomFile = form.get("room") as File | null;
  const optsRaw = form.get("options") as string | null;

  if (!roomFile) {
    return NextResponse.json({ error: "Fichier room manquant" }, { status: 400 });
  }

  const opts: WallpaperOptions = optsRaw ? JSON.parse(optsRaw) : { color: "#F5F0E8" };

  try {
    const roomBuffer = Buffer.from(await roomFile.arrayBuffer());
    const service = new WallpaperService();
    const { before, after } = await service.apply(roomBuffer, opts);

    return NextResponse.json({
      before: `data:image/jpeg;base64,${before}`,
      after: `data:image/jpeg;base64,${after.toString("base64")}`,
    });
  } catch (error) {
    console.error("[wallpaper]", error);
    return NextResponse.json({ error: "Erreur lors de l'application du papier peint" }, { status: 500 });
  }
}
