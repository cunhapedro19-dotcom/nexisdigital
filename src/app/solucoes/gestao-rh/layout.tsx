import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gestão de RH",
  description: "Demonstração de sistema de RH com colaboradores, férias e documentos — solução sob medida da Nexis Digital.",
  alternates: { canonical: "/solucoes/gestao-rh/" },
  openGraph: {
    title: "Gestão de RH · Nexis Digital",
    description: "Demonstração de sistema de RH com colaboradores, férias e documentos — solução sob medida da Nexis Digital.",
    url: "/solucoes/gestao-rh/",
  },
};

export default function GestaoRhLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}