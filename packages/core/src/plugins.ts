import { z } from "zod";
import type { EventEmitter } from "eventemitter3";

/**
 * Plugin System — Arquitetura de plugins para Nexis Digital
 * Cada solução demonstrativa (pousadas, livrarias, etc.) vira um plugin instalável
 */

// =========================================================
// Tipos Base
// =========================================================

export interface PluginManifest {
  key: string;                    // "pousadas", "livrarias", "cardapio", etc.
  name: string;                   // "Gestão de Pousadas"
  description: string;            // Descrição para marketplace
  version: string;                // semver
  author: string;                 // "Nexis Digital"
  license: string;                // "MIT" ou "COMMERCIAL"
  category: PluginCategory;
  icon: string;                   // Nome do ícone (lucide) ou SVG
  tags: string[];                 // ["hospitalidade", "reservas", "pousada"]

  // Requisitos
  minPlatformVersion: string;     // "0.1.0"
  dependencies?: PluginDependency[]; // outros plugins necessários

  // Capacidades
  capabilities: PluginCapability[];

  // Configuração
  configSchema: z.ZodSchema;      // Schema de configuração do plugin
  defaultConfig: Record<string, unknown>;

  // Rotas que o plugin adiciona
  routes: PluginRoute[];

  // Menus no admin
  adminMenus: PluginAdminMenu[];

  // Webhooks que o plugin emite
  webhooks: PluginWebhook[];

  // Permissões necessárias
  requiredPermissions: string[];
}

export type PluginCategory =
  | "hospitality"
  | "ecommerce"
  | "food-service"
  | "catalog"
  | "cms"
  | "erp"
  | "hr"
  | "analytics"
  | "marketing"
  | "integration";

export interface PluginDependency {
  key: string;
  version: string; // semver range
  optional: boolean;
}

export type PluginCapability =
  | "database"       // cria tabelas/models próprios
  | "api"            // expõe endpoints REST
  | "webhooks"       // emite/recebe webhooks
  | "admin-ui"       // adiciona páginas no admin
  | "public-site"    // adiciona rotas no site público
  | "scheduler"      // jobs agendados
  | "realtime"       // SSE/WebSocket
  | "storage"        // usa S3/R2
  | "email"          // envia emails
  | "payments";      // processa pagamentos

export interface PluginRoute {
  path: string;                    // "/pousadas", "/api/pousadas/*"
  type: "page" | "api" | "admin";  // tipo da rota
  component?: string;              // path para componente (dynamic import)
  handler?: string;                // path para API handler
  middleware?: string[];           // middlewares aplicados
  permissions?: string[];          // permissões necessárias
}

export interface PluginAdminMenu {
  key: string;
  label: string;
  icon: string;
  path: string;                    // "/admin/pousadas"
  order: number;
  permissions?: string[];
  children?: PluginAdminMenu[];
}

export interface PluginWebhook {
  event: string;                   // "booking.created", "order.paid"
  description: string;
  payloadSchema: z.ZodSchema;
}

// =========================================================
// Plugin Registry (singleton)
// =========================================================

class PluginRegistry {
  private plugins = new Map<string, PluginManifest>();
  private loaded = new Map<string, PluginInstance>();
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  register(manifest: PluginManifest): void {
    if (this.plugins.has(manifest.key)) {
      throw new Error(`Plugin ${manifest.key} já registrado`);
    }

    // Validar dependências
    for (const dep of manifest.dependencies || []) {
      if (!dep.optional && !this.plugins.has(dep.key)) {
        throw new Error(`Plugin ${manifest.key} depende de ${dep.key} que não está registrado`);
      }
    }

    this.plugins.set(manifest.key, manifest);
    this.eventEmitter.emit("plugin:registered", manifest);
  }

  get(key: string): PluginManifest | undefined {
    return this.plugins.get(key);
  }

