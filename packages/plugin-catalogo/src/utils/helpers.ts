import type { Product, QuoteCartItem, QuoteSummary, CatalogSettings } from "../types";

/**
 * @nexis/plugin-catalogo — Utilitários
 */

// =========================================================
// Formatação
// =========================================================

export function formatCurrency(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function generateSku(category: string, name: string): string {
  const cat = category.slice(0, 3).toUpperCase();
  const namePart = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${cat}-${namePart}-${rand}`;
}

export function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `QT${year}-${rand}`;
}

// =========================================================
// Status
// =========================================================

export function getProductStatusLabel(status: Product["status"]): string {
  const labels: Record<Product["status"], string> = {
    draft: "Rascunho",
    active: "Ativo",
    discontinued: "Descontinuado",
    out_of_stock: "Sem estoque",
  };
  return labels[status];
}

export function getProductStatusBadgeClass(status: Product["status"]): string {
  const classes: Record<Product["status"], string> = {
    draft: "badge-outline",
    active: "badge-success",
    discontinued: "badge-danger",
    out_of_stock: "badge-warning",
  };
  return classes[status];
}

export function getQuoteStatusLabel(status: QuoteRequest["status"]): string {
  const labels: Record<QuoteRequest["status"], string> = {
    new: "Novo",
    sent: "Enviado",
    quoted: "Orçado",
    won: "Ganho",
    lost: "Perdido",
    expired: "Expirado",
  };
  return labels[status];
}

export function getQuoteStatusBadgeClass(status: QuoteRequest["status"]): string {
  const classes: Record<QuoteRequest["status"], string> = {
    new: "badge-info",
    sent: "badge-outline",
    quoted: "badge-warning",
    won: "badge-success",
    lost: "badge-danger",
    expired: "badge-outline",
  };
  return classes[status];
}

// =========================================================
// Regras de negócio
// =========================================================

export function isProductVisible(product: Product): boolean {
  return product.status === "active";
}

export function getEffectivePrice(product: Product, quantity: number): number {
  if (quantity >= (product.minOrderQty || 1) * 10 && product.wholesalePrice != null) {
    return product.wholesalePrice;
  }
  return product.price;
}

export function isQuoteModeRequired(settings: CatalogSettings): boolean {
  return settings.quoteMode === "required";
}

export function shouldShowPrices(settings: CatalogSettings): boolean {
  return settings.showPrices && settings.quoteMode !== "required";
}

/**
 * Valida se a quantidade respeita o mínimo do produto
 */
export function isValidQuantity(product: Product, quantity: number): boolean {
  return quantity >= (product.minOrderQty || 1);
}

/**
 * Calcula resumo do carrinho de orçamento
 */
export function calculateQuoteSummary(
  cartItems: QuoteCartItem[],
  products: Product[],
  discountPercent = 0
): QuoteSummary {
  const subtotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return sum;
    const unitPrice = getEffectivePrice(product, item.quantity);
    return sum + unitPrice * item.quantity;
  }, 0);

  const discountValue = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountValue;

  return {
    subtotal,
    discountPercent,
    discountValue,
    total,
    itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
  };
}

/**
 * Descontos progressivos por volume (tabela padrão)
 */
export const VOLUME_TIERS = [
  { minQty: 1, discount: 0 },
  { minQty: 10, discount: 5 },
  { minQty: 50, discount: 10 },
  { minQty: 100, discount: 15 },
  { minQty: 500, discount: 20 },
] as const;

export function getVolumeDiscount(totalQuantity: number): number {
  let discount = 0;
  for (const tier of VOLUME_TIERS) {
    if (totalQuantity >= tier.minQty) discount = tier.discount;
  }
  return discount;
}

/**
 * Status do estoque para exibição
 */
export function getStockDisplay(product: Product): { label: string; className: string } {
  if (product.status === "out_of_stock" || product.stock === 0) {
    return { label: "Sem estoque", className: "text-[var(--text-danger)]" };
  }
  if (product.stock <= 10) {
    return { label: `Últimas ${product.stock} un.`, className: "text-[var(--text-warning)]" };
  }
  return { label: `${formatNumber(product.stock)} un. em estoque`, className: "text-[var(--text-success)]" };
}
