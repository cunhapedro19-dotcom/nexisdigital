"use client";

/**
 * @nexis/plugin-livrarias
 * Plugin de Livraria - Catálogo, Carrinho, Checkout, Admin
 */

export * from "./types";
export * from "./utils/formatters";
export * from "./utils/pricing";
export * from "./hooks/use-local-storage";
export * from "./hooks/use-cart";

// Tipos de plugin
export interface PluginConfig {
  tenantId: string;
  settings: import("./types").LivrariaSettings;
  books: import("./types").Book[];
  authors: import("./types").Author[];
  categories: import("./types").Category[];
}

export interface PluginInstance {
  config: PluginConfig;
  // API
  getBook: (id: string) => Promise<import("./types").Book | null>;
  getBooks: (filters?: import("./types").BookFilters) => Promise<import("./types").PaginatedResponse<import("./types").Book>>;
  getAuthor: (id: string) => Promise<import("./types").Author | null>;
  getAuthors: () => Promise<import("./types").Author[]>;
  getCategory: (id: string) => Promise<import("./types").Category | null>;
  getCategories: () => Promise<import("./types").Category[]>;
  searchBooks: (query: string, filters?: import("./types").BookFilters) => Promise<import("./types").Book[]>;

  // Carrinho
  addToCart: (bookId: string, quantity: number, format?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  getCart: () => Promise<import("./types").Cart>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;

  // Checkout
  createOrder: (data: import("./types").CheckoutData) => Promise<import("./types").Order>;
  getOrder: (id: string) => Promise<import("./types").Order | null>;
  getCustomerOrders: (customerId: string) => Promise<import("./types").Order[]>;

  // Clientes
  getCustomer: (id: string) => Promise<import("./types").Customer | null>;
  createCustomer: (data: import("./types").CustomerFormData) => Promise<import("./types").Customer>;
  updateCustomer: (id: string, data: Partial<import("./types").CustomerFormData>) => Promise<import("./types").Customer>;

  // Admin
  createBook: (data: import("./types").BookFormData) => Promise<import("./types").Book>;
  updateBook: (id: string, data: Partial<import("./types").BookFormData>) => Promise<import("./types").Book>;
  deleteBook: (id: string) => Promise<void>;
  updateStock: (bookId: string, quantity: number, type: import("./types").StockMovementType, reason?: string) => Promise<void>;
  getOrders: (filters?: { status?: string; page?: number; limit?: number }) => Promise<import("./types").PaginatedResponse<import("./types").Order>>;
  updateOrderStatus: (id: string, status: import("./types").OrderStatus) => Promise<import("./types").Order>;
  getCoupons: () => Promise<import("./types").Coupon[]>;
  createCoupon: (data: Omit<import("./types").Coupon, "id" | "usageCount" | "createdAt" | "updatedAt">) => Promise<import("./types").Coupon>;
  updateCoupon: (id: string, data: Partial<import("./types").Coupon>) => Promise<import("./types").Coupon>;
  deleteCoupon: (id: string) => Promise<void>;
  getSettings: () => Promise<import("./types").LivrariaSettings>;
  updateSettings: (settings: Partial<import("./types").LivrariaSettings>) => Promise<import("./types").LivrariaSettings>;
}

// Páginas
export { default as LivrariaPage } from "./pages/LivrariaPage";
export { default as BookDetailPage } from "./pages/BookDetailPage";
export { default as CartPage } from "./pages/CartPage";
export { default as CheckoutPage } from "./pages/CheckoutPage";
export { default as OrderSuccessPage } from "./pages/OrderSuccessPage";
export { default as AccountPage } from "./pages/AccountPage";

// Admin
export { default as LivrariaAdmin } from "./admin/LivrariaAdmin";

// Componentes
export { BookCard } from "./components/BookCard";
export { BookGrid } from "./components/BookGrid";
export { BookFilters } from "./components/BookFilters";
export { CartDrawer } from "./components/CartDrawer";
export { CartSummary } from "./components/CartSummary";
export { CheckoutForm } from "./components/CheckoutForm";
export { OrderSummary } from "./components/OrderSummary";
export { CustomerAddressForm } from "./components/CustomerAddressForm";
export { PaymentMethodSelector } from "./components/PaymentMethodSelector";
export { ShippingMethodSelector } from "./components/ShippingMethodSelector";
export { CouponInput } from "./components/CouponInput";
export { LoyaltyPointsRedeem } from "./components/LoyaltyPointsRedeem";
export { ReviewList } from "./components/ReviewList";
export { ReviewForm } from "./components/ReviewForm";

// Tipos para integração com plataforma
export type { Book, Author, Customer, Order, Cart, CartItem, Coupon, Review, Category, LivrariaSettings, ShippingMethod, Address, BookFilters, PaginatedResponse, ApiResponse, CheckoutData, PaymentIntentData } from "./types";