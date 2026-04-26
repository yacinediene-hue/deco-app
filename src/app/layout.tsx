import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/contexts/toast";
import Header from "@/components/Header";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "DecoApp — Visualise ton intérieur",
  description: "Simule ta décoration d'intérieur avant d'acheter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-stone-50 font-sans antialiased">
        <SessionProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
