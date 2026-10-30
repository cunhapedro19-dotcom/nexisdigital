import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Site institucional",
  description: "Exemplo de site institucional autoral para arquitetura — modelo do que a Nexis Digital constrói para empresas.",
  alternates: { canonical: "/solucoes/site-institucional/" },
  openGraph: {
    title: "Site institucional · Nexis Digital",
    description: "Exemplo de site institucional autoral para arquitetura — modelo do que a Nexis Digital constrói para empresas.",
    url: "/solucoes/site-institucional/",
  },
};

export default function SiteInstitucionalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}