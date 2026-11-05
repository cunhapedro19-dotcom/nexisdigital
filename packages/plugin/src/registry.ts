"use server";

import { prisma } from "@nexis/db";
import { getPluginRegistry, type PluginManifest, type PluginContext, type PluginInstance } from "@nexis/core/plugins";
import { getServerEventBus } from "@nexis/core/events";
import { withTenant } from "@nexis/db/client";

/**
 * Plugin Registry Server-side
 * Gerencia instalação, configuração e ciclo de vida de plugins por tenant
 */

export interface TenantPluginState {
  pluginKey: string;
  tenantId: string;
  enabled: boolean;
  config: Record<string, unknown>;
  version: string;
  installedAt: Date;
  updatedAt: Date;
  status: "installed" | "enabled" | "disabled" | "error" | "updating";
  error?: string;
}

export class PluginRegistryServer {
  private registry = getPluginRegistry(getServerEventBus());

  /**
   * Listar plugins disponíveis (do registry core)
   */
  getAvailablePlugins(): PluginManifest[] {
    return this.registry.getAll();
  }

  getPlugin(key: string): PluginManifest | undefined {
    return this.registry.get(key);
  }

  /**
   * Listar plugins instalados no tenant
   */
  async getTenantPlugins(tenantId: string): Promise<TenantPluginState[]> {
    const pluginData = await prisma.pluginData.findMany({
      where: {
        tenantId,
        pluginKey: { in: this.registry.getAll().map((p) => p.key) },
        entity: "plugin_state",
      },
    });

    return pluginData.map((pd) => pd.data as unknown as TenantPluginState);
  }

  /**
   * Obter estado de um plugin no tenant
   */
  async getTenantPluginState(tenantId: string, pluginKey: string): Promise<TenantPluginState | null> {
    const pd = await prisma.pluginData.findFirst({
      where: { tenantId, pluginKey, entity: "plugin_state", entityId: pluginKey },
    });
    return pd ? (pd.data as unknown as TenantPluginState) : null;
  }

  /**
   * Instalar plugin no tenant
   */
  async installPlugin(
    tenantId: string,
    pluginKey: string,
    config?: Record<string, unknown>,
    userId?: string
  ): Promise<TenantPluginState> {
    const manifest = this.registry.get(pluginKey);
    if (!manifest) throw new Error(`Plugin ${pluginKey} não encontrado`);

    // Verificar dependências
    for (const dep of manifest.dependencies || []) {
      if (!dep.optional) {
        const depState = await this.getTenantPluginState(tenantId, dep.key);
        if (!depState || !depState.enabled) {
          throw new Error(`Dependência obrigatória ${dep.key} não instalada/habilitada`);
        }
      }
    }

    // Verificar limites do plano
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    if (!tenant) throw new Error("Tenant não encontrado");

    const installedCount = await this.getEnabledPluginCount(tenantId);
    const maxPlugins = tenant.plan.features.maxPlugins as number;
    if (maxPlugins !== -1 && installedCount >= maxPlugins) {
      throw new Error(`Limite de plugins do plano atingido (${maxPlugins})`);
    }

    // Validar config com schema do plugin
    const validatedConfig = manifest.configSchema.parse(config || {});

    // Mesclar com defaults
    const finalConfig = { ...manifest.defaultConfig, ...validatedConfig };

    // Criar estado inicial
    const state: TenantPluginState = {
      pluginKey,
      tenantId,
      enabled: true,
      config: finalConfig,
      version: manifest.version,
      installedAt: new Date(),
      updatedAt: new Date(),
      status: "installed",
    };

    // Salvar no PluginData (polimórfico)
    await prisma.pluginData.upsert({
      where: { tenantId_pluginKey_entity_entityId: { tenantId, pluginKey, entity: "plugin_state", entityId: pluginKey } },
      create: {
        tenantId,
        pluginKey,
        entity: "plugin_state",
        entityId: pluginKey,
        data: state,
      },
      update: { data: state },
    });

    // Carregar plugin (inicializar)
    const tenantPrisma = withTenant(prisma, tenantId);
    const context = await this.createPluginContext(tenantId, tenantPrisma, finalConfig);
    const plugin = await this.registry.load(pluginKey, context);

    // Executar hook de instalação
    if (plugin.onInstall) {
      await plugin.onInstall();
    }

    // Atualizar status
    state.status = "enabled";
    state.updatedAt = new Date();
    await prisma.pluginData.update({
      where: { tenantId_pluginKey_entity_entityId: { tenantId, pluginKey, entity: "plugin_state", entityId: pluginKey } },
      data: { data: state },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "plugin.installed",
        entity: "Plugin",
        entityId: pluginKey,
        after: { pluginKey, config: finalConfig },
      },
    });

    // Emit event
    getServerEventBus().emitTyped("plugin.installed", { pluginKey, tenantId }, { tenantId, userId });

