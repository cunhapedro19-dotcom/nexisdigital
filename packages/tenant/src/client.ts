"use client";

import { useState, useCallback, useEffect } from "react";
import type { TenantContext } from "@nexis/core/tenant";
import type { TenantPluginState } from "@nexis/plugin/registry";

/**
 * Client-side Tenant Hooks
 */

interface UseTenantReturn {
  tenant: TenantContext | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateSettings: (settings: Partial<any>) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
}

export function useTenant(tenantId?: string): UseTenantReturn {
  const [tenant, setTenant] = useState<TenantContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) {
      setTenant(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}`);
      if (!res.ok) throw new Error("Falha ao carregar tenant");
      const data = await res.json();
      setTenant(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSettings = useCallback(async (settings: Partial<any>) => {
    if (!tenantId) throw new Error("Tenant ID não disponível");
    const res = await fetch(`/api/tenant/${tenantId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) throw new Error("Falha ao atualizar configurações");
    await load();
  }, [tenantId, load]);

  const switchTenant = useCallback(async (newTenantId: string) => {
    const res = await fetch("/api/auth/switch-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: newTenantId }),
    });
    if (!res.ok) throw new Error("Falha ao trocar tenant");
    window.location.reload();
  }, []);

  return { tenant, isLoading, error, refresh: load, updateSettings, switchTenant };
}

/**
 * Hook para plugins do tenant
 */
export function useTenantPlugins(tenantId: string) {
  const [plugins, setPlugins] = useState<TenantPluginState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/plugins`);
      if (!res.ok) throw new Error("Falha ao carregar plugins");
      const data = await res.json();
      setPlugins(data.plugins || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const installPlugin = useCallback(async (pluginKey: string, config?: Record<string, unknown>) => {
    const res = await fetch(`/api/tenant/${tenantId}/plugins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginKey, config }),
    });
    if (!res.ok) throw new Error("Falha ao instalar plugin");
    await load();
  }, [tenantId, load]);

  const uninstallPlugin = useCallback(async (pluginKey: string) => {
    const res = await fetch(`/api/tenant/${tenantId}/plugins/${pluginKey}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Falha ao desinstalar plugin");
    await load();
  }, [tenantId, load]);

  const setPluginEnabled = useCallback(async (pluginKey: string, enabled: boolean) => {
    const res = await fetch(`/api/tenant/${tenantId}/plugins/${pluginKey}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error("Falha ao alterar status do plugin");
    await load();
  }, [tenantId, load]);

  const updatePluginConfig = useCallback(async (pluginKey: string, config: Record<string, unknown>) => {
    const res = await fetch(`/api/tenant/${tenantId}/plugins/${pluginKey}/config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    if (!res.ok) throw new Error("Falha ao atualizar config do plugin");
    await load();
  }, [tenantId, load]);

  return {
    plugins,
    isLoading,
    error,
    refresh: load,
    installPlugin,
    uninstallPlugin,
    setPluginEnabled,
    updatePluginConfig,
  };
}

/**
 * Hook para membros do tenant
 */
export interface TenantMember {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image: string | null };
  role: "OWNER" | "ADMIN" | "STAFF" | "VIEWER";
  createdAt: string;
}

export function useTenantMembers(tenantId: string) {
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/members`);
      if (!res.ok) throw new Error("Falha ao carregar membros");
      const data = await res.json();
      setMembers(data.members || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const inviteUser = useCallback(async (email: string, role: "ADMIN" | "STAFF" | "VIEWER" = "STAFF") => {
    const res = await fetch(`/api/tenant/${tenantId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) throw new Error("Falha ao convidar usuário");
    await load();
  }, [tenantId, load]);

  const updateRole = useCallback(async (userId: string, role: "ADMIN" | "STAFF" | "VIEWER") => {
    const res = await fetch(`/api/tenant/${tenantId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error("Falha ao atualizar role");
    await load();
  }, [tenantId, load]);

  const removeMember = useCallback(async (userId: string) => {
    const res = await fetch(`/api/tenant/${tenantId}/members/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Falha ao remover membro");
    await load();
  }, [tenantId, load]);

  return { members, isLoading, error, refresh: load, inviteUser, updateRole, removeMember };
}

/**
 * Hook para domínios customizados
 */
export interface DomainVerification {
  token: string;
  domain: string;
  verified: boolean;
  instructions: { type: string; name: string; value: string; ttl: number; description: string };
}

export function useCustomDomain(tenantId: string) {
  const [domain, setDomain] = useState<string | null>(null);
  const [verification, setVerification] = useState<DomainVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setupDomain = useCallback(async (newDomain: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });
      if (!res.ok) throw new Error("Falha ao configurar domínio");
      const data = await res.json();
      setDomain(data.domain);
      setVerification(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const verifyDomain = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/domain/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain, verificationToken: token }),
      });
      if (!res.ok) throw new Error("Falha ao verificar domínio");
      const data = await res.json();
      setVerification((prev) => prev ? { ...prev, verified: true } : null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, domain]);

  const removeDomain = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/domain`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao remover domínio");
      setDomain(null);
      setVerification(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  return { domain, verification, isLoading, error, setupDomain, verifyDomain, removeDomain };
}