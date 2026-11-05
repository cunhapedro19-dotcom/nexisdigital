import { notFound } from "next/navigation";
import { PluginGate } from "../../plugin-gate";
import { SiteInstitucionalPage } from "@nexis/plugin-site-institucional/pages/SiteInstitucionalPage";

export const metadata = { title: "Institucional" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "site-institucional");
  if (!ok) notFound();
  return <SiteInstitucionalPage />;
}
