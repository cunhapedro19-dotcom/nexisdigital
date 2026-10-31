import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/cardapio-digital/";
const name = "Cardápio digital";
const description = "Demonstração funcional de cardápio digital com adicionais, carrinho e pedido enviado pelo WhatsApp — adaptação livre da Nexis Digital.";
const features = [
  "Produtos com categorias, descrições e preços",
  "Adicionais opcionais por produto",
  "Carrinho lateral persistente (localStorage)",
  "Pedido finalizado via WhatsApp",
  "Painel administrativo: produtos, categorias, disponibilidade",
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

export default function CardapioDigitalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}