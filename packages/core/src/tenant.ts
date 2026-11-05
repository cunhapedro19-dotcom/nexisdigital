import { z } from "zod";

/**
 * Tenant Context & Configuration
 * Tipos e helpers para contexto multi-tenant
 */

// =========================================================
// Tenant Settings Schema
// =========================================================

export const tenantSettingsSchema = z.object({
  // Features flags por plugin
  features: z.object({
    pousadas: z.boolean().default(false),
    livrarias: z.boolean().default(false),
    cardapio: z.boolean().default(false),
    catalogo: z.boolean().default(false),
    siteInstitucional: z.boolean().default(false),
    gestaoEmpresarial: z.boolean().default(false),
    gestaoRh: z.boolean().default(false),
  }).default({}),

  // Layout e tema
  layout: z.enum(["modern", "classic", "minimal"]).default("modern"),
  theme: z.object({
    primaryColor: z.string().default("#06b6d4"),
    secondaryColor: z.string().default("#fbbf24"),
    fontFamily: z.string().default("Inter"),
    borderRadius: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
    density: z.enum(["compact", "comfortable", "spacious"]).default("comfortable"),
  }).default({}),

  // Localização
  locale: z.string().default("pt-BR"),
  timezone: z.string().default("America/Sao_Paulo"),
  currency: z.string().default("BRL"),
  dateFormat: z.string().default("dd/MM/yyyy"),
  timeFormat: z.enum(["12h", "24h"]).default("24h"),

  // SEO defaults
  seo: z.object({
    defaultTitle: z.string().default(""),
    defaultDescription: z.string().default(""),
    defaultImage: z.string().url().optional(),
    twitterHandle: z.string().optional(),
    facebookAppId: z.string().optional(),
  }).default({}),

  // Integrações
  integrations: z.object({
    googleAnalytics: z.string().optional(),
    googleTagManager: z.string().optional(),
    facebookPixel: z.string().optional(),
    hotjar: z.string().optional(),
    sentry: z.string().optional(),
  }).default({}),

  // Configurações de email
  email: z.object({
    fromName: z.string().default("Nexis Digital"),
    fromEmail: z.string().email().default("noreply@nexisdigital.com.br"),
    replyTo: z.string().email().optional(),
    templates: z.record(z.string()).default({}),
  }).default({}),

  // Configurações de pagamento
  payments: z.object({
    stripeEnabled: z.boolean().default(false),
    mercadopagoEnabled: z.boolean().default(false),
    pixEnabled: z.boolean().default(true),
    boletoEnabled: z.boolean().default(false),
    installmentsEnabled: z.boolean().default(true),
    maxInstallments: z.number().default(12),
  }).default({}),

  // Configurações de API
  api: z.object({
    rateLimit: z.number().default(100),
    rateLimitWindow: z.string().default("1m"),
    webhookSecret: z.string().optional(),
    allowedOrigins: z.array(z.string()).default([]),
  }).default({}),

  // Configurações de armazenamento
  storage: z.object({
    provider: z.enum(["local", "s3", "r2", "cloudinary"]).default("local"),
    maxFileSize: z.number().default(10 * 1024 * 1024), // 10MB
    allowedMimeTypes: z.array(z.string()).default([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
    ]),
  }).default({}),
});

export type TenantSettings = z.infer<typeof tenantSettingsSchema>;

