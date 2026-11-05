import { notFound } from "next/navigation";
import { PluginGate } from "../../plugin-gate";
import { CardapioPage } from "@nexis/plugin-cardapio/pages/CardapioPage";

export const metadata = { title: "Cardápio" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "cardapio");
  if (!ok) notFound();
  return <CardapioPage />;
}
