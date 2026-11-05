import { notFound } from "next/navigation";
import { PluginGate } from "../../../../plugin-gate";
import { CartPage } from "@nexis/plugin-livrarias/pages/CartPage";

export const metadata = { title: "Carrinho" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; bookId: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "livrarias");
  if (!ok) notFound();
  return <CartPage />;
}
