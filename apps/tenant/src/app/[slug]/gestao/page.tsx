import { notFound } from "next/navigation";
import { PluginGate } from "../../plugin-gate";
import { GestaoEmpresarialPage } from "@nexis/plugin-gestao-empresarial/pages/GestaoEmpresarialPage";

export const metadata = { title: "Gestão" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "gestao-empresarial");
  if (!ok) notFound();
  return <GestaoEmpresarialPage />;
}
