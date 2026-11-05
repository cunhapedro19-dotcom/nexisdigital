import { notFound } from "next/navigation";
import { PluginGate } from "../../plugin-gate";
import { CatalogoPage } from "@nexis/plugin-catalogo/pages/CatalogoPage";

export const metadata = { title: "Catálogo" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "catalogo");
  if (!ok) notFound();
  return <CatalogoPage />;
}
