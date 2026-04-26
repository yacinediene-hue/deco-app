"use client";

import { useRouter } from "next/navigation";
import CatalogForm from "@/components/admin/CatalogForm";
import type { CatalogFormData } from "@/components/admin/CatalogForm";

export default function NewCatalogItemPage() {
  const router = useRouter();

  const handleSubmit = async (data: CatalogFormData) => {
    const res = await fetch("/api/admin/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Erreur lors de la création");
    }
    router.push("/admin/catalog");
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Ajouter un produit</h1>
      </div>
      <CatalogForm onSubmit={handleSubmit} submitLabel="Créer le produit" />
    </main>
  );
}
