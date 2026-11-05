import { notFound } from "next/navigation";
import { PluginGate } from "../../plugin-gate";
import { LivrariaPage } from "@nexis/plugin-livrarias/pages/LivrariaPage";

export const metadata = { title: "Loja" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "livrarias");
  if (!ok) notFound();
  return <LivrariaPage />;
}
