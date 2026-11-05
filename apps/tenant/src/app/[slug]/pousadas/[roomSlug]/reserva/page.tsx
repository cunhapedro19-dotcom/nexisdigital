import { notFound } from "next/navigation";
import { PluginGate } from "../../../../plugin-gate";
import { BookingPage } from "@nexis/plugin-pousadas/pages/BookingPage";

export const metadata = { title: "Reservar" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; roomSlug: string }>;
}) {
  const { slug } = await params;
  const ok = await PluginGate(slug, "pousadas");
  if (!ok) notFound();
  return <BookingPage />;
}
