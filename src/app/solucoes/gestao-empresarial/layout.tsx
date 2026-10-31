import type { Metadata } from "next";
import { ReactNode } from "react";
import { SITE_URL } from "@/config";
import { generateSolutionJsonLd } from "@/lib/jsonld";

const path = "/solucoes/gestao-empresarial/";
const name = "Gestão empresarial";
const description = "Demonstração de sistema de gestão com produtos, estoque, clientes e vendas — solução sob medida da Nexis Digital.";
const features = [
  "Cadastro de produtos com SKU, preço e estoque",
  "Gestão de clientes (CRM leve)",
  "Pedidos de venda com status",
  "Dashboard com KPIs e gráficos",
  "Painel administrativo completo com localStorage",
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

export default function GestaoEmpresarialLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}