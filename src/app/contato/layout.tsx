import type { Metadata } from "next";
import { ReactNode } from "react";
import { BRAND } from "@/config";
import { SITE_URL } from "@/config";

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contato — Nexis Digital",
  description: "Entre em contato com a Nexis Digital para solicitar orçamento, tirar dúvidas ou conversar sobre seu projeto.",
  url: `${SITE_URL}/contato`,
  mainEntity: {
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
  },
};

export const metadata: Metadata = {
  title: "Contato — Nexis Digital",
  description: "Entre em contato com a Nexis Digital para solicitar orçamento, tirar dúvidas ou conversar sobre seu projeto.",
  openGraph: {
    title: "Contato — Nexis Digital",
    description: "Entre em contato com a Nexis Digital para solicitar orçamento, tirar dúvidas ou conversar sobre seu projeto.",
    type: "website",
    url: `${SITE_URL}/contato`,
  },
  alternates: {
    canonical: `${SITE_URL}/contato`,
  },
  other: {
    "script:ld+json": JSON.stringify(contactJsonLd),
  },
};

export default function ContatoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
