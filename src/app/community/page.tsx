"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/toast";

interface Post {
  id: string;
  imageUrl: string;
  style: string;
  budgetFcfa: number;
  budgetLevel: string;
  caption: string;
  city: string | null;
  likesCount: number;
  createdAt: string;
  _count: { comments: number };
}

const STYLE_LABELS: Record<string, string> = {
  moderne: "Moderne", chic: "Chic", minimaliste: "Minimaliste",
  africain: "Africain", boheme: "Bohème", luxe: "Luxe",
  sahel_chic: "Sahel chic", wax_moderne: "Wax moderne",
  bantou_minimaliste: "Bantou minimaliste", bogolan_urbain: "Bogolan urbain",
};

const WHATSAPP_GROUPS = [
  { city: "Abidjan",  country: "CI", url: "https://chat.whatsapp.com/abidjan-decoapp" },
  { city: "Dakar",    country: "SN", url: "https://chat.whatsapp.com/dakar-decoapp" },
  { city: "Douala",   country: "CM", url: "https://chat.whatsapp.com/douala-decoapp" },
];

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast("Connecte-toi pour commenter.", "info"); return; }
    setSubmitting(true);
    await fetch(`/api/community/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });
    setComment("");
    setSubmitting(false);
    setShowComment(false);
    toast("Commentaire ajouté !", "success");
  };

  const handleReport = async () => {
    await fetch(`/api/community/posts/${post.id}/report`, { method: "POST" });
    toast("Signalement envoyé.", "info");
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="relative w-full aspect-square">
        <Image src={post.imageUrl} alt={post.caption} fill className="object-cover" loading="lazy" />
        {post.city && (
          <span className="absolute top-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">
            📍 {post.city}
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {STYLE_LABELS[post.style] ?? post.style}
          </span>
          <span className="text-[10px] text-stone-400">{formatFcfa(post.budgetFcfa)}</span>
        </div>

        <p className="text-xs text-stone-600 line-clamp-2 mb-2">{post.caption}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 transition-colors"
            >
              ❤️ {post.likesCount}
            </button>
            <button
              onClick={() => setShowComment((v) => !v)}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
            >
              💬 {post._count.comments}
            </button>
            <Link
              href={`/?style=${post.style}&budget=${post.budgetFcfa}`}
              className="text-xs text-amber-700 font-medium hover:underline"
            >
              🔁 Reproduire
            </Link>
          </div>
          <button onClick={handleReport} className="text-[10px] text-stone-300 hover:text-red-400">
            Signaler
          </button>
        </div>

        {showComment && (
          <form onSubmit={handleComment} className="mt-2 flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none"
              placeholder="Ton commentaire…"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              {submitting ? "…" : "→"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [styleFilter, setStyleFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (styleFilter) params.set("style", styleFilter);
    if (cityFilter)  params.set("city",  cityFilter);
    if (!reset && cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/community/posts?${params.toString()}`);
    const data = await res.json();

    setPosts((prev) => reset ? data.items : [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setHasMore(!!data.nextCursor);
    setLoading(false);
  }, [styleFilter, cityFilter, cursor]);

  useEffect(() => { fetchPosts(true); }, [styleFilter, cityFilter]); // eslint-disable-line

  const handleLike = async (id: string) => {
    const res = await fetch(`/api/community/posts/${id}/like`, { method: "POST" });
    if (res.status === 401) { toast("Connecte-toi pour liker.", "info"); return; }
    const data = await res.json();
    setPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, likesCount: p.likesCount + (data.liked ? 1 : -1) } : p
    ));
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-6 pb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Communauté 🏡</h1>
          <p className="text-stone-500 text-sm mt-0.5">Transformations de notre communauté</p>
        </div>
        <Link
          href="/community/challenge"
          className="text-xs bg-amber-500 text-white px-3 py-2 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
        >
          🏆 Défi du mois
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Ville…"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm w-32 outline-none bg-white"
        />
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">Tous styles</option>
          {Object.entries(STYLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Grille posts */}
      {posts.length === 0 && !loading ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📸</div>
          <p className="text-stone-500 text-sm">Aucune transformation publiée ici.</p>
          <p className="text-stone-400 text-xs mt-1">Sois le premier à partager ta déco !</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onLike={handleLike} />
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <button
          onClick={() => fetchPosts()}
          className="mt-5 w-full text-sm text-stone-500 border border-stone-200 rounded-xl py-3 hover:bg-stone-50"
        >
          Voir plus
        </button>
      )}

      {/* Groupes WhatsApp */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-stone-900 mb-3">📲 Groupes WhatsApp par ville</h2>
        <div className="flex flex-col gap-2">
          {WHATSAPP_GROUPS.map((g) => (
            <a
              key={g.city}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <p className="font-semibold text-sm text-stone-800">DecoApp {g.city}</p>
                  <p className="text-xs text-stone-500">Partage, conseils, inspirations</p>
                </div>
              </div>
              <span className="text-xs text-green-700 font-semibold">Rejoindre →</span>
            </a>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-2 text-center">
          Liens configurables par l&apos;admin · Modérés par notre équipe
        </p>
      </section>
    </main>
  );
}
