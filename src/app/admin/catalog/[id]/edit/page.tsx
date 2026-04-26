"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CatalogForm from "@/components/admin/CatalogForm";
import type { CatalogFormData } from "@/components/admin/CatalogForm";

export default function EditCatalogItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [initial, setInitial] = useState<Partial<CatalogFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/catalog/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInitial({
          name: data.name ?? "",
          type: data.type ?? "tapis",
          styles: data.styles ?? [],
          colors: data.colors ?? [],
          priceFcfa: String(data.priceFcfa ?? ""),
          budgetLevel: data.budgetLevel ?? "bas",
          imageUrl: data.imageUrl ?? "",
          description: data.description ?? "",
          externalUrl: data.externalUrl ?? "",
          available: data.available ?? true,
          inStock: data.inStock ?? true,
        });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (data: CatalogFormData) => {
    const res = await fetch(`/api/admin/catalog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Erreur lors de la mise à jour");
    }
    router.push("/admin/catalog");
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/catalog/${id}`, { method: "DELETE" });
    router.push("/admin/catalog");
  };

  if (loading) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}
        </div>
      </main>
    );
  }

  if (!initial) return null;

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Modifier le produit</h1>
      </div>
      <CatalogForm
        initial={initial}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="Enregistrer"
      />
    </main>
  );
}
