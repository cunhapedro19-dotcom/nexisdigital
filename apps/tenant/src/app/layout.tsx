import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Root layout do tenant app.
 * O layout real (tema do tenant) fica em [slug]/layout.tsx.
 * Este root só existe para satisfazer o App Router.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "Nexis", template: "%s" },
  robots: { index: false }, // páginas de tenant são indexadas via domínio próprio
};

export const viewport: Viewport = {
  themeColor: "#0c0a09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
