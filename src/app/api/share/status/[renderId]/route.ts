import { NextResponse } from "next/server";
import { ShotstackService } from "@/lib/shotstack";

export async function GET(_req: Request, { params }: { params: Promise<{ renderId: string }> }) {
  const { renderId } = await params;

  try {
    const shotstack = new ShotstackService();
    const result = await shotstack.getStatus(renderId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[share/status]", error);
    return NextResponse.json({ error: "Erreur de statut vidéo" }, { status: 500 });
  }
}
