"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "next-auth";

/**
 * Client-side auth helpers
 */

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = session?.user;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isUnauthenticated = status === "unauthenticated";

  // Tenant ativo
  const activeTenantId = user?.activeTenantId;
  const memberships = user?.memberships || [];

  // Role no tenant ativo
  const getTenantRole = useCallback(
    (tenantId?: string) => {
      const tid = tenantId || activeTenantId;
      if (!tid) return "VIEWER";
      const membership = memberships.find((m) => m.tenantId === tid);
      return membership?.role || "VIEWER";
    },
    [activeTenantId, memberships]
  );

  const role = getTenantRole();

  // Verificar permissões
  const hasRole = useCallback(
    (allowedRoles: string | string[], tenantId?: string) => {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = getTenantRole(tenantId);
      return roles.includes(userRole);
    },
    [getTenantRole]
  );

  const isOwner = hasRole("OWNER");
  const isAdmin = hasRole(["OWNER", "ADMIN"]);
  const isStaff = hasRole(["OWNER", "ADMIN", "STAFF"]);

  // Trocar tenant ativo
  const switchTenant = useCallback(
    async (tenantId: string) => {
      await update({ activeTenantId: tenantId });
      router.refresh();
    },
    [update, router]
  );

  // Login helpers
  const login = useCallback(
    async (email: string, password: string, tenantSlug?: string) => {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const params = new URLSearchParams({ callbackUrl });
      if (tenantSlug) params.set("tenantSlug", tenantSlug);
      return signIn("credentials", {
        email,
        password,
        tenantSlug,
        redirect: false,
        callbackUrl: `/auth/callback?${params.toString()}`,
      });
    },
    [searchParams]
  );

  const loginWithProvider = useCallback(
    (provider: "google" | "github", tenantSlug?: string) => {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const params = new URLSearchParams({ callbackUrl });
      if (tenantSlug) params.set("tenantSlug", tenantSlug);
      return signIn(provider, { callbackUrl: `/auth/callback?${params.toString()}` });
    },
    [searchParams]
  );

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    activeTenantId,
    memberships,
    role,
    hasRole,
    isOwner,
    isAdmin,
    isStaff,
    switchTenant,
    login,
    loginWithProvider,
    logout,
    updateSession: update,
  };
}

/**
 * Hook para proteger páginas que requerem autenticação
 */
export function useRequireAuth(redirectTo = "/auth/signin") {
  const { isLoading, isAuthenticated, isUnauthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isUnauthenticated) {
      router.push(redirectTo);
    }
  }, [isUnauthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated };
}

/**
 * Hook para proteger páginas que requerem role específica
 */
export function useRequireRole(allowedRoles: string | string[], redirectTo = "/dashboard") {
  const { isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !hasRole(allowedRoles)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, hasRole, allowedRoles, router, redirectTo]);

  return { isLoading, isAuthorized: isAuthenticated && hasRole(allowedRoles) };
}

/**
 * Hook para obter tenant atual com dados completos
 */
export function useTenant() {
  const { activeTenantId, memberships, isLoading } = useAuth();
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    if (activeTenantId) {
      const membership = memberships.find((m) => m.tenantId === activeTenantId);
      setTenant(membership || null);
    } else {
      setTenant(null);
    }
  }, [activeTenantId, memberships]);

  return { tenant, isLoading };
}