import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexis Digital - Plataforma Multi-Tenant para Negócios",
    template: "%s | Nexis Digital",
  },
  description: "Plataforma completa para gestão de pousadas, livrarias, restaurantes, catálogos, sites institucionais, ERP e RH. Multi-tenant, white-label, billing integrado.",
  keywords: ["SaaS", "multi-tenant", "pousadas", "livrarias", "restaurantes", "ERP", "RH", "white-label"],
  authors: [{ name: "Nexis Digital" }],
  creator: "Nexis Digital",
  publisher: "Nexis Digital",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://nexisdigital.com.br",
    siteName: "Nexis Digital",
    title: "Nexis Digital - Plataforma Multi-Tenant para Negócios",
    description: "Plataforma completa para gestão de pousadas, livrarias, restaurantes, catálogos, sites institucionais, ERP e RH.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexis Digital Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexis Digital",
    description: "Plataforma Multi-Tenant para Negócios",
    images: ["/og-image.png"],
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.nexisdigital.com.br" />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}