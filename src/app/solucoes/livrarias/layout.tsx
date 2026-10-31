import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/livrarias/";
const name = "Site para livrarias";
const description = "Exemplo de vitrine para livrarias com catálogo de títulos e fluxo de reserva — solução da Nexis Digital.";
const features = [
  "Catálogo de livros com autor, categoria, ano e sinopse",
  "Capas ilustradas via CSS gradients (ColorDuoPicker)",
  "Busca e filtros por categoria",
  "Reserva de exemplares via WhatsApp",
  "Painel administrativo: livros, categorias, capas",
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

export default function LivrariasLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}