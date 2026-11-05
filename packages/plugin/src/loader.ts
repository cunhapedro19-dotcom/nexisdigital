"use client";

import { useEffect, useState, useCallback } from "react";
import type { PluginManifest, PluginRoute, PluginAdminMenu } from "@nexis/core/plugins";

/**
 * Client-side Plugin Loader
 * Carrega manifestos e rotas de plugins instalados no tenant atual
 */

interface UsePluginsReturn {
  plugins: PluginManifest[];
  routes: PluginRoute[];
  adminMenus: PluginAdminMenu[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePlugins(tenantId: string): UsePluginsReturn {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [routes, setRoutes] = useState<PluginRoute[]>([]);
  const [adminMenus, setAdminMenus] = useState<PluginAdminMenu[]>([]);
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
      setRoutes(data.routes || []);
      setAdminMenus(data.adminMenus || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  return { plugins, routes, adminMenus, isLoading, error, refresh: load };
}

/**
 * Dynamic import de componente de plugin
 * Uso: const Component = await loadPluginComponent("pousadas", "pages/PousadasPage");
 */
export async function loadPluginComponent(
  pluginKey: string,
  componentPath: string
): Promise<React.ComponentType<any> | null> {
  try {
    const module = await import(`@nexis/plugin-${pluginKey}/${componentPath}`);
    return module.default || module;
  } catch (error) {
    console.error(`Falha ao carregar componente ${componentPath} do plugin ${pluginKey}:`, error);
    return null;
  }
}

/**
 * Carregar rota de plugin (página ou API)
 */
export async function loadPluginRoute(
  pluginKey: string,
  routeType: "page" | "api" | "admin",
  routePath: string
): Promise<any> {
  try {
    const module = await import(`@nexis/plugin-${pluginKey}/routes/${routeType}/${routePath}`);
    return module.default || module;
  } catch (error) {
    console.error(`Falha ao carregar rota ${routeType}/${routePath} do plugin ${pluginKey}:`, error);
    return null;
  }
}

/**
 * Hook para renderizar rota de plugin dinamicamente
 */
export function usePluginRoute(
  pluginKey: string,
  routeType: "page" | "api" | "admin",
  routePath: string
) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    loadPluginRoute(pluginKey, routeType, routePath).then((mod) => {
      if (mounted) {
        setComponent(mod);
        setIsLoading(false);
      }
    }).catch((e) => {
      if (mounted) {
        setError(e);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [pluginKey, routeType, routePath]);

  return { Component, isLoading, error };
}

/**
 * Manifesto de plugin tipado para uso no cliente
 */
export interface ClientPluginManifest extends PluginManifest {
  installed: boolean;
  enabled: boolean;
  config: Record<string, unknown>;
}