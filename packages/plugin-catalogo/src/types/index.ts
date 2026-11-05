import { z } from "zod";

/**
 * @nexis/plugin-catalogo — Tipos
 * Catálogo de produtos digitais/wholesale com PDF, enquete de preço, etc.
 */

// =========================================================
// Schemas Zod
// =========================================================

export const ProductSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  sku: z.string().min(1, "SKU obrigatório"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string(),
  shortDescription: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().int().min(0), // em centavos
  wholesalePrice: z.number().int().min(0).optional(),
  minOrderQty: z.number().int().min(1).default(1),
  unit: z.string().default("un"),
  stock: z.number().int().min(0).default(0),
  stockPerBranch: z.array(z.object({
    branchId: z.string(),
    branchName: z.string(),
    quantity: z.number().int().min(0),
  })).optional(),
  images: z.array(z.string()).default([]),
  pdfUrl: z.string().url().optional(),
  specifications: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "active", "discontinued", "out_of_stock"]),
  isFeatured: z.boolean().default(false),
  viewCount: z.number().int().default(0),
  quoteCount: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CatalogCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  productCount: z.number().int().default(0),
});

export const QuoteRequestSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  quoteNumber: z.string(),
  customerName: z.string().min(2, "Nome obrigatório"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().optional(),
  customerCompany: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().int().min(0),
    total: z.number().int().min(0),
  })).min(1, "Adicione pelo menos 1 item"),
  notes: z.string().optional(),
  status: z.enum(["new", "sent", "quoted", "won", "lost", "expired"]),
  quotedTotal: z.number().int().min(0).optional(),
  validUntil: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CatalogSettingsSchema = z.object({
  companyName: z.string().min(2),
  logo: z.string().optional(),
  description: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().default("BRL"),
  showPrices: z.boolean().default(true),
  quoteMode: z.enum(["disabled", "optional", "required"]).default("optional"),
  quoteResponseHours: z.number().int().default(24),
  minQuoteValue: z.number().int().min(0).default(0),
  branches: z.array(z.object({
    id: z.string(),
    name: z.string(),
    address: z.string().optional(),
    phone: z.string().optional(),
  })).default([]),
  socialLinks: z.record(z.string(), z.string()).default({}),
  primaryColor: z.string().default("#06b6d4"),
});

export const DownloadLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  productId: z.string().nullable(),
  catalogPdf: z.boolean().default(false),
  visitorEmail: z.string().email().optional(),
  downloadedAt: z.date(),
});

// =========================================================
// Tipos inferidos
// =========================================================

export type Product = z.infer<typeof ProductSchema>;
export type CatalogCategory = z.infer<typeof CatalogCategorySchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type CatalogSettings = z.infer<typeof CatalogSettingsSchema>;
export type DownloadLog = z.infer<typeof DownloadLogSchema>;

export type ProductStatus = Product["status"];
export type QuoteStatus = QuoteRequest["status"];

// =========================================================
// Tipos auxiliares
// =========================================================

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  status?: ProductStatus;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price-asc" | "price-desc" | "newest" | "most-viewed";
}

export interface QuoteCartItem {
  productId: string;
  product?: Product;
  quantity: number;
  notes?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface QuoteSummary {
  subtotal: number;
  discountPercent: number;
  discountValue: number;
  total: number;
  itemCount: number;
}

export interface BranchStock {
  branchId: string;
  branchName: string;
  quantity: number;
}
