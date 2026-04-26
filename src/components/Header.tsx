"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Pas de header sur les pages auth
  if (pathname.startsWith("/auth")) return null;

  return (
    <header className="w-full bg-white border-b border-stone-100 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-stone-900 text-sm tracking-tight">
          🏠 DecoApp
        </Link>

        <nav className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-20 h-4 bg-stone-100 rounded animate-pulse" />
          ) : session ? (
            <>
              <Link
                href="/history"
                className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
              >
                Mes simulations
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin/catalog"
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs bg-stone-100 text-stone-600 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0]} · Quitter
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
