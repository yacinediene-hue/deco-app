import { NextResponse } from "next/server";
import { ImageCompositionService } from "@/lib/image/composition-service";
import { placementFromFurnitureWidth } from "@/lib/dimensions";
import type { PlacementHint } from "@/lib/image/types";

export async function POST(req: Request) {
  const form = await req.formData();
  const roomFile = form.get("room") as File | null;
  const furnitureFile = form.get("furniture") as File | null;

  if (!roomFile || !furnitureFile) {
    return NextResponse.json({ error: "Fichiers room et furniture requis" }, { status: 400 });
  }

  // Placement explicite ou calculé depuis la largeur réelle du meuble
  const placementRaw = form.get("placement");
  const widthCmRaw = form.get("widthCm");

  const placement: PlacementHint = placementRaw
    ? JSON.parse(placementRaw as string)
    : placementFromFurnitureWidth(widthCmRaw ? parseFloat(widthCmRaw as string) : null);

  try {
    const roomBuffer = Buffer.from(await roomFile.arrayBuffer());
    const furnitureBuffer = Buffer.from(await furnitureFile.arrayBuffer());

    const service = new ImageCompositionService();
    const result = await service.process(roomBuffer, furnitureBuffer, furnitureFile.type, placement);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[compose]", error);
    return NextResponse.json({ error: "Erreur lors de la composition" }, { status: 500 });
  }
}
