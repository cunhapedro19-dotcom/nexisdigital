import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/gestao-rh/";
const name = "Gestão de RH";
const description = "Demonstração de sistema de RH com colaboradores, férias e documentos — solução sob medida da Nexis Digital.";
const features = [
  "Cadastro de colaboradores com cargos e departamentos",
  "Controle de férias e afastamentos",
  "Gestão de documentos (contratos, ASO, etc.)",
  "Dashboard de indicadores de RH",
  "Painel administrativo com localStorage",
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

export default function GestaoRhLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}