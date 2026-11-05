"use server";

import { auth } from "./server.js";
import { prisma } from "@nexis/db";
import { getTenantFromRequest, setActiveTenant, clearActiveTenant } from "./tenant.js";
import type { Session, User } from "next-auth";

/**
 * Server-side session helpers
 * Extendem o session do next-auth com dados multi-tenant
 */

export interface ExtendedSession extends Session {
  user: (Session["user"] & {
    id: string;
    role: string;
    activeTenantId?: string;
    memberships: Array<{
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      role: string;
    }>;
  }) | null;
}

/**
 * Obter session estendida com tenant ativo e memberships
 */
export async function getExtendedSession(): Promise<ExtendedSession> {
  const session = await auth();
  if (!session?.user) {
    return { ...session, user: null } as ExtendedSession;
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return session as ExtendedSession;
  }

  // Buscar memberships atualizadas
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      tenant: {
        select: { id: true, slug: true, name: true, status: true },
      },
    },
  });

  const activeMemberships = memberships
    .filter((m) => m.tenant.status === "ACTIVE")
    .map((m) => ({
      tenantId: m.tenantId,
      tenantSlug: m.tenant.slug,
      tenantName: m.tenant.name,
      role: m.role,
    }));

  // Determinar tenant ativo
  let activeTenantId = (session.user as any).activeTenantId;
  if (!activeTenantId && activeMemberships.length > 0) {
    // Tentar pegar do cookie
    const tenantContext = await getTenantFromRequest();
    if (tenantContext) {
      activeTenantId = tenantContext.tenantId;
    } else {
      // Default para o primeiro
      activeTenantId = activeMemberships[0].tenantId;
    }
  }

  // Determinar role no tenant ativo
  let role = (session.user as any).role || "VIEWER";
  if (activeTenantId) {
    const activeMembership = activeMemberships.find((m) => m.tenantId === activeTenantId);
    if (activeMembership) {
      role = activeMembership.role;
    }
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: userId,
      role,
      activeTenantId,
      memberships: activeMemberships,
    },
  } as ExtendedSession;
}

/**
 * Obter tenant ativo da session
 */
export async function getActiveTenant() {
  const session = await getExtendedSession();
  if (!session.user?.activeTenantId) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.activeTenantId },
    include: {
      plan: true,
      memberships: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
  });

  return tenant;
}

/**
 * Obter role do usuário no tenant ativo
 */
export async function getActiveTenantRole(): Promise<string | null> {
  const session = await getExtendedSession();
  return session.user?.role ?? null;
}

/**
 * Verificar se usuário é owner do tenant ativo
 */
export async function isTenantOwner(): Promise<boolean> {
  const role = await getActiveTenantRole();
  return role === "OWNER";
}

/**
 * Verificar se usuário é admin ou owner do tenant ativo
 */
export async function isTenantAdmin(): Promise<boolean> {
  const role = await getActiveTenantRole();
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Trocar tenant ativo (server action)
 */
export async function switchActiveTenant(tenantId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getExtendedSession();
  if (!session.user) {
    return { success: false, error: "Não autenticado" };
  }

  // Verificar se usuário tem acesso a este tenant
  const membership = session.user.memberships.find((m) => m.tenantId === tenantId);
  if (!membership) {
    return { success: false, error: "Acesso negado a este tenant" };
  }

  // Verificar se tenant está ativo
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, slug: true, status: true },
  });

  if (!tenant || tenant.status !== "ACTIVE") {
    return { success: false, error: "Tenant não encontrado ou inativo" };
  }

  // Atualizar cookie
  await setActiveTenant(tenant.id, tenant.slug);

  return { success: true };
}

/**
 * Obter todos os tenants acessíveis pelo usuário
 */
export async function getUserTenants(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: {
      tenant: {
        include: {
          plan: true,
          _count: {
            select: { users: true, pluginData: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Convidar usuário para tenant
 */
export async function inviteUserToTenant(
  tenantId: string,
  email: string,
  role: "ADMIN" | "STAFF" | "VIEWER" = "STAFF"
) {
  const session = await getExtendedSession();
  if (!session.user) throw new Error("Não autenticado");

  // Verificar permissão
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    throw new Error("Permissão negada");
  }

  // Verificar se usuário já existe
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Criar usuário sem senha (vai definir no primeiro login)
    user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        role: "VIEWER", // role global, membership define role no tenant
      },
    });
  }

  // Criar/atualizar membership
  const membership = await prisma.membership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId } },
    update: { role },
    create: { userId: user.id, tenantId, role },
  });

  // Log auditoria
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: session.user.id,
      action: "user.invited",
      entity: "Membership",
      entityId: membership.id,
      after: { email, role },
    },
  });

  // TODO: Enviar email de convite

  return membership;
}

/**
 * Atualizar role de membro
 */
export async function updateMemberRole(
  tenantId: string,
  targetUserId: string,
  newRole: "ADMIN" | "STAFF" | "VIEWER"
) {
  const session = await getExtendedSession();
  if (!session.user) throw new Error("Não autenticado");

  // Verificar permissão (apenas OWNER pode promover para ADMIN)
  if (newRole === "ADMIN" && session.user.role !== "OWNER") {
    throw new Error("Apenas owners podem promover para admin");
  }

  // Não pode alterar próprio role se for OWNER
  if (targetUserId === session.user.id && session.user.role === "OWNER") {
    throw new Error("Não pode alterar próprio role de owner");
  }

  const membership = await prisma.membership.update({
    where: { userId_tenantId: { userId: targetUserId, tenantId } },
    data: { role: newRole },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: session.user.id,
      action: "user.role_updated",
      entity: "Membership",
      entityId: membership.id,
      before: { role: membership.role },
      after: { role: newRole },
    },
  });

  return membership;
}

/**
 * Remover membro do tenant
 */
export async function removeMember(tenantId: string, targetUserId: string) {
  const session = await getExtendedSession();
  if (!session.user) throw new Error("Não autenticado");

  // Não pode remover a si mesmo se for OWNER
  if (targetUserId === session.user.id && session.user.role === "OWNER") {
    throw new Error("Owner não pode se remover");
  }

  await prisma.membership.delete({
    where: { userId_tenantId: { userId: targetUserId, tenantId } },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: session.user.id,
      action: "user.removed",
      entity: "Membership",
      entityId: `${targetUserId}:${tenantId}`,
      after: { targetUserId },
    },
  });
}