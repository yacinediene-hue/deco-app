import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { platform, postId } = await req.json();
  if (!platform) return NextResponse.json({ ok: false });

  // Incrémenter shareCount si postId fourni
  if (postId) {
    await prisma.shareablePost.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } },
    }).catch(() => {});
  }

  // Log console pour suivi — à remplacer par Posthog en V2
  console.log(`[analytics] share_${platform}`, { postId, ts: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
