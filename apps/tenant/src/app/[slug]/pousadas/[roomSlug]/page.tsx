import { notFound } from "next/navigation";
import { tenantService } from "@nexis/tenant/server";
import { PluginGate } from "../../../plugin-gate";
import { PousadaDetailPage } from "@nexis/plugin-pousadas/pages/PousadaDetailPage";

export const metadata = { title: "Acomodação" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; roomSlug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "pousadas");
  if (!ok) notFound();
  return <PousadaDetailPage />;
}
