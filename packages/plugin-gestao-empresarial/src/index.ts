"use client";

/**
 * @nexis/plugin-gestao-empresarial
 * Plugin de Gestão Empresarial (ERP) - Vendas, Estoque, Clientes, Financeiro, Dashboard
 */

export * from "./types";
export * from "./utils/helpers";
export * from "./hooks/use-local-storage";
export * from "./hooks/use-financeiro";

// Tipos de plugin
export interface GestaoEmpresarialPluginConfig {
  tenantId: string;
  settings: import("./types").BusinessSettings;
}

export interface GestaoEmpresarialPluginInstance {
  instanceId: string;
  tenantId: string;
  config: GestaoEmpresarialPluginConfig;

  // Clientes
  getCustomers: (filters?: { search?: string }) => Promise<import("./types").BusinessCustomer[]>;
  getCustomer: (id: string) => Promise<import("./types").BusinessCustomer | null>;
  createCustomer: (data: Partial<import("./types").BusinessCustomer>) => Promise<import("./types").BusinessCustomer>;
  updateCustomer: (id: string, data: Partial<import("./types").BusinessCustomer>) => Promise<import("./types").BusinessCustomer>;
  deleteCustomer: (id: string) => Promise<void>;

  // Produtos / Estoque
  getProducts: (filters?: { search?: string; lowStockOnly?: boolean }) => Promise<import("./types").InventoryProduct[]>;
  getProduct: (id: string) => Promise<import("./types").InventoryProduct | null>;
  createProduct: (data: Partial<import("./types").InventoryProduct>) => Promise<import("./types").InventoryProduct>;
  updateProduct: (id: string, data: Partial<import("./types").InventoryProduct>) => Promise<import("./types").InventoryProduct>;
  deleteProduct: (id: string) => Promise<void>;
  registerStockMovement: (data: Omit<import("./types").StockMovement, "id" | "createdAt">) => Promise<void>;
  getStockMovements: (productId?: string) => Promise<import("./types").StockMovement[]>;

  // Vendas
  getSales: (filters?: import("./types").SalesFilters) => Promise<import("./types").Sale[]>;
  getSale: (id: string) => Promise<import("./types").Sale | null>;
  createSale: (data: Omit<import("./types").Sale, "id" | "saleNumber" | "createdAt" | "updatedAt">) => Promise<import("./types").Sale>;
  cancelSale: (id: string) => Promise<void>;

  // Financeiro
  getEntries: (filters?: import("./types").FinancialFilters) => Promise<import("./types").FinancialEntry[]>;
  createEntry: (data: Omit<import("./types").FinancialEntry, "id" | "createdAt" | "updatedAt">) => Promise<import("./types").FinancialEntry>;
  markEntryAsPaid: (id: string, method?: import("./types").PaymentMethod) => Promise<void>;
  cancelEntry: (id: string) => Promise<void>;
  getCashFlow: (days?: number) => Promise<import("./types").CashFlowPoint[]>;
  getDashboardMetrics: () => Promise<import("./types").DashboardMetrics>;

  // Configurações
  updateSettings: (data: Partial<import("./types").BusinessSettings>) => Promise<import("./types").BusinessSettings>;
}

// Páginas
export { default as GestaoEmpresarialPage } from "./pages/GestaoEmpresarialPage";

// Admin
export { default as GestaoEmpresarialAdmin } from "./admin/GestaoEmpresarialAdmin";

// Tipos para integração com plataforma
export type {
  BusinessCustomer,
  InventoryProduct,
  Sale,
  SaleItem,
  FinancialEntry,
  StockMovement,
  BusinessSettings,
  PaymentMethod,
  SaleStatus,
  FinancialEntryType,
  FinancialEntryStatus,
  StockMovementType,
  DashboardMetrics,
  CashFlowPoint,
  TopProduct,
  SalesFilters,
  FinancialFilters,
} from "./types";
