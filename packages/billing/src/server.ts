"use server";

import { prisma } from "@nexis/db";
import { BillingService, type BillingConfig, type CreateSubscriptionInput, type CreateCheckoutInput } from "@nexis/core/billing";
import { getServerEventBus } from "@nexis/core/events";

/**
 * Server-side Billing Service
 * Gerencia assinaturas, checkouts, webhooks, portal do cliente
 */

// Configuração do billing (singleton)
let billingService: BillingService | null = null;

export function getBillingService(): BillingService {
  if (!billingService) {
    const config: BillingConfig = {
      provider: (process.env.BILLING_PROVIDER as any) || "stripe",
      stripe: process.env.STRIPE_SECRET_KEY ? {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      } : undefined,
      mercadopago: process.env.MERCADOPAGO_ACCESS_TOKEN ? {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        publicKey: process.env.MERCADOPAGO_PUBLIC_KEY!,
        webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
      } : undefined,
    };
    billingService = new BillingService(config);
  }
  return billingService;
}

// =========================================================
// Subscription Management
// =========================================================

export async function createSubscription(
  tenantId: string,
  data: CreateSubscriptionInput,
  userId: string
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true, subscription: true },
  });
  if (!tenant) throw new Error("Tenant não encontrado");

  // Verificar se já tem subscription ativa
  if (tenant.subscription && ["TRIALING", "ACTIVE", "PAST_DUE"].includes(tenant.subscription.status)) {
    throw new Error("Tenant já possui assinatura ativa");
  }

  const billing = getBillingService();
  const provider = data.provider || "stripe";

  // Criar/obter customer no provider
  let customerId = tenant.subscription?.providerCustId;
  if (!customerId) {
    const providerInstance = billing.getProvider(provider);
    if (providerInstance instanceof (await import("@nexis/core/billing")).StripeBilling) {
      const customer = await providerInstance.createCustomer(
        (await prisma.user.findUnique({ where: { id: userId } }))?.email || "",
        (await prisma.user.findUnique({ where: { id: userId } }))?.name || undefined,
        { tenantId }
      );
      customerId = customer.id;
    }
  }

  // Criar subscription no provider
  if (providerInstance instanceof (await import("@nexis/core/billing")).StripeBilling) {
    const subscription = await providerInstance.createSubscription({
      customerId: customerId!,
      priceId: data.priceId,
      trialDays: data.trialDays,
      metadata: { tenantId },
    });

    // Salvar no banco
    const dbSubscription = await prisma.subscription.create({
      data: {
        tenantId,
        planId: (await prisma.price.findUnique({ where: { id: data.priceId } }))?.planId || tenant.planId,
        provider,
        providerSubId: subscription.id,
        providerCustId: customerId!,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "subscription.created",
        entity: "Subscription",
        entityId: dbSubscription.id,
        after: { provider, providerSubId: subscription.id, priceId: data.priceId },
      },
    });

    getServerEventBus().emitTyped("subscription.created", { tenantId, subscriptionId: dbSubscription.id }, { tenantId, userId });

    return dbSubscription;
  }

  throw new Error("Provider não suportado para esta operação");
}

export async function cancelSubscription(
  tenantId: string,
  atPeriodEnd = true,
  userId: string
) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] } },
  });
  if (!subscription) throw new Error("Nenhuma assinatura ativa encontrada");

  const billing = getBillingService();
  const providerInstance = billing.getProvider(subscription.provider as any);

  if (providerInstance instanceof (await import("@nexis/core/billing")).StripeBilling) {
    await providerInstance.cancelSubscription(subscription.providerSubId, atPeriodEnd);
  }

  // Atualizar no banco
  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: atPeriodEnd,
      cancelledAt: atPeriodEnd ? null : new Date(),
      status: atPeriodEnd ? subscription.status : "CANCELED",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "subscription.cancelled",
      entity: "Subscription",
      entityId: subscription.id,
      after: { atPeriodEnd },
    },
  });

  getServerEventBus().emitTyped("subscription.cancelled", { tenantId, atPeriodEnd }, { tenantId, userId });

  return updated;
}

