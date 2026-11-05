import { tenantService } from "@nexis/tenant/server";

/**
 * Server-side guard: verifica se o tenant existe e tem o plugin habilitado.
 * Uso: const ok = await PluginGate(slug, "pousadas"); if (!ok) notFound();
 */
export async function PluginGate(
  tenantSlug: string,
  pluginKey: string
): Promise<boolean> {
  const tenant = await tenantService.getTenantBySlug(tenantSlug);
  if (!tenant) return false;

  const plugins = await tenantService.getTenantPlugins(tenant.id);
  return plugins.some((p) => p.pluginKey === pluginKey && p.enabled);
}
