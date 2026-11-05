"use server";

import { prisma } from "@nexis/db";
import { withTenant, withTenantTransaction } from "@nexis/db/client";
import { getPluginRegistryServer } from "@nexis/plugin/registry";
import { getServerEventBus } from "@nexis/core/events";
import { validateTenantSettings, mergeTenantSettings, type TenantSettings } from "@nexis/core/tenant";
import { z } from "zod";

/**
 * Server-side Tenant Management
 * CRUD, configurações, domínios, onboarding, plugins
 */

// =========================================================
// Schemas
// =========================================================

export const createTenantSchema = z.object({
  slug: z.string().min(2).max(63).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  name: z.string().min(2).max(120),
  domain: z.string().optional(),
  planId: z.string().cuid(),
  settings: z.record(z.unknown()).optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  domain: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"]).optional(),
  planId: z.string().cuid().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateTenantSettingsSchema = z.object({
  settings: z.record(z.unknown()),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]).default("STAFF"),
});

export const updateMemberRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
});

export const verifyDomainSchema = z.object({
  domain: z.string().min(4).max(253),
  verificationToken: z.string(),
});

// =========================================================
// Tenant Service
// =========================================================

export class TenantService {
  /**
   * Criar novo tenant (onboarding)
   */
  async createTenant(data: z.infer<typeof createTenantSchema>, ownerUserId: string): Promise<{ tenant: any; membership: any }> {
    const validated = createTenantSchema.parse(data);

    // Verificar slug único
    const existing = await prisma.tenant.findUnique({ where: { slug: validated.slug } });
    if (existing) throw new Error("Slug já em uso");

    // Verificar domínio único se fornecido
    if (validated.domain) {
      const existingDomain = await prisma.tenant.findUnique({ where: { domain: validated.domain } });
      if (existingDomain) throw new Error("Domínio já em uso");
    }

    // Verificar plano
    const plan = await prisma.plan.findUnique({ where: { id: validated.planId } });
    if (!plan || !plan.isActive) throw new Error("Plano inválido ou inativo");

    // Validar settings
    const settings = validated.settings ? validateTenantSettings(validated.settings) : undefined;

    // Criar tenant + membership em transação
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: validated.slug,
          name: validated.name,
          domain: validated.domain,
          planId: validated.planId,
          settings: settings || {},
          status: "TRIAL",
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: ownerUserId,
          tenantId: tenant.id,
          role: "OWNER",
        },
      });

      // Trial subscription
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 dias trial

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: validated.planId,
          provider: "MANUAL",
          status: "TRIALING",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndsAt,
          trialEndsAt,
        },
      });

      return { tenant, membership };
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: result.tenant.id,
        userId: ownerUserId,
        action: "tenant.created",
        entity: "Tenant",
        entityId: result.tenant.id,
        after: { slug: result.tenant.slug, name: result.tenant.name, planId: result.tenant.planId },
      },
    });

    // Emit event
    getServerEventBus().emitTyped("tenant.created", { tenantId: result.tenant.id }, { tenantId: result.tenant.id, userId: ownerUserId });

    return result;
  }

  /**
   * Obter tenant por ID
   */
  async getTenant(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
        memberships: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        subscription: { include: { plan: true } },
        _count: { select: { pluginData: true, users: true } },
      },
    });
  }

  /**
   * Obter tenant por slug
   */
  async getTenantBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
      include: { plan: true, subscription: { include: { plan: true } } },
    });
  }

  /**
   * Obter tenant por domínio customizado
   */
  async getTenantByDomain(domain: string) {
    return prisma.tenant.findUnique({
      where: { domain },
      include: { plan: true, subscription: { include: { plan: true } } },
    });
  }

  /**
   * Listar tenants (com paginação)
   */
  async listTenants(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = params;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: { plan: true, subscription: true, _count: { select: { users: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    return { tenants, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Atualizar tenant
   */
  async updateTenant(tenantId: string, data: z.infer<typeof updateTenantSchema>, userId: string) {
    const validated = updateTenantSchema.parse(data);

    // Verificar domínio único se alterado
    if (validated.domain) {
      const existing = await prisma.tenant.findFirst({
        where: { domain: validated.domain, NOT: { id: tenantId } },
      });
      if (existing) throw new Error("Domínio já em uso por outro tenant");
    }

    const before = await this.getTenant(tenantId);
    if (!before) throw new Error("Tenant não encontrado");

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: validated,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "tenant.updated",
        entity: "Tenant",
        entityId: tenantId,
        before: { name: before.name, domain: before.domain, status: before.status, planId: before.planId },
        after: { name: tenant.name, domain: tenant.domain, status: tenant.status, planId: tenant.planId },
      },
    });

    // Emit event se status ou plan mudaram
    if (validated.status && validated.status !== before.status) {
      getServerEventBus().emitTyped("tenant.status_changed", { tenantId, oldStatus: before.status, newStatus: validated.status }, { tenantId, userId });
    }
    if (validated.planId && validated.planId !== before.planId) {
      getServerEventBus().emitTyped("tenant.plan_changed", { tenantId, oldPlanId: before.planId, newPlanId: validated.planId }, { tenantId, userId });
    }

    return tenant;
  }

  /**
   * Atualizar settings do tenant (merge com defaults)
   */
  async updateTenantSettings(tenantId: string, settings: Partial<TenantSettings>, userId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error("Tenant não encontrado");

    const merged = mergeTenantSettings(tenant.settings as TenantSettings, settings);
    const validated = validateTenantSettings(merged);

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: validated },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "tenant.settings_updated",
        entity: "Tenant",
        entityId: tenantId,
        before: { settings: tenant.settings },
        after: { settings: validated },
      },
    });

    getServerEventBus().emitTyped("tenant.updated", { tenantId, settings: validated }, { tenantId, userId });

    return updated;
  }

  /**
   * Excluir tenant (soft delete)
   */
  async deleteTenant(tenantId: string, userId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error("Tenant não encontrado");

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "CANCELLED", deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "tenant.deleted",
        entity: "Tenant",
        entityId: tenantId,
      },
    });

    getServerEventBus().emitTyped("tenant.deleted", { tenantId }, { tenantId, userId });
  }

  /**
   * Convidar usuário para tenant
   */
  async inviteUser(tenantId: string, data: z.infer<typeof inviteUserSchema>, inviterUserId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error("Tenant não encontrado");

    // Verificar permissão do convidador
    const inviterMembership = await prisma.membership.findUnique({
      where: { userId_tenantId: { userId: inviterUserId, tenantId } },
    });
    if (!inviterMembership || !["OWNER", "ADMIN"].includes(inviterMembership.role)) {
      throw new Error("Permissão negada");
    }

    // Verificar limites do plano
    const userCount = await prisma.membership.count({ where: { tenantId } });
    const maxUsers = tenant.plan.features.maxUsers as number;
    if (maxUsers !== -1 && userCount >= maxUsers) {
      throw new Error(`Limite de usuários do plano atingido (${maxUsers})`);
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: data.email, name: data.email.split("@")[0], role: "VIEWER" },
      });
    }

    // Criar/atualizar membership
    const membership = await prisma.membership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      update: { role: data.role },
      create: { userId: user.id, tenantId, role: data.role },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: inviterUserId,
        action: "user.invited",
        entity: "Membership",
        entityId: membership.id,
        after: { email: data.email, role: data.role },
      },
    });

    getServerEventBus().emitTyped("user.invited", { tenantId, userId: user.id, role: data.role }, { tenantId, userId: inviterUserId });

    // TODO: Enviar email de convite

    return membership;
  }

  /**
   * Atualizar role de membro
   */
  async updateMemberRole(tenantId: string, data: z.infer<typeof updateMemberRoleSchema>, requesterUserId: string) {
    const requesterMembership = await prisma.membership.findUnique({
      where: { userId_tenantId: { userId: requesterUserId, tenantId } },
    });
    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      throw new Error("Apenas owners podem alterar roles");
    }

    // Não pode alterar próprio role de OWNER
    if (data.userId === requesterUserId && requesterMembership.role === "OWNER") {
      throw new Error("Owner não pode alterar próprio role");
    }

    const membership = await prisma.membership.update({
      where: { userId_tenantId: { userId: data.userId, tenantId } },
      data: { role: data.role },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: requesterUserId,
        action: "user.role_changed",
        entity: "Membership",
        entityId: membership.id,
        after: { userId: data.userId, role: data.role },
      },
    });

    getServerEventBus().emitTyped("user.role_changed", { tenantId, userId: data.userId, role: data.role }, { tenantId, userId: requesterUserId });

    return membership;
  }

  /**
   * Remover membro do tenant
   */
  async removeMember(tenantId: string, userId: string, requesterUserId: string) {
    const requesterMembership = await prisma.membership.findUnique({
      where: { userId_tenantId: { userId: requesterUserId, tenantId } },
    });
    if (!requesterMembership || !["OWNER", "ADMIN"].includes(requesterMembership.role)) {
      throw new Error("Permissão negada");
    }

    // Não pode remover owner
    const targetMembership = await prisma.membership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    if (targetMembership?.role === "OWNER") {
      throw new Error("Não pode remover owner do tenant");
    }

    await prisma.membership.delete({
      where: { userId_tenantId: { userId, tenantId } },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: requesterUserId,
        action: "user.removed",
        entity: "Membership",
        entityId: `${userId}:${tenantId}`,
      },
    });

    getServerEventBus().emitTyped("user.removed", { tenantId, userId }, { tenantId, userId: requesterUserId });
  }

  /**
   * Verificar e configurar domínio customizado
   */
  async setupCustomDomain(tenantId: string, domain: string, userId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error("Tenant não encontrado");

    // Verificar se plano permite domínio customizado
    if (!tenant.plan.features.customDomain) {
      throw new Error("Plano atual não permite domínio customizado");
    }

    // Verificar domínio único
    const existing = await prisma.tenant.findFirst({
      where: { domain, NOT: { id: tenantId } },
    });
    if (existing) throw new Error("Domínio já em uso");

    // Gerar token de verificação DNS
    const verificationToken = `nexis-verify-${crypto.randomUUID().slice(0, 12)}`;

    // Salvar configuração pendente
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        domain: domain,
        settings: {
          ...tenant.settings,
          domainVerification: { token: verificationToken, domain, verified: false, createdAt: new Date() },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "tenant.domain_setup",
        entity: "Tenant",
        entityId: tenantId,
        after: { domain, verificationToken },
      },
    });

    return { domain, verificationToken, instructions: this.getDNSInstructions(domain, verificationToken) };
  }

  /**
   * Verificar domínio via DNS TXT record
   */
  async verifyCustomDomain(tenantId: string, data: z.infer<typeof verifyDomainSchema>, userId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error("Tenant não encontrado");

    const verification = tenant.settings?.domainVerification;
    if (!verification || verification.token !== data.verificationToken) {
      throw new Error("Token de verificação inválido");
    }

    if (verification.domain !== data.domain) {
      throw new Error("Domínio não confere");
    }

    // TODO: Verificar DNS TXT record real
    // const dnsVerified = await this.checkDNSTXT(data.domain, data.verificationToken);
    // if (!dnsVerified) throw new Error("Registro DNS não encontrado");

    // Marcar como verificado
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...tenant.settings,
          domainVerification: { ...verification, verified: true, verifiedAt: new Date() },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "tenant.domain_verified",
        entity: "Tenant",
        entityId: tenantId,
        after: { domain: data.domain },
      },
    });

    getServerEventBus().emitTyped("tenant.domain_verified", { tenantId, domain: data.domain }, { tenantId, userId });

    return { success: true, domain: data.domain };
  }

  /**
   * Remover domínio customizado
   */
  async removeCustomDomain(tenantId: string, userId: string) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error("Tenant não encontrado");

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        domain: null,
        settings: {
          ...tenant.settings,
          domainVerification: undefined,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "tenant.domain_removed",
        entity: "Tenant",
        entityId: tenantId,
      },
    });

    return { success: true };
  }

  /**
   * Obter plugins instalados no tenant
   */
  async getTenantPlugins(tenantId: string) {
    return getPluginRegistryServer().getTenantPlugins(tenantId);
  }

  /**
   * Instalar plugin no tenant
   */
  async installPlugin(tenantId: string, pluginKey: string, config?: Record<string, unknown>, userId?: string) {
    return getPluginRegistryServer().installPlugin(tenantId, pluginKey, config, userId);
  }

  /**
   * Desinstalar plugin do tenant
   */
  async uninstallPlugin(tenantId: string, pluginKey: string, userId?: string) {
    return getPluginRegistryServer().uninstallPlugin(tenantId, pluginKey, userId);
  }

  /**
   * Habilitar/desabilitar plugin
   */
  async setPluginEnabled(tenantId: string, pluginKey: string, enabled: boolean, userId?: string) {
    return getPluginRegistryServer().setPluginEnabled(tenantId, pluginKey, enabled, userId);
  }

  /**
   * Atualizar config do plugin
   */
  async updatePluginConfig(tenantId: string, pluginKey: string, config: Record<string, unknown>, userId?: string) {
    return getPluginRegistryServer().updatePluginConfig(tenantId, pluginKey, config, userId);
  }

  private getDNSInstructions(domain: string, token: string) {
    return {
      type: "TXT",
      name: "_nexis-verify",
      value: token,
      ttl: 300,
      description: `Adicione este registro TXT no DNS de ${domain} para verificar propriedade do domínio.`,
    };
  }
}

export const tenantService = new TenantService();