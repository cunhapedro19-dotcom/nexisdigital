import { notFound } from "next/navigation";
import { PluginGate } from "../../../../plugin-gate";
import { OrderSuccessPage } from "@nexis/plugin-livrarias/pages/OrderSuccessPage";

export const metadata = { title: "Pedido confirmado" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; bookId: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "livrarias");
  if (!ok) notFound();
  return <OrderSuccessPage />;
}
