import Link from "next/link";
import { notFound } from "next/navigation";
import { tenantService } from "@nexis/tenant/server";
import { TenantHome } from "./home";

/**
 * Home do site do tenant.
 * Se o tenant tem o plugin site-institucional instalado, renderiza as
 * páginas CMS dele. Caso contrário, mostra a home genérica com os
 * plugins ativos (hub de navegação).
 */
export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await tenantService.getTenantBySlug(slug);
  if (!tenant) notFound();

  const plugins = await tenantService.getTenantPlugins(tenant.id);
  const enabled = plugins.filter((p) => p.enabled).map((p) => p.pluginKey);

  return <TenantHome tenant={{
    slug: tenant.slug,
    name: tenant.name,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
  }} plugins={enabled} />;
}
