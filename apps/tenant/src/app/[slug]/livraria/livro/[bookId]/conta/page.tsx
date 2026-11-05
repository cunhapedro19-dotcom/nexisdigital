import { notFound } from "next/navigation";
import { PluginGate } from "../../../../plugin-gate";
import { AccountPage } from "@nexis/plugin-livrarias/pages/AccountPage";

export const metadata = { title: "Minha conta" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; bookId: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "livrarias");
  if (!ok) notFound();
  return <AccountPage />;
}
