import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/catalogo-digital/";
const name = "Catálogo digital";
const description = "Demonstração funcional de catálogo online com busca, categorias, carrinho e pedido via WhatsApp — adaptação livre da Nexis Digital.";
const features = [
  "Produtos com busca, filtros e categorias",
  "Carrinho lateral com persistência local",
  "Toggle de disponibilidade por produto",
  "Pedido via WhatsApp com resumo formatado",
  "Painel administrativo: produtos, categorias, estoque",
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

export default function CatalogoDigitalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}