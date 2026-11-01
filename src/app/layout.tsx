import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { BRAND, SITE_URL } from "@/config";
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/jsonld";
import { registerSW } from "@/lib/register-sw";

// Fontes self-hosted via next/font (sem requisição externa em runtime,
// sem layout shift e compatível com export estático).
// Tech minimal: Inter como fonte única de identidade.
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-next",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-next",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "monospace"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const orgJsonLd = generateOrganizationJsonLd();
const siteJsonLd = generateWebSiteJsonLd();

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
  other: {
    "script:ld+json": JSON.stringify([orgJsonLd, siteJsonLd]),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Registra SW após hidratação (client-side only)
  if (typeof window !== "undefined") {
    registerSW();
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <meta name="theme-color" content="#0c0a09" />
      </head>
      <body className="bg-nx-bg text-nx-text antialiased">
        {children}
        <Script id="register-sw" strategy="lazyOnload">
          {`if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
          }`}
        </Script>
      </body>
    </html>
  );
}
