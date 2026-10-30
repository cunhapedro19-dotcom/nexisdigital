import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BRAND, SITE_URL } from "@/config";

// Fontes self-hosted via next/font (sem requisição externa em runtime,
// sem layout shift e compatível com export estático).
// Tech minimal: Inter como fonte única de identidade.
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-next",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-next",
  display: "swap",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — Sites, plataformas e sistemas sob medida`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.shortDescription,
  openGraph: {
    title: `${BRAND.name} — Sites, plataformas e sistemas sob medida`,
    description: BRAND.shortDescription,
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.name,
    images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Sites, plataformas e sistemas sob medida`,
    description: BRAND.shortDescription,
    images: [`${basePath}/og.png`],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-nx-bg text-nx-text antialiased">{children}</body>
    </html>
  );
}
