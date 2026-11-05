"use client";

/**
 * @nexis/plugin-catalogo
 * Plugin de Catálogo B2B - Produtos, Orçamentos, Categorias, Admin
 */

export * from "./types";
export * from "./utils/helpers";
export * from "./hooks/use-local-storage";
export * from "./hooks/use-quote-cart";

// Tipos de plugin
export interface CatalogoPluginConfig {
  tenantId: string;
  settings: import("./types").CatalogSettings;
  products: import("./types").Product[];
  categories: import("./types").CatalogCategory[];
}

export interface CatalogoPluginInstance {
  instanceId: string;
  tenantId: string;
  config: CatalogoPluginConfig;

  // Catálogo
  getProducts: (filters?: import("./types").ProductFilters) => Promise<import("./types").Paginated<import("./types").Product>>;
  getProduct: (id: string) => Promise<import("./types").Product | null>;
  searchProducts: (query: string) => Promise<import("./types").Product[]>;
  getCategories: () => Promise<import("./types").CatalogCategory[]>;

  // Orçamentos
  addToQuoteCart: (productId: string, quantity: number) => Promise<void>;
  getQuoteCart: () => Promise<import("./types").QuoteCartItem[]>;
  clearQuoteCart: () => Promise<void>;
  submitQuote: (customer: { name: string; email: string; phone?: string; company?: string }, notes?: string) => Promise<{ quoteNumber: string } | null>;
  getQuotes: (filters?: { status?: string }) => Promise<import("./types").QuoteRequest[]>;
  updateQuoteStatus: (id: string, status: import("./types").QuoteStatus) => Promise<import("./types").QuoteRequest>;

  // Admin
  createProduct: (data: Partial<import("./types").Product>) => Promise<import("./types").Product>;
  updateProduct: (id: string, data: Partial<import("./types").Product>) => Promise<import("./types").Product>;
  deleteProduct: (id: string) => Promise<void>;
  updateSettings: (data: Partial<import("./types").CatalogSettings>) => Promise<import("./types").CatalogSettings>;
}

// Páginas
export { default as CatalogoPage } from "./pages/CatalogoPage";

// Admin
export { default as CatalogoAdmin } from "./admin/CatalogoAdmin";

// Componentes
export { ProductCard } from "./components/ProductCard";
export { QuoteDrawer } from "./components/QuoteDrawer";
export { ProductDetailsModal } from "./components/ProductDetailsModal";

// Tipos para integração com plataforma
export type {
  Product,
  CatalogCategory,
  QuoteRequest,
  CatalogSettings,
  ProductStatus,
  QuoteStatus,
  ProductFilters,
  QuoteCartItem,
  Paginated,
  QuoteSummary,
  BranchStock,
} from "./types";
