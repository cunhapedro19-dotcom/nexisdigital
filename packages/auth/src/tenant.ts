"use server";

import { prisma } from "@nexis/db";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const TENANT_COOKIE = "nexis-tenant";
const TENANT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production"
);

/**
 * Obter tenantId do contexto da requisição
 * Prioridade: header > cookie > subdomain > default
 */
export async function getTenantFromRequest(): Promise<{ tenantId: string; tenantSlug: string } | null> {
  const cookieStore = await cookies();

  // 1. Tentar cookie
  const cookieValue = cookieStore.get(TENANT_COOKIE)?.value;
  if (cookieValue) {
    try {
      const { payload } = await jwtVerify(cookieValue, TENANT_SECRET);
      if (payload.tenantId && payload.tenantSlug) {
        // Validar se tenant ainda existe e está ativo
        const tenant = await prisma.tenant.findUnique({
          where: { id: payload.tenantId as string },
          select: { id: true, slug: true, status: true },
        });
        if (tenant && tenant.status === "ACTIVE") {
          return { tenantId: tenant.id, tenantSlug: tenant.slug };
        }
      }
    } catch {
      // Cookie inválido, continuar
    }
  }

  // 2. Tentar subdomain (para apps/tenant)
  // Em produção: tenant.slug.nexisdigital.com.br
  // Em dev: localhost:3000 -> sem subdomain
  // Esta lógica seria implementada no middleware do Next.js

  return null;
}

/**
 * Definir tenant ativo no cookie (assinado JWT)
 */
export async function setActiveTenant(tenantId: string, tenantSlug: string): Promise<string> {
  const token = await new SignJWT({ tenantId, tenantSlug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(TENANT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(TENANT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    domain: process.env.COOKIE_DOMAIN,
  });

  return token;
}

/**
 * Limpar cookie de tenant
 */
export async function clearActiveTenant(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TENANT_COOKIE);
}

/**
 * Resolver tenant por slug (para login direto)
 */
export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      domain: true,
      status: true,
      planId: true,
      settings: true,
    },
  });
}

/**
 * Verificar se usuário tem acesso ao tenant
 */
export async function userHasTenantAccess(userId: string, tenantId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    select: { role: true },
  });
  return membership;
}

/**
 * Obter role do usuário no tenant ativo
 */
export async function getUserTenantRole(userId: string, tenantId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    select: { role: true },
  });
  return membership?.role;
}