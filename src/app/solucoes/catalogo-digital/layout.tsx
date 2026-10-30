import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Catálogo digital",
  description: "Demonstração funcional de catálogo online com busca, categorias, carrinho e pedido via WhatsApp — adaptação livre da Nexis Digital.",
  alternates: { canonical: "/solucoes/catalogo-digital/" },
  openGraph: {
    title: "Catálogo digital · Nexis Digital",
    description: "Demonstração funcional de catálogo online com busca, categorias, carrinho e pedido via WhatsApp — adaptação livre da Nexis Digital.",
    url: "/solucoes/catalogo-digital/",
  },
};

export default function CatalogoDigitalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}