    return state;
  }

  /**
   * Desinstalar plugin do tenant
   */
  async uninstallPlugin(tenantId: string, pluginKey: string, userId?: string): Promise<void> {
    const state = await this.getTenantPluginState(tenantId, pluginKey);
    if (!state) throw new Error(`Plugin ${pluginKey} não instalado`);

    // Carregar plugin para executar onUninstall
    const manifest = this.registry.get(pluginKey);
    if (manifest && this.registry.isLoaded(pluginKey)) {
      const plugin = this.registry.getLoaded().find((p) => p.manifest.key === pluginKey);
      if (plugin?.onUninstall) {
        await plugin.onUninstall();
      }
    }

    // Descarregar
    await this.registry.unload(pluginKey);

    // Remover estado
    await prisma.pluginData.delete({
      where: { tenantId_pluginKey_entity_entityId: { tenantId, pluginKey, entity: "plugin_state", entityId: pluginKey } },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "plugin.uninstalled",
        entity: "Plugin",
        entityId: pluginKey,
        before: { pluginKey },
      },
    });

    getServerEventBus().emitTyped("plugin.uninstalled", { pluginKey, tenantId }, { tenantId, userId });
  }

  /**
   * Habilitar/desabilitar plugin
   */
  async setPluginEnabled(tenantId: string, pluginKey: string, enabled: boolean, userId?: string): Promise<TenantPluginState> {
    const state = await this.getTenantPluginState(tenantId, pluginKey);
    if (!state) throw new Error(`Plugin ${pluginKey} não instalado`);

    state.enabled = enabled;
    state.status = enabled ? "enabled" : "disabled";
    state.updatedAt = new Date();

    await prisma.pluginData.update({
      where: { tenantId_pluginKey_entity_entityId: { tenantId, pluginKey, entity: "plugin_state", entityId: pluginKey } },
      data: { data: state },
    });

    // Carregar/descarregar
    if (enabled) {
      const tenantPrisma = withTenant(prisma, tenantId);
      const context = await this.createPluginContext(tenantId, tenantPrisma, state.config);
      await this.registry.load(pluginKey, context);
      if (manifest?.onInstall) {
        const plugin = this.registry.getLoaded().find((p) => p.manifest.key === pluginKey);
        if (plugin?.onTenantActivate) await plugin.onTenantActivate();
      }
    } else {
      await this.registry.unload(pluginKey);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: enabled ? "plugin.enabled" : "plugin.disabled",
        entity: "Plugin",
        entityId: pluginKey,
        after: { enabled },
      },
    });

    getServerEventBus().emitTyped(enabled ? "plugin.enabled" : "plugin.disabled", { pluginKey, tenantId }, { tenantId, userId });

    return state;
  }

  /**
   * Atualizar configuração do plugin
   */
  async updatePluginConfig(
    tenantId: string,
    pluginKey: string,
    config: Record<string, unknown>,
    userId?: string
  ): Promise<TenantPluginState> {
    const state = await this.getTenantPluginState(tenantId, pluginKey);
    if (!state) throw new Error(`Plugin ${pluginKey} não instalado`);

    const manifest = this.registry.get(pluginKey);
    if (!manifest) throw new Error(`Plugin ${pluginKey} não encontrado`);

    // Validar
    const validatedConfig = manifest.configSchema.parse(config);

    // Mesclar (preservar chaves não enviadas)
    const finalConfig = { ...state.config, ...validatedConfig };

    state.config = finalConfig;
    state.updatedAt = new Date();

    await prisma.pluginData.update({
      where: { tenantId_pluginKey_entity_entityId: { tenantId, pluginKey, entity: "plugin_state", entityId: pluginKey } },
      data: { data: state },
    });

    // Notificar plugin carregado
    if (this.registry.isLoaded(pluginKey)) {
      const plugin = this.registry.getLoaded().find((p) => p.manifest.key === pluginKey);
      if (plugin?.onConfigUpdate) {
        await plugin.onConfigUpdate(finalConfig);
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "plugin.configured",
        entity: "Plugin",
        entityId: pluginKey,
        before: { config: state.config },
        after: { config: finalConfig },
      },
    });

    getServerEventBus().emitTyped("plugin.configured", { pluginKey, tenantId, config: finalConfig }, { tenantId, userId });

    return state;
  }

  /**
   * Criar contexto de execução do plugin
   */
  private async createPluginContext(
    tenantId: string,
    tenantPrisma: any,
    config: Record<string, unknown>
  ): Promise<PluginContext> {
    const eventBus = getServerEventBus();

    return {
      tenantId,
      prisma: tenantPrisma,
      config,
      eventEmitter: eventBus,
      storage: {
        upload: async (key: string, data: Buffer, contentType: string) => {
          // TODO: Implementar upload para S3/R2
          throw new Error("Storage não implementado");
        },
        delete: async (url: string) => {
          throw new Error("Storage não implementado");
        },
        getSignedUrl: async (key: string, expiresIn = 3600) => {
          throw new Error("Storage não implementado");
        },
      },
      email: {
        send: async (to: string, subject: string, html: string, text?: string) => {
          // TODO: Implementar envio de email (Resend/Nodemailer)
          console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
        },
        sendTemplate: async (to: string, templateId: string, data: Record<string, unknown>) => {
          console.log(`[EMAIL TEMPLATE] To: ${to}, Template: ${templateId}`);
        },
      },
      payments: {
        createCheckoutSession: async (params) => {
          throw new Error("Payments não implementado");
        },
        createPortalSession: async (customerId: string, returnUrl: string) => {
          throw new Error("Payments não implementado");
        },
        verifyWebhook: async (payload: string, signature: string) => {
          throw new Error("Payments não implementado");
        },
      },
    };
  }

  private async getEnabledPluginCount(tenantId: string): Promise<number> {
    const states = await this.getTenantPlugins(tenantId);
    return states.filter((s) => s.enabled).length;
  }
}

// Singleton
let registryServer: PluginRegistryServer | null = null;

export function getPluginRegistryServer(): PluginRegistryServer {
  if (!registryServer) {
    registryServer = new PluginRegistryServer();
  }
  return registryServer;
}