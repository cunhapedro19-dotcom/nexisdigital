"use server";

import { prisma } from "@nexis/db";
import { getTenantFromRequest, getUserTenantRole } from "./tenant.js";

/**
 * RBAC — Role-Based Access Control
 * Roles: OWNER > ADMIN > STAFF > VIEWER
 * Permissions por role e resource
 */

export type Role = "OWNER" | "ADMIN" | "STAFF" | "VIEWER";

export type Permission =
  | "tenant.read"
  | "tenant.update"
  | "tenant.delete"
  | "tenant.billing"
  | "tenant.plugins"
  | "tenant.domains"
  | "user.invite"
  | "user.update"
  | "user.delete"
  | "user.impersonate"
  | "plugin.install"
  | "plugin.uninstall"
  | "plugin.configure"
  | "plugin.data.read"
  | "plugin.data.write"
  | "plugin.data.delete"
  | "analytics.read"
  | "analytics.export"
  | "audit.read";

// Matriz de permissões por role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    "tenant.read",
    "tenant.update",
    "tenant.delete",
    "tenant.billing",
    "tenant.plugins",
    "tenant.domains",
    "user.invite",
    "user.update",
    "user.delete",
    "user.impersonate",
    "plugin.install",
    "plugin.uninstall",
    "plugin.configure",
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "analytics.read",
    "analytics.export",
    "audit.read",
  ],
  ADMIN: [
    "tenant.read",
    "tenant.update",
    "tenant.billing",
    "tenant.plugins",
    "tenant.domains",
    "user.invite",
    "user.update",
    "user.delete",
    "plugin.install",
    "plugin.uninstall",
    "plugin.configure",
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "analytics.read",
    "analytics.export",
    "audit.read",
  ],
  STAFF: [
    "tenant.read",
    "plugin.data.read",
    "plugin.data.write",
    "analytics.read",
  ],
  VIEWER: [
    "tenant.read",
    "plugin.data.read",
    "analytics.read",
  ],
};

/**
 * Verificar se role tem permissão
 */
export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verificar múltiplas permissões (todas devem passar)
 */
export function roleHasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => roleHasPermission(role, p));
}

/**
 * Verificar se role tem pelo menos uma das permissões
 */
export function roleHasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => roleHasPermission(role, p));
}

/**
 * Obter todas as permissões de um role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Comparar hierarquia de roles (maior = mais permissões)
 */
export function compareRoles(roleA: Role, roleB: Role): number {
  const hierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    STAFF: 2,
    VIEWER: 1,
  };
  return hierarchy[roleA] - hierarchy[roleB];
}

/**
 * Verificar se roleA >= roleB
 */
export function roleAtLeast(roleA: Role, roleB: Role): boolean {
  return compareRoles(roleA, roleB) >= 0;
}

/**
 * Verificar permissão no contexto da requisição atual
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const tenantContext = await getTenantFromRequest();
  if (!tenantContext) return false;

  // Em server components, o user vem do session (next-auth)
  // Aqui assumimos que a verificação é feita após autenticação
  // O ideal é usar o session do next-auth
  return true; // placeholder - implementar com session real
}

/**
 * Verificar permissão para um tenant específico
 */
export async function checkTenantPermission(
  userId: string,
  tenantId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserTenantRole(userId, tenantId);
  if (!role) return false;
  return roleHasPermission(role as Role, permission);
}

/**
 * Helper para Server Actions - verificar permissão antes de executar
 */
export async function requirePermission(
  userId: string,
  tenantId: string,
  permission: Permission
): Promise<void> {
  const hasPermission = await checkTenantPermission(userId, tenantId, permission);
  if (!hasPermission) {
    throw new Error(`Permissão negada: ${permission}`);
  }
}

/**
 * Permissões por plugin (granularidade extra)
 */
export const PLUGIN_PERMISSIONS: Record<string, Permission[]> = {
  pousadas: [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
  livrarias: [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
  cardapio: [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
  catalogo: [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
  "site-institucional": [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
  "gestao-empresarial": [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
  "gestao-rh": [
    "plugin.data.read",
    "plugin.data.write",
    "plugin.data.delete",
    "plugin.configure",
  ],
};

/**
 * Verificar se usuário pode acessar plugin no tenant
 */
export async function canAccessPlugin(
  userId: string,
  tenantId: string,
  pluginKey: string
): Promise<boolean> {
  const role = await getUserTenantRole(userId, tenantId);
  if (!role) return false;

  const requiredPermissions = PLUGIN_PERMISSIONS[pluginKey] || ["plugin.data.read"];
  return roleHasAnyPermission(role as Role, requiredPermissions);
}

/**
 * Verificar se usuário pode gerenciar plugin (instalar/configurar)
 */
export async function canManagePlugin(
  userId: string,
  tenantId: string,
  pluginKey: string
): Promise<boolean> {
  const role = await getUserTenantRole(userId, tenantId);
  if (!role) return false;
  return roleHasPermission(role as Role, "plugin.configure");
}