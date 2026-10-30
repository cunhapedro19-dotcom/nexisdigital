import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contato",
  description: "Entre em contato com a Nexis Digital para solicitar orçamento, tirar dúvidas ou conversar sobre seu projeto.",
};

export default function ContatoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
