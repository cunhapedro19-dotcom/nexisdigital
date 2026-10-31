import { SITE_URL } from "@/config";
import { BRAND } from "@/config";

export interface SolutionJsonLdProps {
  name: string;
  description: string;
  path: string; // ex.: /solucoes/pousadas/
  features?: string[];
  demoUrl?: string; // URL da demo (se diferente da página)
}

/** Gera JSON-LD do tipo Product/SoftwareApplication para páginas de solução. */
export function generateSolutionJsonLd({
  name,
  description,
  path,
  features = [],
  demoUrl,
}: SolutionJsonLdProps): object {
  const url = `${SITE_URL}${path}`;
  const demo = demoUrl ?? url;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Cloud",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "BRL",
      description: "Demonstração gratuita — implementação sob orçamento",
      url: demo,
    },
    featureList: features.length ? features : undefined,
    publisher: {
      "@type": "Organization",
      name: "Nexis Digital",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-white.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BRAND.whatsapp.replace(/\D/g, ""),
        contactType: "sales",
        availableLanguage: ["Portuguese"],
        areaServed: "BR",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "27",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/** JSON-LD de Organization para o site todo (usar no layout raiz). */
export function generateOrganizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nexis Digital",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-white.png`,
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND.whatsapp.replace(/\D/g, ""),
        contactType: "customer service",
        availableLanguage: ["Portuguese"],
        areaServed: "BR",
      },
      {
        "@type": "ContactPoint",
        email: BRAND.email,
        contactType: "customer service",
        availableLanguage: ["Portuguese"],
        areaServed: "BR",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "BR",
      addressLocality: BRAND.location.split(",")[0]?.trim() ?? "Brasil",
      addressRegion: BRAND.location.includes(",") ? BRAND.location.split(",")[1]?.trim() : "",
    },
  };
}

/** JSON-LD de WebSite (busca no site). */
export function generateWebSiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nexis Digital",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/busca?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}