export async function resumeSubscription(tenantId: string, userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: "CANCELED" },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription) throw new Error("Nenhuma assinatura cancelada encontrada");

  const billing = getBillingService();
  const providerInstance = billing.getProvider(subscription.provider as any);

  if (providerInstance instanceof (await import("@nexis/core/billing")).StripeBilling) {
    await providerInstance.resumeSubscription(subscription.providerSubId);
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      status: "ACTIVE",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "subscription.resumed",
      entity: "Subscription",
      entityId: subscription.id,
    },
  });

  getServerEventBus().emitTyped("subscription.resumed", { tenantId }, { tenantId, userId });

  return updated;
}

export async function getSubscription(tenantId: string) {
  return prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
}

// =========================================================
// Checkout Sessions
// =========================================================

export async function createCheckoutSession(
  tenantId: string,
  data: CreateCheckoutInput,
  userId: string
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: true },
  });
  if (!tenant) throw new Error("Tenant não encontrado");

  const billing = getBillingService();
  const session = await billing.createCheckoutSession({
    ...data,
    provider: data.provider || tenant.subscription?.provider as any || "stripe",
    customerId: tenant.subscription?.providerCustId,
    customerEmail: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
    metadata: { ...data.metadata, tenantId, userId },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "checkout.session_created",
      entity: "CheckoutSession",
      entityId: session.id,
      after: { mode: data.mode, priceId: data.priceId, provider: session.provider },
    },
  });

  return session;
}

export async function createPortalSession(tenantId: string, returnUrl: string, userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription?.providerCustId) throw new Error("Customer ID não encontrado");

  const billing = getBillingService();
  const portal = await billing.createPortalSession(subscription.providerCustId, returnUrl, subscription.provider as any);

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action: "portal.session_created",
      entity: "PortalSession",
      after: { returnUrl },
    },
  });

  return portal;
}

// =========================================================
// Webhook Handlers
// =========================================================

export async function handleStripeWebhook(payload: string, signature: string) {
  const billing = getBillingService();
  const event = await billing.verifyWebhook("stripe", payload, signature);

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionChange(event.data, "stripe");
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCancelled(event.data, "stripe");
      break;
    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data, "stripe");
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event.data, "stripe");
      break;
    case "invoice.created":
      await handleInvoiceCreated(event.data, "stripe");
      break;
  }

  return { received: true };
}

export async function handleMercadoPagoWebhook(payload: string, signature: string) {
  const billing = getBillingService();
  const event = await billing.verifyWebhook("mercadopago", payload, signature);

  switch (event.type) {
    case "preapproval":
      await handleSubscriptionChange(event.data, "mercadopago");
      break;
    case "payment":
      await handlePaymentSucceeded(event.data, "mercadopago");
      break;
  }

  return { received: true };
}

// =========================================================
// Webhook Event Handlers
// =========================================================

async function handleSubscriptionChange(data: any, provider: "stripe" | "mercadopago") {
  let providerSubId: string;
  let status: string;
  let currentPeriodStart: Date;
  let currentPeriodEnd: Date;
  let cancelAtPeriodEnd: boolean;
  let trialEndsAt: Date | undefined;

  if (provider === "stripe") {
    providerSubId = data.id;
    status = data.status;
    currentPeriodStart = new Date(data.current_period_start * 1000);
    currentPeriodEnd = new Date(data.current_period_end * 1000);
    cancelAtPeriodEnd = data.cancel_at_period_end;
    trialEndsAt = data.trial_end ? new Date(data.trial_end * 1000) : undefined;
  } else {
    providerSubId = data.id;
    status = data.status;
    currentPeriodStart = new Date(data.date_created);
    currentPeriodEnd = new Date(new Date(data.date_created).getTime() + 30 * 24 * 60 * 60 * 1000);
    cancelAtPeriodEnd = data.status === "cancelled";
  }

  const tenantId = data.metadata?.tenantId;
  if (!tenantId) return;

  await prisma.subscription.updateMany({
    where: { providerSubId, provider },
    data: {
      status: mapProviderStatus(provider, status),
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      trialEndsAt,
    },
  });

  getServerEventBus().emitTyped("subscription.updated", { tenantId, providerSubId, status }, { tenantId });
}

