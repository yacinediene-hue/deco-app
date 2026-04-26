"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/contexts/toast";

interface ReportedPost {
  id: string;
  imageUrl: string;
  caption: string;
  style: string;
  city: string | null;
  createdAt: string;
}

export default function AdminCommunityPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/community/posts")
      .then((r) => r.json())
      .then((d) => { setPosts(d); setLoading(false); });
  }, []);

  const handleAction = async (id: string, action: "delete" | "restore") => {
    await fetch("/api/admin/community/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast(action === "delete" ? "Post supprimé." : "Post réhabilité.", "success");
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Modération communauté</h1>
          <p className="text-stone-500 text-sm mt-0.5">{posts.length} signalement{posts.length > 1 ? "s" : ""} en attente</p>
        </div>
        <Link
          href="/admin/challenge"
          className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
        >
          + Créer un défi
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map((i) => <div key={i} className="aspect-square bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-stone-500">Aucun signalement en attente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">
              <div className="relative aspect-square">
                <Image src={p.imageUrl} alt="Signalé" fill className="object-cover" loading="lazy" />
                <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                  ⚠️ Signalé
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs text-stone-600 line-clamp-2 mb-2">{p.caption}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(p.id, "restore")}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50"
                  >
                    ✓ Garder
                  </button>
                  <button
                    onClick={() => handleAction(p.id, "delete")}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    ✕ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
