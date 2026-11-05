import { notFound } from "next/navigation";
import { tenantService } from "@nexis/tenant/server";
import { PluginGate } from "../../plugin-gate";
import { PousadasPage } from "@nexis/plugin-pousadas/pages/PousadasPage";

export const metadata = { title: "Acomodações" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "pousadas");
  if (!ok) notFound();
  return <PousadasPage />;
}
