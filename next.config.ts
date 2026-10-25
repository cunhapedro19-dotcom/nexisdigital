import type { NextConfig } from "next";

// Quando o build roda no GitHub Actions (GITHUB_PAGES=true), o site é exportado
// como arquivos estáticos e servido em /nexisdigital. Localmente e na Vercel
// nada muda: sem basePath e sem export.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/nexisdigital" : "";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export" as const } : {}),
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Disponível no código como process.env.NEXT_PUBLIC_BASE_PATH
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
