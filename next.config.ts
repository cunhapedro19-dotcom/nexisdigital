import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Quando o build roda no GitHub Actions (GITHUB_PAGES=true), o site é exportado
// como arquivos estáticos e servido em /nexisdigital. Localmente e na Vercel
// nada muda: sem basePath e sem export.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/nexisdigital" : "";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export" as const } : {}),
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: isPages, // otimiza local/Vercel, desabilita só no Pages
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Disponível no código como process.env.NEXT_PUBLIC_BASE_PATH
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Headers de cache para assets estáticos
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/:path*.(js|css|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default bundleAnalyzer(nextConfig);
