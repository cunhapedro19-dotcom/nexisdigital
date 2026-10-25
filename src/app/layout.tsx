import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BRAND } from "@/config";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Sites, plataformas e sistemas sob medida`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.shortDescription,
  metadataBase: new URL("https://nexisdigital.com.br"),
  openGraph: {
    title: `${BRAND.name} — Sites, plataformas e sistemas sob medida`,
    description: BRAND.shortDescription,
    type: "website",
    locale: "pt_BR",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-nx-bg text-nx-text antialiased">{children}</body>
    </html>
  );
}
