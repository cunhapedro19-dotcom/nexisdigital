"use client";

import { useEffect } from "react";

/**
 * Aplica o tema white-label do tenant via CSS custom properties.
 * As cores vêm do registro Tenant no banco (editáveis no admin).
 */
export function TenantTheme({
  primaryColor,
  secondaryColor,
  tenantName,
  children,
}: {
  primaryColor: string;
  secondaryColor: string;
  tenantName: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-cyan", primaryColor);
    root.style.setProperty("--text-accent", primaryColor);
    root.style.setProperty("--border-accent", primaryColor);
    root.style.setProperty("--brand-amber", secondaryColor);
    root.style.setProperty("--tenant-name", tenantName);
    // Título da aba (fallback para SSR sem metadata)
    document.title = tenantName;
  }, [primaryColor, secondaryColor, tenantName]);

  return <>{children}</>;
}
