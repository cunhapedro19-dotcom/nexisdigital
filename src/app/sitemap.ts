import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config";

/**
 * Sitemap estático (exportado pelo build).
 *
 * No GitHub Pages o site vive sob basePath (/nexisdigital), por isso
 * as URLs levam o prefixo quando presente.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const routes: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, freq: "weekly" },
  { path: "/solucoes/", priority: 0.9, freq: "weekly" },
  { path: "/solucoes/catalogo-digital/", priority: 0.8, freq: "monthly" },
  { path: "/solucoes/cardapio-digital/", priority: 0.8, freq: "monthly" },
  { path: "/solucoes/gestao-empresarial/", priority: 0.8, freq: "monthly" },
  { path: "/solucoes/gestao-rh/", priority: 0.8, freq: "monthly" },
  { path: "/solucoes/site-institucional/", priority: 0.8, freq: "monthly" },
  { path: "/solucoes/pousadas/", priority: 0.8, freq: "monthly" },
  { path: "/solucoes/livrarias/", priority: 0.8, freq: "monthly" },
  { path: "/contato/", priority: 0.7, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((r) => ({
    url: `${SITE_URL}${basePath}${r.path}`,
    lastModified,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