// =========================================================
// Tenant Context (runtime)
// =========================================================

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL" | "CANCELLED";
  planId: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    features: Record<string, unknown>;
    limits: Record<string, unknown>;
  };
  settings: TenantSettings;
  memberships: Array<{
    userId: string;
    role: "OWNER" | "ADMIN" | "STAFF" | "VIEWER";
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// =========================================================
// Plugin Config per Tenant
// =========================================================

export interface TenantPluginConfig {
  pluginKey: string;
  tenantId: string;
  enabled: boolean;
  config: Record<string, unknown>;
  installedAt: Date;
  updatedAt: Date;
  version: string;
}

export const tenantPluginConfigSchema = z.object({
  pluginKey: z.string(),
  tenantId: z.string(),
  enabled: z.boolean().default(true),
  config: z.record(z.unknown()).default({}),
  version: z.string().default("1.0.0"),
});

// =========================================================
// Helpers
// =========================================================

/**
 * Validar configurações do tenant
 */
export function validateTenantSettings(settings: unknown): TenantSettings {
  return tenantSettingsSchema.parse(settings);
}

/**
 * Mesclar configurações com defaults
 */
export function mergeTenantSettings(
  current: Partial<TenantSettings>,
  updates: Partial<TenantSettings>
): TenantSettings {
  return tenantSettingsSchema.parse({
    ...tenantSettingsSchema.parse(current),
    ...updates,
    features: {
      ...tenantSettingsSchema.parse(current).features,
      ...updates.features,
    },
    theme: {
      ...tenantSettingsSchema.parse(current).theme,
      ...updates.theme,
    },
    seo: {
      ...tenantSettingsSchema.parse(current).seo,
      ...updates.seo,
    },
    integrations: {
      ...tenantSettingsSchema.parse(current).integrations,
      ...updates.integrations,
    },
    email: {
      ...tenantSettingsSchema.parse(current).email,
      ...updates.email,
    },
    payments: {
      ...tenantSettingsSchema.parse(current).payments,
      ...updates.payments,
    },
    api: {
      ...tenantSettingsSchema.parse(current).api,
      ...updates.api,
    },
    storage: {
      ...tenantSettingsSchema.parse(current).storage,
      ...updates.storage,
    },
  });
}

/**
 * Verificar se tenant tem feature habilitada
 */
export function tenantHasFeature(context: TenantContext, feature: keyof TenantSettings["features"]): boolean {
  return context.settings.features[feature] === true;
}

/**
 * Verificar limite do plano
 */
export function checkPlanLimit(
  context: TenantContext,
  limitKey: string,
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = context.plan.limits[limitKey] as number;
  if (limit === -1) return { allowed: true, limit: -1, remaining: -1 }; // ilimitado
  const remaining = Math.max(0, limit - currentUsage);
  return { allowed: currentUsage < limit, limit, remaining };
}

/**
 * Obter cor primária do tenant (com fallback)
 */
export function getTenantPrimaryColor(context: TenantContext): string {
  return context.primaryColor || context.settings.theme.primaryColor || "#06b6d4";
}

/**
 * Obter cor secundária do tenant (com fallback)
 */
export function getTenantSecondaryColor(context: TenantContext): string {
  return context.secondaryColor || context.settings.theme.secondaryColor || "#fbbf24";
}

/**
 * Gerar CSS custom properties para o tenant
 */
export function generateTenantCSSVariables(context: TenantContext): Record<string, string> {
  const primary = getTenantPrimaryColor(context);
  const secondary = getTenantSecondaryColor(context);

  return {
    "--tenant-primary": primary,
    "--tenant-primary-hover": adjustColor(primary, -20),
    "--tenant-primary-light": `${primary}20`, // 12% opacity
    "--tenant-secondary": secondary,
    "--tenant-secondary-hover": adjustColor(secondary, -20),
    "--tenant-secondary-light": `${secondary}20`,
    "--tenant-font": context.settings.theme.fontFamily,
    "--tenant-radius": getRadiusValue(context.settings.theme.borderRadius),
  };
}

function adjustColor(hex: string, amount: number): string {
  // Simplificado - em produção usar uma lib como chroma-js
  return hex;
}

function getRadiusValue(radius: "none" | "sm" | "md" | "lg" | "xl"): string {
  const map = {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
  };
  return map[radius];
}

/**
 * Resolver domínio do tenant (subdomain ou custom)
 */
export function resolveTenantDomain(context: TenantContext, platformDomain: string): string {
  if (context.domain) return context.domain;
  return `${context.slug}.${platformDomain}`;
}

/**
 * Verificar se request pertence ao tenant
 */
export function isRequestForTenant(hostname: string, context: TenantContext, platformDomain: string): boolean {
  const expectedDomain = resolveTenantDomain(context, platformDomain);
  return hostname === expectedDomain || hostname === context.domain;
}