  getAll(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  getByCategory(category: PluginCategory): PluginManifest[] {
    return this.getAll().filter((p) => p.category === category);
  }

  has(key: string): boolean {
    return this.plugins.has(key);
  }

  async load(key: string, context: PluginContext): Promise<PluginInstance> {
    const manifest = this.plugins.get(key);
    if (!manifest) throw new Error(`Plugin ${key} não encontrado`);
    if (this.loaded.has(key)) return this.loaded.get(key)!;

    // Dynamic import do plugin
    const module = await import(`@nexis/plugin-${key}`);
    const plugin = module.default as PluginInstance;

    await plugin.onLoad(context);
    this.loaded.set(key, plugin);
    this.eventEmitter.emit("plugin:loaded", { manifest, plugin });

    return plugin;
  }

  async unload(key: string): Promise<void> {
    const plugin = this.loaded.get(key);
    if (plugin) {
      await plugin.onUnload();
      this.loaded.delete(key);
      this.eventEmitter.emit("plugin:unloaded", key);
    }
  }

  isLoaded(key: string): boolean {
    return this.loaded.has(key);
  }

  getLoaded(): PluginInstance[] {
    return Array.from(this.loaded.values());
  }
}

// =========================================================
// Plugin Instance Interface
// =========================================================

export interface PluginContext {
  tenantId: string;
  prisma: any; // PrismaClient com RLS
  config: Record<string, unknown>;
  eventEmitter: EventEmitter;
  storage: PluginStorage;
  email: PluginEmail;
  payments: PluginPayments;
}

export interface PluginInstance {
  manifest: PluginManifest;
  onLoad(context: PluginContext): Promise<void>;
  onUnload(): Promise<void>;
  onConfigUpdate(config: Record<string, unknown>): Promise<void>;
  onTenantActivate(): Promise<void>;
  onTenantDeactivate(): Promise<void>;
  // Lifecycle hooks para dados
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onUpgrade?(fromVersion: string): Promise<void>;
}

export interface PluginStorage {
  upload(key: string, data: Buffer, contentType: string): Promise<string>; // retorna URL
  delete(url: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

export interface PluginEmail {
  send(to: string, subject: string, html: string, text?: string): Promise<void>;
  sendTemplate(to: string, templateId: string, data: Record<string, unknown>): Promise<void>;
}

export interface PluginPayments {
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  createPortalSession(customerId: string, returnUrl: string): Promise<string>;
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

export interface CheckoutParams {
  mode: "payment" | "subscription";
  lineItems: Array<{
    priceId: string;
    quantity: number;
    adjustableQuantity?: boolean;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  trialDays?: number;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface WebhookEvent {
  type: string;
  data: any;
  timestamp: Date;
}

// =========================================================
// Built-in Plugins (Core)
// =========================================================

export const CORE_PLUGINS: Record<string, PluginManifest> = {
  pousadas: {
    key: "pousadas",
    name: "Gestão de Pousadas",
    description: "Sistema completo de reservas, disponibilidade e gestão de quartos para pousadas e hotéis",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "hospitality",
    icon: "bed",
    tags: ["hospitalidade", "reservas", "pousada", "hotel", "booking"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "public-site", "webhooks", "payments", "email", "realtime"],
    configSchema: z.object({
      checkInTime: z.string().default("14:00"),
      checkOutTime: z.string().default("11:00"),
      allowOnlineBooking: z.boolean().default(true),
      requireDeposit: z.boolean().default(false),
      depositPercentage: z.number().min(0).max(100).default(30),
      cancellationPolicy: z.enum(["flexible", "moderate", "strict"]).default("moderate"),
      maxAdvanceBookingDays: z.number().default(365),
      minStayNights: z.number().default(1),
      maxStayNights: z.number().default(30),
    }),
    defaultConfig: {
      checkInTime: "14:00",
      checkOutTime: "11:00",
      allowOnlineBooking: true,
      requireDeposit: false,
      depositPercentage: 30,
      cancellationPolicy: "moderate",
      maxAdvanceBookingDays: 365,
      minStayNights: 1,
      maxStayNights: 30,
    },
    routes: [
      { path: "/pousadas", type: "page", component: "pages/PousadasPage" },
      { path: "/pousadas/[slug]", type: "page", component: "pages/PousadaDetailPage" },
      { path: "/pousadas/[slug]/reserva", type: "page", component: "pages/BookingPage" },
      { path: "/api/pousadas/*", type: "api", handler: "api/pousadas" },
      { path: "/admin/pousadas", type: "admin", component: "admin/PousadasAdmin" },
    ],
    adminMenus: [
      { key: "rooms", label: "Quartos", icon: "bed", path: "/admin/pousadas/quartos", order: 1 },
      { key: "bookings", label: "Reservas", icon: "calendar", path: "/admin/pousadas/reservas", order: 2 },
      { key: "availability", label: "Disponibilidade", icon: "calendar-days", path: "/admin/pousadas/disponibilidade", order: 3 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/pousadas/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "booking.created", description: "Nova reserva criada", payloadSchema: z.object({ bookingId: z.string(), tenantId: z.string() }) },
      { event: "booking.confirmed", description: "Reserva confirmada", payloadSchema: z.object({ bookingId: z.string() }) },
      { event: "booking.cancelled", description: "Reserva cancelada", payloadSchema: z.object({ bookingId: z.string(), reason: z.string().optional() }) },
      { event: "booking.checked_in", description: "Check-in realizado", payloadSchema: z.object({ bookingId: z.string() }) },
      { event: "booking.checked_out", description: "Check-out realizado", payloadSchema: z.object({ bookingId: z.string() }) },
      { event: "availability.updated", description: "Disponibilidade alterada", payloadSchema: z.object({ roomId: z.string(), date: z.string() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  livrarias: {
    key: "livrarias",
    name: "Gestão de Livrarias",
    description: "E-commerce completo para livrarias: catálogo, estoque, pedidos, clientes",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "ecommerce",
    icon: "book",
    tags: ["livraria", "ecommerce", "livros", "estoque", "pedidos"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "public-site", "webhooks", "payments", "email", "storage"],
    configSchema: z.object({
      currency: z.string().default("BRL"),
      taxRate: z.number().default(0),
      freeShippingThreshold: z.number().default(19900),
      defaultShippingCost: z.number().default(1500),
      allowBackorder: z.boolean().default(false),
      lowStockThreshold: z.number().default(5),
      autoConfirmOrders: z.boolean().default(false),
    }),
    defaultConfig: {
      currency: "BRL",
      taxRate: 0,
      freeShippingThreshold: 19900,
      defaultShippingCost: 1500,
      allowBackorder: false,
      lowStockThreshold: 5,
      autoConfirmOrders: false,
    },
    routes: [
      { path: "/livrarias", type: "page", component: "pages/LivrariasPage" },
      { path: "/livrarias/[slug]", type: "page", component: "pages/BookDetailPage" },
      { path: "/livrarias/carrinho", type: "page", component: "pages/CartPage" },
      { path: "/livrarias/checkout", type: "page", component: "pages/CheckoutPage" },
      { path: "/api/livrarias/*", type: "api", handler: "api/livrarias" },
      { path: "/admin/livrarias", type: "admin", component: "admin/LivrariasAdmin" },
    ],
    adminMenus: [
      { key: "books", label: "Livros", icon: "book", path: "/admin/livrarias/livros", order: 1 },
      { key: "categories", label: "Categorias", icon: "folder", path: "/admin/livrarias/categorias", order: 2 },
      { key: "orders", label: "Pedidos", icon: "shopping-cart", path: "/admin/livrarias/pedidos", order: 3 },
      { key: "customers", label: "Clientes", icon: "users", path: "/admin/livrarias/clientes", order: 4 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/livrarias/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "order.created", description: "Novo pedido", payloadSchema: z.object({ orderId: z.string() }) },
      { event: "order.paid", description: "Pedido pago", payloadSchema: z.object({ orderId: z.string() }) },
      { event: "order.shipped", description: "Pedido enviado", payloadSchema: z.object({ orderId: z.string(), trackingCode: z.string().optional() }) },
      { event: "book.low_stock", description: "Estoque baixo", payloadSchema: z.object({ bookId: z.string(), currentStock: z.number() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  cardapio: {
    key: "cardapio",
    name: "Cardápio Digital",
    description: "Cardápio digital com pedidos via QR Code, gestão de mesas e cozinha",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "food-service",
    icon: "utensils",
    tags: ["restaurante", "cardapio", "qr-code", "pedidos", "cozinha"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "public-site", "webhooks", "payments", "realtime"],
    configSchema: z.object({
      currency: z.string().default("BRL"),
      serviceFeePercentage: z.number().default(10),
      allowTableOrdering: z.boolean().default(true),
      allowTakeaway: z.boolean().default(true),
      allowDelivery: z.boolean().default(false),
      deliveryFee: z.number().default(500),
      minOrderForDelivery: z.number().default(3000),
      kitchenDisplayEnabled: z.boolean().default(true),
      autoPrintOrders: z.boolean().default(false),
    }),
    defaultConfig: {
      currency: "BRL",
      serviceFeePercentage: 10,
      allowTableOrdering: true,
      allowTakeaway: true,
      allowDelivery: false,
      deliveryFee: 500,
      minOrderForDelivery: 3000,
      kitchenDisplayEnabled: true,
      autoPrintOrders: false,
    },
    routes: [
      { path: "/cardapio", type: "page", component: "pages/CardapioPage" },
      { path: "/cardapio/mesa/[tableId]", type: "page", component: "pages/TableOrderPage" },
      { path: "/api/cardapio/*", type: "api", handler: "api/cardapio" },
      { path: "/admin/cardapio", type: "admin", component: "admin/CardapioAdmin" },
    ],
    adminMenus: [
      { key: "categories", label: "Categorias", icon: "folder", path: "/admin/cardapio/categorias", order: 1 },
      { key: "items", label: "Itens", icon: "utensils", path: "/admin/cardapio/itens", order: 2 },
      { key: "orders", label: "Pedidos", icon: "shopping-cart", path: "/admin/cardapio/pedidos", order: 3 },
      { key: "tables", label: "Mesas", icon: "table", path: "/admin/cardapio/mesas", order: 4 },
      { key: "kitchen", label: "Cozinha", icon: "monitor", path: "/admin/cardapio/cozinha", order: 5 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/cardapio/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "order.created", description: "Novo pedido", payloadSchema: z.object({ orderId: z.string(), tableNumber: z.string().optional() }) },
      { event: "order.ready", description: "Pedido pronto", payloadSchema: z.object({ orderId: z.string() }) },
      { event: "order.paid", description: "Pedido pago", payloadSchema: z.object({ orderId: z.string() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  catalogo: {
    key: "catalogo",
    name: "Catálogo de Produtos",
    description: "Vitrine virtual de produtos com variantes, categorias e SEO",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "catalog",
    icon: "package",
    tags: ["catalogo", "produtos", "vitrine", "ecommerce", "seo"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "public-site", "webhooks", "storage", "email"],
    configSchema: z.object({
      currency: z.string().default("BRL"),
      showPrices: z.boolean().default(true),
      allowInquiry: z.boolean().default(true),
      productsPerPage: z.number().default(12),
      enableVariants: z.boolean().default(true),
      enableReviews: z.boolean().default(false),
    }),
    defaultConfig: {
      currency: "BRL",
      showPrices: true,
      allowInquiry: true,
      productsPerPage: 12,
      enableVariants: true,
      enableReviews: false,
    },
    routes: [
      { path: "/catalogo", type: "page", component: "pages/CatalogoPage" },
      { path: "/catalogo/[category]", type: "page", component: "pages/CategoryPage" },
      { path: "/catalogo/produto/[slug]", type: "page", component: "pages/ProductDetailPage" },
      { path: "/api/catalogo/*", type: "api", handler: "api/catalogo" },
      { path: "/admin/catalogo", type: "admin", component: "admin/CatalogoAdmin" },
    ],
    adminMenus: [
      { key: "products", label: "Produtos", icon: "package", path: "/admin/catalogo/produtos", order: 1 },
      { key: "categories", label: "Categorias", icon: "folder", path: "/admin/catalogo/categorias", order: 2 },
      { key: "inquiries", label: "Orçamentos", icon: "mail", path: "/admin/catalogo/orcamentos", order: 3 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/catalogo/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "inquiry.created", description: "Novo orçamento solicitado", payloadSchema: z.object({ inquiryId: z.string() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  "site-institucional": {
    key: "site-institucional",
    name: "Site Institucional",
    description: "CMS para sites institucionais: páginas, blocos, blog, SEO",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "cms",
    icon: "layout",
    tags: ["site", "institucional", "cms", "paginas", "blog", "seo"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "public-site", "webhooks", "storage", "email"],
    configSchema: z.object({
      enableBlog: z.boolean().default(true),
      postsPerPage: z.number().default(10),
      enableComments: z.boolean().default(false),
      defaultLanguage: z.string().default("pt-BR"),
      supportedLanguages: z.array(z.string()).default(["pt-BR"]),
    }),
    defaultConfig: {
      enableBlog: true,
      postsPerPage: 10,
      enableComments: false,
      defaultLanguage: "pt-BR",
      supportedLanguages: ["pt-BR"],
    },
    routes: [
      { path: "/", type: "page", component: "pages/HomePage" },
      { path: "/[...slug]", type: "page", component: "pages/DynamicPage" },
      { path: "/blog", type: "page", component: "pages/BlogIndexPage" },
      { path: "/blog/[slug]", type: "page", component: "pages/BlogPostPage" },
      { path: "/api/site/*", type: "api", handler: "api/site" },
      { path: "/admin/site", type: "admin", component: "admin/SiteAdmin" },
    ],
    adminMenus: [
      { key: "pages", label: "Páginas", icon: "file-text", path: "/admin/site/paginas", order: 1 },
      { key: "blocks", label: "Blocos", icon: "layout", path: "/admin/site/blocos", order: 2 },
      { key: "blog", label: "Blog", icon: "newspaper", path: "/admin/site/blog", order: 3 },
      { key: "media", label: "Mídia", icon: "image", path: "/admin/site/midia", order: 4 },
      { key: "seo", label: "SEO", icon: "search", path: "/admin/site/seo", order: 5 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/site/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "page.published", description: "Página publicada", payloadSchema: z.object({ pageId: z.string(), slug: z.string() }) },
      { event: "post.published", description: "Post publicado", payloadSchema: z.object({ postId: z.string() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  "gestao-empresarial": {
    key: "gestao-empresarial",
    name: "Gestão Empresarial (ERP Lite)",
    description: "ERP simplificado: vendas, notas fiscais, clientes, financeiro",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "erp",
    icon: "briefcase",
    tags: ["erp", "vendas", "notas-fiscais", "clientes", "financeiro", "nfe"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "webhooks", "email", "scheduler"],
    configSchema: z.object({
      companyCnpj: z.string(),
      companyRegime: z.enum(["SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL", "MEI"]),
      nfeEnabled: z.boolean().default(false),
      nfeCertPath: z.string().optional(),
      nfeCertPassword: z.string().optional(),
      nfeEnvironment: z.enum(["homologacao", "producao"]).default("homologacao"),
      seriesNfe: z.string().default("1"),
      seriesNfce: z.string().default("1"),
      autoBackupEnabled: z.boolean().default(true),
      backupSchedule: z.string().default("0 2 * * *"), // 2h da manhã
    }),
    defaultConfig: {
      companyCnpj: "",
      companyRegime: "SIMPLES_NACIONAL",
      nfeEnabled: false,
      nfeEnvironment: "homologacao",
      seriesNfe: "1",
      seriesNfce: "1",
      autoBackupEnabled: true,
      backupSchedule: "0 2 * * *",
    },
    routes: [
      { path: "/admin/gestao", type: "admin", component: "admin/GestaoAdmin" },
      { path: "/api/gestao/*", type: "api", handler: "api/gestao" },
    ],
    adminMenus: [
      { key: "dashboard", label: "Dashboard", icon: "layout-dashboard", path: "/admin/gestao", order: 1 },
      { key: "sales", label: "Vendas", icon: "shopping-cart", path: "/admin/gestao/vendas", order: 2, children: [
        { key: "orders", label: "Pedidos", icon: "clipboard-list", path: "/admin/gestao/vendas/pedidos", order: 1 },
        { key: "invoices", label: "Notas Fiscais", icon: "file-text", path: "/admin/gestao/vendas/notas", order: 2 },
      ]},
      { key: "customers", label: "Clientes", icon: "users", path: "/admin/gestao/clientes", order: 3 },
      { key: "products", label: "Produtos/Serviços", icon: "package", path: "/admin/gestao/produtos", order: 4 },
      { key: "financial", label: "Financeiro", icon: "dollar-sign", path: "/admin/gestao/financeiro", order: 5, children: [
        { key: "receivables", label: "Contas a Receber", icon: "credit-card", path: "/admin/gestao/financeiro/receber", order: 1 },
        { key: "payables", label: "Contas a Pagar", icon: "file-minus", path: "/admin/gestao/financeiro/pagar", order: 2 },
      ]},
      { key: "reports", label: "Relatórios", icon: "bar-chart", path: "/admin/gestao/relatorios", order: 6 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/gestao/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "sale.created", description: "Nova venda", payloadSchema: z.object({ orderId: z.string() }) },
      { event: "invoice.authorized", description: "NF-e autorizada", payloadSchema: z.object({ invoiceId: z.string(), accessKey: z.string() }) },
      { event: "receivable.received", description: "Recebimento confirmado", payloadSchema: z.object({ receivableId: z.string() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  "gestao-rh": {
    key: "gestao-rh",
    name: "Gestão de RH",
    description: "Folha de pagamento, ponto, férias, benefícios e gestão de colaboradores",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "hr",
    icon: "users",
    tags: ["rh", "folha", "ponto", "ferias", "colaboradores", "esocial"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "webhooks", "email", "scheduler", "storage"],
    configSchema: z.object({
      workWeekHours: z.number().default(44),
      overtimeMultiplier: z.number().default(1.5),
      nightShiftBonus: z.number().default(0.2),
      vacationDaysPerYear: z.number().default(30),
      advanceVacationAllowed: z.boolean().default(true),
      medicalCertificateRequiredDays: z.number().default(3),
      esocialEnabled: z.boolean().default(false),
      esocialEnvironment: z.enum(["producao", "homologacao"]).default("homologacao"),
    }),
    defaultConfig: {
      workWeekHours: 44,
      overtimeMultiplier: 1.5,
      nightShiftBonus: 0.2,
      vacationDaysPerYear: 30,
      advanceVacationAllowed: true,
      medicalCertificateRequiredDays: 3,
      esocialEnabled: false,
      esocialEnvironment: "homologacao",
    },
    routes: [
      { path: "/admin/rh", type: "admin", component: "admin/RHAdmin" },
      { path: "/api/rh/*", type: "api", handler: "api/rh" },
    ],
    adminMenus: [
      { key: "employees", label: "Colaboradores", icon: "users", path: "/admin/rh/colaboradores", order: 1 },
      { key: "payroll", label: "Folha de Pagamento", icon: "calculator", path: "/admin/rh/folha", order: 2 },
      { key: "time", label: "Ponto", icon: "clock", path: "/admin/rh/ponto", order: 3 },
      { key: "leave", label: "Férias e Licenças", icon: "calendar-x", path: "/admin/rh/ferias", order: 4 },
      { key: "benefits", label: "Benefícios", icon: "gift", path: "/admin/rh/beneficios", order: 5 },
      { key: "reports", label: "Relatórios", icon: "bar-chart", path: "/admin/rh/relatorios", order: 6 },
      { key: "esocial", label: "eSocial", icon: "shield", path: "/admin/rh/esocial", order: 7 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/rh/configuracoes", order: 99 },
    ],
    webhooks: [
      { event: "employee.hired", description: "Colaborador contratado", payloadSchema: z.object({ employeeId: z.string() }) },
      { event: "employee.terminated", description: "Colaborador desligado", payloadSchema: z.object({ employeeId: z.string() }) },
      { event: "payroll.processed", description: "Folha processada", payloadSchema: z.object({ period: z.string(), count: z.number() }) },
      { event: "leave.approved", description: "Férias/licença aprovada", payloadSchema: z.object({ leaveId: z.string() }) },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },
};

// =========================================================
// Export singleton registry
// =========================================================

let registryInstance: PluginRegistry | null = null;

export function getPluginRegistry(eventEmitter: EventEmitter): PluginRegistry {
  if (!registryInstance) {
    registryInstance = new PluginRegistry(eventEmitter);
    // Registrar plugins core
    for (const manifest of Object.values(CORE_PLUGINS)) {
      registryInstance.register(manifest);
    }
  }
  return registryInstance;
}

export function resetPluginRegistry(): void {
  registryInstance = null;
}