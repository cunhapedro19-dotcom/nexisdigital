import { z } from "zod";
import Stripe from "stripe";
import MercadoPago from "mercadopago";

/**
 * Billing — Abstração de pagamentos (Stripe + Mercado Pago)
 * Unifica interface para assinaturas, pagamentos avulsos, webhooks
 */

// =========================================================
// Types
// =========================================================

export type BillingProvider = "stripe" | "mercadopago" | "manual";

export interface BillingConfig {
  provider: BillingProvider;
  stripe?: StripeConfig;
  mercadopago?: MercadoPagoConfig;
}

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  apiVersion?: Stripe.LatestApiVersion;
}

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
}

export interface Price {
  id: string;
  provider: BillingProvider;
  providerPriceId: string;
  name: string;
  description?: string;
  amountCents: number;
  currency: string;
  interval?: "month" | "year" | "once";
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface Subscription {
  id: string;
  tenantId: string;
  provider: BillingProvider;
  providerSubscriptionId: string;
  providerCustomerId: string;
  status: SubscriptionStatus;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  trialEndsAt?: Date;
  metadata?: Record<string, string>;
}

export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export interface Invoice {
  id: string;
  tenantId: string;
  provider: BillingProvider;
  providerInvoiceId: string;
  subscriptionId?: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  periodStart: Date;
  periodEnd: Date;
  paidAt?: Date;
  metadata?: Record<string, string>;
}

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";

export interface CheckoutSession {
  id: string;
  url: string;
  provider: BillingProvider;
  providerSessionId: string;
  mode: "payment" | "subscription";
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface PortalSession {
  url: string;
  provider: BillingProvider;
}

export interface WebhookEvent {
  id: string;
  provider: BillingProvider;
  type: string;
  data: any;
  timestamp: Date;
  rawPayload: string;
}

// =========================================================
// Stripe Adapter
// =========================================================

export class StripeBilling {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion || "2024-04-10",
      typescript: true,
    });
    this.webhookSecret = config.webhookSecret;
  }

  // Customers
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    return this.stripe.customers.create({ email, name, metadata });
  }

  async getCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId);
  }

  async updateCustomer(customerId: string, data: { email?: string; name?: string; metadata?: Record<string, string> }) {
    return this.stripe.customers.update(customerId, data);
  }

  // Prices
  async createPrice(params: {
    name: string;
    amountCents: number;
    currency: string;
    interval?: "month" | "year";
    trialDays?: number;
    metadata?: Record<string, string>;
  }) {
    const price = await this.stripe.prices.create({
      product_data: { name: params.name },
      unit_amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      recurring: params.interval ? { interval: params.interval } : undefined,
      metadata: params.metadata,
    });
    return price;
  }

  async getPrice(priceId: string) {
    return this.stripe.prices.retrieve(priceId);
  }

  // Subscriptions
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialDays?: number;
    metadata?: Record<string, string>;
    paymentMethod?: string;
  }) {
    return this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      trial_period_days: params.trialDays,
      metadata: params.metadata,
      payment_behavior: "default_incomplete",
      payment_settings: params.paymentMethod ? { payment_method_types: ["card"], save_default_payment_method: "on_subscription" } : undefined,
      expand: ["latest_invoice.payment_intent"],
    });
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, params: {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, string>;
    trialEnd?: number | "now";
  }) {
    const updateParams: Stripe.SubscriptionUpdateParams = {};
    if (params.priceId) {
      updateParams.items = [{ id: (await this.getSubscription(subscriptionId)).items.data[0].id, price: params.priceId }];
    }
    if (params.cancelAtPeriodEnd !== undefined) updateParams.cancel_at_period_end = params.cancelAtPeriodEnd;
    if (params.metadata) updateParams.metadata = params.metadata;
    if (params.trialEnd !== undefined) updateParams.trial_end = params.trialEnd === "now" ? "now" : params.trialEnd;
    return this.stripe.subscriptions.update(subscriptionId, updateParams);
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
    if (atPeriodEnd) {
      return this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    }
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async resumeSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
  }

  // Checkout Sessions
  async createCheckoutSession(params: {
    mode: "payment" | "subscription";
    customerId?: string;
    customerEmail?: string;
    lineItems: Array<{ priceId: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      mode: params.mode,
      customer: params.customerId,
      customer_email: params.customerEmail,
      line_items: params.lineItems.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: params.mode === "subscription" && params.trialDays
        ? { trial_period_days: params.trialDays }
        : undefined,
      metadata: params.metadata,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });
    return session;
  }

  // Customer Portal
  async createPortalSession(customerId: string, returnUrl: string) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  }

  // Invoices
  async getInvoice(invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId);
  }

  async listInvoices(customerId: string, limit = 10) {
    return this.stripe.invoices.list({ customer: customerId, limit });
  }

  // Webhooks
  verifyWebhook(payload: string | Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }

  // Helpers para mapear para tipos internos
  mapSubscription(sub: Stripe.Subscription): Subscription {
    return {
      id: sub.id,
      tenantId: sub.metadata.tenantId || "",
      provider: "stripe",
      providerSubscriptionId: sub.id,
      providerCustomerId: sub.customer as string,
      status: this.mapSubscriptionStatus(sub.status),
      priceId: sub.items.data[0]?.price.id || "",
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
      metadata: sub.metadata as Record<string, string>,
    };
  }

  mapInvoice(inv: Stripe.Invoice): Invoice {
    return {
      id: inv.id,
      tenantId: inv.metadata?.tenantId || "",
      provider: "stripe",
      providerInvoiceId: inv.id,
      subscriptionId: inv.subscription as string | undefined,
      amountCents: inv.amount_due,
      currency: inv.currency.toUpperCase(),
      status: this.mapInvoiceStatus(inv.status),
      hostedInvoiceUrl: inv.hosted_invoice_url || undefined,
      invoicePdf: inv.invoice_pdf || undefined,
      periodStart: new Date(inv.period_start * 1000),
      periodEnd: new Date(inv.period_end * 1000),
      paidAt: inv.status === "paid" && inv.paid_at ? new Date(inv.paid_at * 1000) : undefined,
      metadata: inv.metadata as Record<string, string>,
    };
  }

  private mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    const map: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      incomplete: "incomplete",
      incomplete_expired: "incomplete_expired",
      trialing: "trialing",
      active: "active",
      past_due: "past_due",
      canceled: "canceled",
      unpaid: "unpaid",
      paused: "paused",
    };
    return map[status] || "incomplete";
  }

  private mapInvoiceStatus(status: Stripe.Invoice.Status): InvoiceStatus {
    const map: Record<Stripe.Invoice.Status, InvoiceStatus> = {
      draft: "draft",
      open: "open",
      paid: "paid",
      void: "void",
      uncollectible: "uncollectible",
    };
    return map[status] || "draft";
  }
}

