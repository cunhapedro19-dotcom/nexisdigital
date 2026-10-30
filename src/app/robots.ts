import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config";

/**
 * robots.txt estático. Com export para o GitHub Pages, o arquivo é
 * gerado em /robots.txt (sob o basePath configurado).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}${basePath}/sitemap.xml`,
  };
}
