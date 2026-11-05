import { notFound } from "next/navigation";
import { PluginGate } from "../../../plugin-gate";
import { BookDetailPage } from "@nexis/plugin-livrarias/pages/BookDetailPage";

export const metadata = { title: "Livro" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; bookId: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "livrarias");
  if (!ok) notFound();
  return <BookDetailPage />;
}
