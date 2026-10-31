import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/pousadas/";
const name = "Site para pousadas";
const description = "Exemplo visual de site para pousada com acomodações, galeria e reserva pelo WhatsApp — solução da Nexis Digital.";
const features = [
  "Acomodações com fotos e descrições",
  "Galeria de imagens ilustrativas",
  "Verificação de disponibilidade em tempo real",
  "Reserva via WhatsApp com criação de solicitação local",
  "Painel administrativo para gerenciar acomodações e comodidades",
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

export default function PousadasLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}