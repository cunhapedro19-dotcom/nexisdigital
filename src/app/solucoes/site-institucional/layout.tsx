import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/site-institucional/";
const name = "Site institucional";
const description = "Exemplo de site institucional autoral para arquitetura — modelo do que a Nexis Digital constrói para empresas.";
const features = [
  "Hero com composição autoral e métricas",
  "Seções de serviços e portfólio",
  "Depoimentos e cases",
  "Formulário de contato integrado ao WhatsApp",
  "Painel administrativo: serviços, portfólio (hue slider)",
  "Design responsivo mobile-first",
];

export const metadata: Metadata = {
  title: `${name} · Nexis Digital`,
  description,
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: `${name} · Nexis Digital`,
    description,
    url: `${SITE_URL}${path}`,
    type: "website",
  },
  other: {
    "script:ld+json": JSON.stringify(generateSolutionJsonLd({ name, description, path, features })),
  },
};

export default function SiteInstitucionalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}