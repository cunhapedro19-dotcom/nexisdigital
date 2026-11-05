"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Client-side Billing Hooks
 */

export interface Subscription {
  id: string;
  status: string;
  plan: { id: string; name: string; priceCents: number; interval: string };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  trialEndsAt: string | null;
}

export interface Invoice {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PortalSession {
  url: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  interval: string;
  features: Record<string, unknown>;
  limits: Record<string, unknown>;
}

/**
 * Hook para subscription do tenant
 */
export function useSubscription(tenantId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/billing/subscription`);
      if (!res.ok) throw new Error("Falha ao carregar assinatura");
      const data = await res.json();
      setSubscription(data.subscription);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = useCallback(async (atPeriodEnd = true) => {
    const res = await fetch(`/api/tenant/${tenantId}/billing/subscription/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atPeriodEnd }),
    });
    if (!res.ok) throw new Error("Falha ao cancelar assinatura");
    await load();
  }, [tenantId, load]);

  const resume = useCallback(async () => {
    const res = await fetch(`/api/tenant/${tenantId}/billing/subscription/resume`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Falha ao reativar assinatura");
    await load();
  }, [tenantId, load]);

  return { subscription, isLoading, error, refresh: load, cancel, resume };
}

/**
 * Hook para faturas
 */
export function useInvoices(tenantId: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/billing/invoices`);
      if (!res.ok) throw new Error("Falha ao carregar faturas");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  return { invoices, isLoading, error, refresh: load };
}

/**
 * Hook para planos disponíveis
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/plans");
      if (!res.ok) throw new Error("Falha ao carregar planos");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { plans, isLoading, error, refresh: load };
}

/**
 * Hook para checkout
 */
export function useCheckout(tenantId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSession = useCallback(async (data: {
    mode: "payment" | "subscription";
    priceId: string;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao criar checkout");
      const session: CheckoutSession = await res.json();
      // Redirecionar para URL do checkout
      window.location.href = session.url;
      return session;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const openPortal = useCallback(async (returnUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/billing/portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl }),
      });
      if (!res.ok) throw new Error("Falha ao abrir portal");
      const portal: PortalSession = await res.json();
      window.location.href = portal.url;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  return { isLoading, error, createSession, openPortal };
}

/**
 * Formatar preço em centavos para string BRL
 */
export function formatPrice(cents: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Formatar intervalo do plano
 */
export function formatInterval(interval: string): string {
  const map: Record<string, string> = {
    MONTHLY: "/mês",
    YEARLY: "/ano",
    ONCE: " (único)",
    month: "/mês",
    year: "/ano",
  };
  return map[interval] || "";
}