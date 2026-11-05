import { NextRequest, NextResponse } from "next/server";
import { tenantService } from "@nexis/tenant/server";
import { getPluginRegistryServer } from "@nexis/plugin/registry";

/**
 * GET /api/tenant/:tenantId/plugins
 * Retorna manifestos dos plugins instalados + rotas + menus admin.
 * Consumido pelo hook usePlugins (@nexis/plugin) no client.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const states = await tenantService.getTenantPlugins(tenantId);
    const registry = getPluginRegistryServer();

    const manifests = states
      .filter((s) => s.enabled)
      .map((s) => registry.getPlugin(s.pluginKey))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    const routes = manifests.flatMap((m) => m.routes);
    const adminMenus = manifests
      .flatMap((m) => m.adminMenus)
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({
      plugins: manifests,
      routes,
      adminMenus,
    });
  } catch (error) {
    console.error("[GET /api/tenant/:tenantId/plugins]", error);
    return NextResponse.json({ error: "Erro ao carregar plugins" }, { status: 500 });
  }
}