async function handleSubscriptionCancelled(data: any, provider: "stripe" | "mercadopago") {
  const providerSubId = data.id;
  const tenantId = data.metadata?.tenantId;
  if (!tenantId) return;

  await prisma.subscription.updateMany({
    where: { providerSubId, provider },
    data: { status: "CANCELED", cancelledAt: new Date() },
  });

  getServerEventBus().emitTyped("subscription.cancelled", { tenantId, providerSubId }, { tenantId });
}

async function handlePaymentSucceeded(data: any, provider: "stripe" | "mercadopago") {
  const tenantId = data.metadata?.tenantId || data.external_reference;
  if (!tenantId) return;

  getServerEventBus().emitTyped("subscription.payment_succeeded", { tenantId, amount: data.amount || data.amount_capturable }, { tenantId });
}

async function handlePaymentFailed(data: any, provider: "stripe" | "mercadopago") {
  const tenantId = data.metadata?.tenantId || data.external_reference;
  if (!tenantId) return;

  getServerEventBus().emitTyped("subscription.payment_failed", { tenantId, error: data.last_payment_error?.message }, { tenantId });
}

async function handleInvoiceCreated(data: any, provider: "stripe" | "mercadopago") {
  const tenantId = data.metadata?.tenantId || data.subscription_details?.metadata?.tenantId;
  if (!tenantId) return;

  // Salvar invoice se for Stripe
  if (provider === "stripe") {
    await prisma.invoice.upsert({
      where: { providerInvoiceId: data.id },
      create: {
        tenantId,
        provider,
        providerInvoiceId: data.id,
        subscriptionId: (await prisma.subscription.findFirst({ where: { providerSubId: data.subscription, provider } }))?.id,
        amountCents: data.amount_due,
        currency: data.currency.toUpperCase(),
        status: mapInvoiceStatus(data.status),
        hostedInvoiceUrl: data.hosted_invoice_url,
        invoicePdf: data.invoice_pdf,
        periodStart: new Date(data.period_start * 1000),
        periodEnd: new Date(data.period_end * 1000),
      },
      update: {
        amountCents: data.amount_due,
        status: mapInvoiceStatus(data.status),
        hostedInvoiceUrl: data.hosted_invoice_url,
        invoicePdf: data.invoice_pdf,
      },
    });
  }

  getServerEventBus().emitTyped("invoice.created", { tenantId, invoiceId: data.id }, { tenantId });
}

// =========================================================
// Helpers
// =========================================================

function mapStripeStatus(status: string): any {
  const map: Record<string, any> = {
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    trialing: "TRIALING",
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    paused: "PAUSED",
  };
  return map[status] || "INCOMPLETE";
}

function mapProviderStatus(provider: string, status: string): any {
  if (provider === "stripe") return mapStripeStatus(status);
  // Mercado Pago
  const mpMap: Record<string, any> = {
    pending: "INCOMPLETE",
    authorized: "ACTIVE",
    cancelled: "CANCELED",
    paused: "PAUSED",
  };
  return mpMap[status] || "INCOMPLETE";
}

function mapInvoiceStatus(status: string): any {
  const map: Record<string, any> = {
    draft: "DRAFT",
    open: "OPEN",
    paid: "PAID",
    void: "VOID",
    uncollectible: "UNCOLLECTIBLE",
  };
  return map[status] || "DRAFT";
}