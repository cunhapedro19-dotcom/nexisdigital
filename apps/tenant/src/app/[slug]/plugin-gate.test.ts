import { describe, it, expect, vi } from "vitest";

// PluginGate é um server helper puro — mock do tenantService
vi.mock("@nexis/tenant/server", () => ({
  tenantService: {
    getTenantBySlug: vi.fn(),
    getTenantPlugins: vi.fn(),
  },
}));

import { PluginGate } from "./plugin-gate";
import { tenantService } from "@nexis/tenant/server";

describe("PluginGate", () => {
  it("retorna false quando tenant não existe", async () => {
    vi.mocked(tenantService.getTenantBySlug).mockResolvedValue(null as any);
    expect(await PluginGate("fantasma", "pousadas")).toBe(false);
  });

  it("retorna true quando plugin habilitado", async () => {
    vi.mocked(tenantService.getTenantBySlug).mockResolvedValue({ id: "t1" } as any);
    vi.mocked(tenantService.getTenantPlugins).mockResolvedValue([
      { pluginKey: "pousadas", enabled: true },
    ] as any);
    expect(await PluginGate("pousada-joao", "pousadas")).toBe(true);
  });

  it("retorna false quando plugin desabilitado", async () => {
    vi.mocked(tenantService.getTenantBySlug).mockResolvedValue({ id: "t1" } as any);
    vi.mocked(tenantService.getTenantPlugins).mockResolvedValue([
      { pluginKey: "pousadas", enabled: false },
    ] as any);
    expect(await PluginGate("pousada-joao", "pousadas")).toBe(false);
  });
});
