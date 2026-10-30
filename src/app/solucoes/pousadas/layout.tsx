import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Site para pousadas",
  description: "Exemplo visual de site para pousada com acomodações, galeria e reserva pelo WhatsApp — solução da Nexis Digital.",
  alternates: { canonical: "/solucoes/pousadas/" },
  openGraph: {
    title: "Site para pousadas · Nexis Digital",
    description: "Exemplo visual de site para pousada com acomodações, galeria e reserva pelo WhatsApp — solução da Nexis Digital.",
    url: "/solucoes/pousadas/",
  },
};

export default function PousadasLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}