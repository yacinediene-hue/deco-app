import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.shareablePost.findUnique({ where: { id } });
  if (!post) return { title: "DecoApp" };

  return {
    title: `Transformation déco · DecoApp`,
    description: post.caption,
    openGraph: {
      title: "Transformation déco avec DecoApp ✨",
      description: post.caption,
      images: [{ url: post.squareImageUrl, width: 1080, height: 1080 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Transformation déco avec DecoApp ✨",
      description: post.caption,
      images: [post.squareImageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.shareablePost.findUnique({ where: { id } });

  if (!post || new Date() > post.expiresAt) return notFound();

  // Incrémenter le compteur de vues (silencieux)
  prisma.shareablePost.update({
    where: { id },
    data: { shareCount: { increment: 1 } },
  }).catch(() => {});

  const budgetFormatted = new Intl.NumberFormat("fr-FR").format(post.budgetFcfa) + " FCFA";

  return (
    <main className="min-h-screen bg-stone-900 flex flex-col items-center justify-start px-4 py-8 pb-16">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6">
        <span className="text-white font-bold text-lg">🏠 DecoApp</span>
        <Link
          href="/"
          className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-amber-600 transition-colors"
        >
          Essayer gratuitement →
        </Link>
      </div>

      {/* Image principale */}
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl mb-5">
        <div className="relative w-full aspect-square">
          <Image
            src={post.squareImageUrl}
            alt="Transformation déco"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Caption */}
      <div className="w-full max-w-sm bg-stone-800 rounded-2xl p-5 mb-5">
        <p className="text-white text-sm leading-relaxed">{post.caption}</p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full">
            {post.style.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-stone-400">{budgetFormatted}</span>
        </div>
      </div>

      {/* Carrousel */}
      {post.carouselUrls.length > 1 && (
        <div className="w-full max-w-sm mb-5">
          <p className="text-xs text-stone-400 mb-2 font-medium uppercase tracking-wider">Détail des produits</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {post.carouselUrls.map((url, i) => (
              <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                <Image src={url} alt={`Produit ${i + 1}`} fill className="object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vidéo */}
      {post.videoUrl && (
        <div className="w-full max-w-sm mb-5">
          <p className="text-xs text-stone-400 mb-2 font-medium uppercase tracking-wider">Vidéo before/after</p>
          <video src={post.videoUrl} controls className="w-full rounded-2xl" />
        </div>
      )}

      {/* CTA */}
      <div className="w-full max-w-sm bg-amber-500 rounded-2xl p-5 text-center">
        <p className="text-white font-bold text-lg mb-1">Crée ta propre simulation ✨</p>
        <p className="text-amber-100 text-sm mb-4">Gratuit · 2 minutes · Catalogue produits africains</p>
        <Link
          href="/"
          className="inline-block bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-colors"
        >
          Démarrer →
        </Link>
      </div>

      <p className="text-stone-600 text-xs mt-6">
        Lien valable jusqu&apos;au {post.expiresAt.toLocaleDateString("fr-FR")}
      </p>
    </main>
  );
}
