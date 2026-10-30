import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cardápio digital",
  description: "Demonstração funcional de cardápio digital com adicionais, carrinho e pedido enviado pelo WhatsApp — adaptação livre da Nexis Digital.",
  alternates: { canonical: "/solucoes/cardapio-digital/" },
  openGraph: {
    title: "Cardápio digital · Nexis Digital",
    description: "Demonstração funcional de cardápio digital com adicionais, carrinho e pedido enviado pelo WhatsApp — adaptação livre da Nexis Digital.",
    url: "/solucoes/cardapio-digital/",
  },
};

export default function CardapioDigitalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}