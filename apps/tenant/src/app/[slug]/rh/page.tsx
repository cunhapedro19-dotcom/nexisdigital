import { notFound } from "next/navigation";
import { PluginGate } from "../../plugin-gate";
import { GestaoRhPage } from "@nexis/plugin-gestao-rh/pages/GestaoRhPage";

export const metadata = { title: "Portal do colaborador" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "gestao-rh");
  if (!ok) notFound();
  return <GestaoRhPage />;
}