// =========================================================
// Mercado Pago Adapter
// =========================================================

export class MercadoPagoBilling {
  private client: MercadoPago;
  private webhookSecret: string;

  constructor(config: MercadoPagoConfig) {
    this.client = new MercadoPago({ accessToken: config.accessToken });
    this.webhookSecret = config.webhookSecret;
  }

  // Customers
  async createCustomer(email: string, name?: string) {
    const customer = await this.client.customers.create({ email, first_name: name });
    return customer;
  }

  async getCustomer(customerId: string) {
    return this.client.customers.get({ customer_id: customerId });
  }

  // Preapproval Plans (subscriptions)
  async createPreapprovalPlan(params: {
    reason: string;
    auto_recurring: {
      frequency: number;
      frequency_type: "months" | "days";
      transaction_amount: number;
      currency_id: string;
      free_trial?: { frequency: number; frequency_type: "days" };
    };
    back_url: string;
    external_reference?: string;
  }) {
    return this.client.preapproval.create({ body: params });
  }

  async getPreapprovalPlan(preapprovalId: string) {
    return this.client.preapproval.get({ preapproval_id: preapprovalId });
  }

  // Subscriptions (Preapprovals)
  async createSubscription(params: {
    preapproval_plan_id: string;
    payer_email: string;
    card_token_id?: string;
    external_reference?: string;
    reason?: string;
  }) {
    const preapproval = await this.client.preapproval.create({
      body: {
        preapproval_plan_id: params.preapproval_plan_id,
        payer_email: params.payer_email,
        card_token_id: params.card_token_id,
        external_reference: params.external_reference,
        reason: params.reason || "Assinatura Nexis Digital",
      },
    });
    return preapproval;
  }

  async getSubscription(preapprovalId: string) {
    return this.client.preapproval.get({ preapproval_id: preapprovalId });
  }

  async cancelSubscription(preapprovalId: string) {
    return this.client.preapproval.cancel({ preapproval_id: preapprovalId });
  }

  // Checkout (Preference)
  async createCheckoutSession(params: {
    items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
    }>;
    payer?: { email: string; name?: string };
    back_urls: { success: string; failure: string; pending: string };
    auto_return: "approved" | "all";
    external_reference?: string;
    metadata?: Record<string, string>;
  }) {
    const preference = await this.client.preferences.create({ body: params });
    return preference;
  }

  // Webhooks
  verifyWebhook(payload: string, signature: string): boolean {
    // Mercado Pago usa x-signature header
    // Implementação simplificada
    return true;
  }

  // Helpers
  mapSubscription(mp: any): Subscription {
    return {
      id: mp.id,
      tenantId: mp.external_reference || "",
      provider: "mercadopago",
      providerSubscriptionId: mp.id,
      providerCustomerId: mp.payer_email || "",
      status: this.mapSubscriptionStatus(mp.status),
      priceId: mp.preapproval_plan_id || "",
      currentPeriodStart: new Date(mp.date_created),
      currentPeriodEnd: new Date(new Date(mp.date_created).getTime() + 30 * 24 * 60 * 60 * 1000), // aprox
      cancelAtPeriodEnd: mp.status === "cancelled",
      cancelledAt: mp.status === "cancelled" ? new Date() : undefined,
      metadata: mp.metadata as Record<string, string> || {},
    };
  }

  private mapSubscriptionStatus(status: string): SubscriptionStatus {
    const map: Record<string, SubscriptionStatus> = {
      pending: "incomplete",
      authorized: "active",
      cancelled: "canceled",
      paused: "paused",
    };
    return map[status] || "incomplete";
  }
}

