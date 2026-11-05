"use client";

import { z } from "zod";

/**
 * Tipos para o plugin de Livrarias
 * Sistema de gestão de livraria com catálogo, carrinho, pedidos e estoque
 */

// =========================================================
// Enums e Constantes
// =========================================================

export const BookCategorySchema = z.enum([
  "fiction",
  "non-fiction",
  "children",
  "young-adult",
  "mystery",
  "romance",
  "sci-fi",
  "fantasy",
  "biography",
  "history",
  "self-help",
  "business",
  "technical",
  "art",
  "cooking",
  "travel",
  "other",
]);
export type BookCategory = z.infer<typeof BookCategorySchema>;

export const BookFormatSchema = z.enum(["hardcover", "paperback", "ebook", "audiobook"]);
export type BookFormat = z.infer<typeof BookFormatSchema>;

export const OrderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentStatusSchema = z.enum(["PENDING", "PAID", "REFUNDED", "FAILED"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const StockMovementTypeSchema = z.enum(["IN", "OUT", "ADJUSTMENT", "RETURN", "DAMAGED", "LOST"]);
export type StockMovementType = z.infer<typeof StockMovementTypeSchema>;

// =========================================================
// Entidades Principais
// =========================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings: LivrariaSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  tenantId: string;
  isbn: string;
  title: string;
  subtitle?: string;
  author: string;
  authorId?: string;
  publisher?: string;
  publishedDate?: Date;
  category: BookCategory;
  format: BookFormat;
  language: string;
  pages?: number;
  dimensions?: string;
  weight?: number;
  description: string;
  shortDescription?: string;
  coverImage?: string;
  galleryImages: string[];
  price: number; // em centavos
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewRelease: boolean;
  isBestseller: boolean;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Author {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  bio?: string;
  photo?: string;
  birthDate?: Date;
  deathDate?: Date;
  nationality?: string;
  website?: string;
  socialLinks: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  cpf?: string;
  addresses: Address[];
  preferences: CustomerPreferences;
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
  isActive: boolean;
  marketingOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Address {
  id: string;
  type: "billing" | "shipping";
  isDefault: boolean;
  recipientName: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface CustomerPreferences {
  favoriteCategories: BookCategory[];
  favoriteAuthors: string[];
  preferredFormat: BookFormat;
  language: string;
  newsletterFrequency: "daily" | "weekly" | "monthly" | "never";
}

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod?: string;
  paymentId?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  cancelReason?: string;
  cancelledAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  book?: Book;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  format: BookFormat;
}

export interface Cart {
  id: string;
  tenantId: string;
  customerId?: string;
  sessionId?: string;
  items: CartItem[];
  couponCode?: string;
  discount: number;
  subtotal: number;
  total: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  bookId: string;
  book?: Book;
  quantity: number;
  format: BookFormat;
  unitPrice: number;
  total: number;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  bookId: string;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string; // orderId, purchaseOrderId, etc.
  referenceType?: "ORDER" | "PURCHASE" | "ADJUSTMENT" | "RETURN";
  reason?: string;
  userId?: string;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  applicableCategories: BookCategory[];
  applicableBooks: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  tenantId: string;
  bookId: string;
  customerId: string;
  customer?: Customer;
  orderId?: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  tenantId: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// =========================================================
// Configurações
// =========================================================

export interface LivrariaSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone?: string;
  address?: Address;
  currency: string;
  timezone: string;
  language: string;

  // Checkout
  allowGuestCheckout: boolean;
  requirePhone: boolean;
  requireCpf: boolean;
  minOrderAmount: number;
  freeShippingThreshold: number;

  // Pagamento
  acceptedPaymentMethods: ("credit_card" | "debit_card" | "pix" | "boleto" | "wallet")[];

  // Estoque
  trackInventory: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
  reserveStockOnCart: boolean;
  cartReservationMinutes: number;

  // Frete
  shippingMethods: ShippingMethod[];

  // Impostos
  taxIncluded: boolean;
  taxRate: number;

  // Fidelidade
  loyaltyEnabled: boolean;
  pointsPerReal: number;
  pointsRedemptionRate: number; // pontos por real

  // Avaliações
  reviewsEnabled: boolean;
  reviewsRequireApproval: boolean;
  reviewsOnlyVerifiedPurchases: boolean;

  // SEO
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultSeoImage?: string;

  // Integrações
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  type: "flat_rate" | "free" | "calculated" | "pickup";
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  applicableStates?: string[];
  isActive: boolean;
  sortOrder: number;
}

// =========================================================
// Schemas Zod para Validação
// =========================================================

export const BookSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  isbn: z.string().min(10).max(13),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  author: z.string().min(1).max(100),
  authorId: z.string().optional(),
  publisher: z.string().max(100).optional(),
  publishedDate: z.date().optional(),
  category: BookCategorySchema,
  format: BookFormatSchema,
  language: z.string().default("pt-BR"),
  pages: z.number().int().positive().optional(),
  dimensions: z.string().max(50).optional(),
  weight: z.number().positive().optional(),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  coverImage: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).default([]),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional(),
  costPrice: z.number().int().min(0).optional(),
  sku: z.string().min(1).max(50),
  barcode: z.string().max(50).optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewRelease: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  stockQuantity: z.number().int().min(0).default(0),
  reservedQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CustomerSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.date().optional(),
  cpf: z.string().max(14).optional(),
  addresses: z.array(z.object({
    id: z.string(),
    type: z.enum(["billing", "shipping"]),
    isDefault: z.boolean(),
    recipientName: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().length(8),
    country: z.string().default("Brasil"),
    phone: z.string().optional(),
  })).default([]),
  preferences: z.object({
    favoriteCategories: z.array(BookCategorySchema).default([]),
    favoriteAuthors: z.array(z.string()).default([]),
    preferredFormat: BookFormatSchema.default("paperback"),
    language: z.string().default("pt-BR"),
    newsletterFrequency: z.enum(["daily", "weekly", "monthly", "never"]).default("weekly"),
  }).default({}),
  loyaltyPoints: z.number().int().min(0).default(0),
  totalSpent: z.number().int().min(0).default(0),
  orderCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  marketingOptIn: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  customerId: z.string(),
  items: z.array(z.object({
    id: z.string().optional(),
    bookId: z.string(),
    quantity: z.number().int().positive(),
    format: BookFormatSchema,
    unitPrice: z.number().int().min(0),
    discount: z.number().int().min(0).default(0),
  })).min(1),
  status: OrderStatusSchema.default("PENDING"),
  paymentStatus: PaymentStatusSchema.default("PENDING"),
  subtotal: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
  shippingCost: z.number().int().min(0).default(0),
  taxAmount: z.number().int().min(0).default(0),
  total: z.number().int().min(0),
  currency: z.string().default("BRL"),
  shippingAddress: z.object({
    id: z.string(),
    type: z.literal("shipping"),
    isDefault: z.boolean(),
    recipientName: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().length(8),
    country: z.string().default("Brasil"),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    id: z.string(),
    type: z.literal("billing"),
    isDefault: z.boolean(),
    recipientName: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().length(8),
    country: z.string().default("Brasil"),
    phone: z.string().optional(),
  }),
  paymentMethod: z.string().optional(),
  paymentId: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
  cancelledAt: z.date().optional(),
  shippedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type BookFormData = z.infer<typeof BookSchema>;
export type CustomerFormData = z.infer<typeof CustomerSchema>;
export type OrderFormData = z.infer<typeof OrderSchema>;

// =========================================================
// Tipos para API e Componentes
// =========================================================

export interface BookFilters {
  category?: BookCategory;
  format?: BookFormat;
  authorId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  newRelease?: boolean;
  bestseller?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "bestselling" | "rating";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CheckoutData {
  customer: CustomerFormData;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  paymentMethod: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}