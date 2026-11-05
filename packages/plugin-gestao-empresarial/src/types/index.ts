import { z } from "zod";

/**
 * @nexis/plugin-gestao-empresarial — Tipos
 * ERP: clientes, produtos, vendas, contas a pagar/receber, fluxo de caixa, relatórios
 */

// =========================================================
// Schemas Zod
// =========================================================

export const BusinessCustomerSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.enum(["individual", "company"]),
  name: z.string().min(2),
  tradeName: z.string().optional(), // nome fantasia
  document: z.string().min(11), // CPF/CNPJ (somente números)
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  creditLimit: z.number().int().min(0).default(0), // centavos
  paymentTermDays: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const InventoryProductSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  sku: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string(),
  costPrice: z.number().int().min(0),
  salePrice: z.number().int().min(0),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0).default(5),
  unit: z.string().default("un"),
  ncm: z.string().optional(), // Nomenclatura Comum do Mercosul
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SaleSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  saleNumber: z.string(),
  customerId: z.string(),
  sellerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().int().min(0),
    discount: z.number().int().min(0).default(0),
    total: z.number().int().min(0),
  })).min(1),
  subtotal: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
  total: z.number().int().min(0),
  cost: z.number().int().min(0).default(0),
  paymentMethod: z.enum(["pix", "cash", "credit_card", "debit_card", "boleto", "transfer"]),
  installments: z.number().int().min(1).default(1),
  status: z.enum(["draft", "completed", "canceled", "returned"]),
  notes: z.string().optional(),
  soldAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const FinancialEntrySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.enum(["receivable", "payable"]),
  description: z.string().min(2),
  category: z.string(),
  amount: z.number().int().min(1),
  dueDate: z.date(),
  paidAt: z.date().nullable().optional(),
  paymentMethod: z.enum(["pix", "cash", "credit_card", "debit_card", "boleto", "transfer"]).optional(),
  status: z.enum(["pending", "paid", "overdue", "canceled"]),
  saleId: z.string().optional(),
  supplierName: z.string().optional(),
  costCenter: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const StockMovementSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  productId: z.string(),
  productName: z.string(),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().int(),
  reason: z.string(),
  saleId: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.date(),
});

export const BusinessSettingsSchema = z.object({
  companyName: z.string().min(2),
  tradeName: z.string().optional(),
  cnpj: z.string(),
  stateRegistration: z.string().optional(),
  taxRegime: z.enum(["simples", "presumido", "real"]).default("simples"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string(),
  email: z.string().email(),
  defaultPaymentTerms: z.number().int().min(0).default(30),
  lowStockAlert: z.boolean().default(true),
  monthlyGoal: z.number().int().min(0).default(0), // centavos
  currency: z.string().default("BRL"),
});

// =========================================================
// Tipos inferidos
// =========================================================

export type BusinessCustomer = z.infer<typeof BusinessCustomerSchema>;
export type InventoryProduct = z.infer<typeof InventoryProductSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type SaleItem = Sale["items"][0];
export type FinancialEntry = z.infer<typeof FinancialEntrySchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type BusinessSettings = z.infer<typeof BusinessSettingsSchema>;

export type PaymentMethod = Sale["paymentMethod"];
export type SaleStatus = Sale["status"];
export type FinancialEntryType = FinancialEntry["type"];
export type FinancialEntryStatus = FinancialEntry["status"];
export type StockMovementType = StockMovement["type"];

// =========================================================
// Tipos auxiliares
// =========================================================

export interface DashboardMetrics {
  revenueMonth: number;
  revenuePrevMonth: number;
  revenueGrowth: number; // percentual
  salesCount: number;
  averageTicket: number;
  receivablePending: number;
  payablePending: number;
  cashBalance: number; // recebido - pago
  lowStockCount: number;
  goalProgress: number; // percentual da meta
}

export interface CashFlowPoint {
  date: string; // ISO date
  inflow: number;
  outflow: number;
  balance: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalPurchases: number;
  ordersCount: number;
}

export interface SalesFilters {
  customerId?: string;
  status?: SaleStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface FinancialFilters {
  type?: FinancialEntryType;
  status?: FinancialEntryStatus;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}