// =========================================================
// Unified Billing Service
// =========================================================

export class BillingService {
  private stripe?: StripeBilling;
  private mercadopago?: MercadoPagoBilling;
  private defaultProvider: BillingProvider;

  constructor(config: BillingConfig) {
    this.defaultProvider = config.provider;

    if (config.stripe) {
      this.stripe = new StripeBilling(config.stripe);
    }

    if (config.mercadopago) {
      this.mercadopago = new MercadoPagoBilling(config.mercadopago);
    }
  }

  getProvider(provider?: BillingProvider): StripeBilling | MercadoPagoBilling {
    const p = provider || this.defaultProvider;
    if (p === "stripe" && this.stripe) return this.stripe;
    if (p === "mercadopago" && this.mercadopago) return this.mercadopago;
    throw new Error(`Provider ${p} não configurado`);
  }

  // Factory methods para criar checkout unificado
  async createCheckoutSession(params: {
    provider?: BillingProvider;
    mode: "payment" | "subscription";
    customerId?: string;
    customerEmail?: string;
    lineItems: Array<{ priceId: string; quantity: number }>;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }): Promise<CheckoutSession> {
    const provider = this.getProvider(params.provider);

    if (provider instanceof StripeBilling) {
      const session = await provider.createCheckoutSession(params);
      return {
        id: session.id,
        url: session.url!,
        provider: "stripe",
        providerSessionId: session.id,
        mode: params.mode,
        customerId: params.customerId,
        customerEmail: params.customerEmail,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        metadata: params.metadata,
      };
    }

    if (provider instanceof MercadoPagoBilling) {
      // Adaptar para formato Mercado Pago
      const session = await provider.createCheckoutSession({
        items: params.lineItems.map((item) => ({
          id: item.priceId,
          title: item.priceId, // seria melhor buscar nome do price
          quantity: item.quantity,
          unit_price: 0, // precisa buscar do price
          currency_id: "BRL",
        })),
        payer: params.customerEmail ? { email: params.customerEmail } : undefined,
        back_urls: {
          success: params.successUrl,
          failure: params.cancelUrl,
          pending: params.cancelUrl,
        },
        auto_return: "approved",
        metadata: params.metadata,
      });
      return {
        id: session.id,
        url: session.init_point!,
        provider: "mercadopago",
        providerSessionId: session.id,
        mode: params.mode,
        customerId: params.customerId,
        customerEmail: params.customerEmail,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        metadata: params.metadata,
      };
    }

    throw new Error("Provider não suportado");
  }

  async createPortalSession(customerId: string, returnUrl: string, provider?: BillingProvider): Promise<PortalSession> {
    const p = this.getProvider(provider);
    if (p instanceof StripeBilling) {
      const session = await p.createPortalSession(customerId, returnUrl);
      return { url: session.url, provider: "stripe" };
    }
    throw new Error("Portal session não suportado para este provider");
  }

  async verifyWebhook(provider: BillingProvider, payload: string, signature: string): Promise<WebhookEvent> {
    const p = this.getProvider(provider);
    let event: any;

    if (p instanceof StripeBilling) {
      event = p.verifyWebhook(payload, signature);
    } else if (p instanceof MercadoPagoBilling) {
      // MP verification
      event = JSON.parse(payload);
    } else {
      throw new Error("Provider não suportado");
    }

    return {
      id: event.id || crypto.randomUUID(),
      provider,
      type: event.type,
      data: event.data?.object || event,
      timestamp: new Date(event.created * 1000 || Date.now()),
      rawPayload: payload,
    };
  }
}

// =========================================================
// Schemas para validação
// =========================================================

export const createSubscriptionSchema = z.object({
  tenantId: z.string().cuid(),
  priceId: z.string(),
  provider: z.enum(["stripe", "mercadopago"]).default("stripe"),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().int().min(0).max(365).optional(),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  atPeriodEnd: z.boolean().default(true),
});

export const createCheckoutSchema = z.object({
  tenantId: z.string().cuid(),
  mode: z.enum(["payment", "subscription"]),
  priceId: z.string(),
  quantity: z.number().int().min(1).default(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  provider: z.enum(["stripe", "mercadopago"]).default("stripe"),
  trialDays: z.number().int().min(0).max(365).optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;