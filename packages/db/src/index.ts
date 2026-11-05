/**
 * @nexis/db — Database Layer
 * Prisma Client + RLS helpers + Zod schemas para validação
 */

export { prisma, withTenant, withTenantTransaction } from "./client.js";
export type {
  Tenant,
  Plan,
  User,
  Membership,
  Subscription,
  AuditLog,
  PluginData,
  // Pousadas
  PousadaRoom,
  Availability,
  Booking,
  // Livrarias
  BookstoreBook,
  BookstoreCategory,
  BookstoreOrder,
  OrderItem,
  // Cardápio
  MenuCategory,
  MenuItem,
  MenuOrder,
  OrderItemMenu,
  // Catálogo
  CatalogProduct,
  // Site Institucional
  SitePage,
  SiteBlock,
  // Gestão Empresarial
  Company,
  Customer,
  SalesOrder,
  SalesOrderItem,
  Invoice,
  // Gestão RH
  Employee,
  Payroll,
  TimeEntry,
  LeaveRequest,
} from "@prisma/client";

// Re-export enums
export type {
  TenantStatus,
  PlanInterval,
  UserRole,
  SubscriptionProvider,
  SubscriptionStatus,
  BookingStatus,
  PaymentStatus,
  BookingSource,
  OrderStatus,
  OrderType,
  TaxRegime,
  DocumentType,
  SalesOrderStatus,
  InvoiceStatus,
  WorkSchedule,
  EmployeeStatus,
  PayrollStatus,
  TimeEntryType,
  TimeEntryStatus,
  LeaveType,
  LeaveStatus,
} from "@prisma/client";

// Zod schemas para validação de entrada (gerados via zod-prisma ou manual)
import { z } from "zod";

export const createTenantSchema = z.object({
  slug: z.string().min(2).max(63).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  domain: z.string().optional(),
  planId: z.string().cuid(),
});

export const updateTenantSchema = createTenantSchema.partial();

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"]).default("STAFF"),
});

export const createMembershipSchema = z.object({
  userId: z.string().cuid(),
  tenantId: z.string().cuid(),
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"]).default("STAFF"),
});

export const createPlanSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  interval: z.enum(["MONTHLY", "YEARLY", "ONCE"]).default("MONTHLY"),
  features: z.record(z.unknown()).default({}),
  limits: z.record(z.unknown()).default({}),
});

export const createBookingSchema = z.object({
  roomId: z.string().cuid(),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  guestDocument: z.string().optional(),
  checkIn: z.string().datetime(), // ISO date
  checkOut: z.string().datetime(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  specialRequests: z.string().optional(),
});

export const createBookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(2).max(200),
  author: z.string().min(2).max(120),
  publisher: z.string().optional(),
  category: z.string().min(1).max(80),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  costCents: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(5),
  images: z.array(z.string().url()).default([]),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerCpf: z.string().optional(),
  items: z.array(z.object({
    bookId: z.string().cuid(),
    quantity: z.number().int().min(1),
  })).min(1),
  shippingAddress: z.record(z.unknown()).optional(),
});

export const createMenuCategorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(2).max(120),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  image: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  allergens: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  prepTimeMin: z.number().int().optional(),
});

export const createMenuOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(20),
  customerEmail: z.string().email().optional(),
  tableNumber: z.string().optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).default("DINE_IN"),
  items: z.array(z.object({
    itemId: z.string().cuid(),
    quantity: z.number().int().min(1),
    notes: z.string().optional(),
  })).min(1),
  notes: z.string().optional(),
});

export const createCatalogProductSchema = z.object({
  sku: z.string().min(2).max(60),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string().min(1).max(80),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).optional(),
  costCents: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  trackStock: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
  variants: z.array(z.object({
    name: z.string(),
    values: z.array(z.string()),
  })).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const createSitePageSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^\/[a-z0-9-/]*$/),
  title: z.string().min(2).max(120),
  content: z.array(z.record(z.unknown())),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoImage: z.string().url().optional(),
  isPublished: z.boolean().default(false),
  isHome: z.boolean().default(false),
});

export const createCompanySchema = z.object({
  name: z.string().min(2).max(120),
  tradeName: z.string().optional(),
  cnpj: z.string().regex(/^\d{14}$/).optional(),
  ie: z.string().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{8}$/),
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  regime: z.enum(["SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL", "MEI"]).default("SIMPLES_NACIONAL"),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(120),
  tradeName: z.string().optional(),
  document: z.string().regex(/^\d{11}$|^\d{14}$/),
  documentType: z.enum(["CPF", "CNPJ"]).default("CPF"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.record(z.unknown()).optional(),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().cuid(),
  number: z.string().min(1).max(40),
  issueDate: z.string().date(), // YYYY-MM-DD
  dueDate: z.string().date().optional(),
  items: z.array(z.object({
    productId: z.string().cuid().optional(),
    productName: z.string().min(1).max(200),
    description: z.string().optional(),
    quantity: z.number().int().min(1),
    unit: z.string().default("UN"),
    unitPriceCents: z.number().int().min(0),
    discountCents: z.number().int().min(0).default(0),
    taxRate: z.number().int().min(0).max(10000).default(0),
  })).min(1),
  notes: z.string().optional(),
});

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(2).max(40),
  name: z.string().min(2).max(120),
  cpf: z.string().regex(/^\d{11}$/),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthDate: z.string().date(), // YYYY-MM-DD
  hireDate: z.string().date(),
  department: z.string().min(1).max(80),
  position: z.string().min(1).max(80),
  managerId: z.string().cuid().optional(),
  salaryCents: z.number().int().min(0),
  workSchedule: z.enum(["CLT_44H", "CLT_40H", "CLT_36H", "PART_TIME_20H", "PART_TIME_30H", "FLEXIBLE", "REMOTE"]).default("CLT_44H"),
  bankInfo: z.record(z.unknown()).optional(),
  address: z.record(z.unknown()).optional(),
  documents: z.record(z.unknown()).default({}),
});

export const createPayrollSchema = z.object({
  employeeId: z.string().cuid(),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  baseSalaryCents: z.number().int().min(0),
  hoursWorked: z.number().int().min(0),
  overtimeHours: z.number().int().min(0).default(0),
  overtimeCents: z.number().int().min(0).default(0),
  deductionsCents: z.number().int().min(0).default(0),
  benefitsCents: z.number().int().min(0).default(0),
});

export const createTimeEntrySchema = z.object({
  employeeId: z.string().cuid(),
  date: z.string().date(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  breakMinutes: z.number().int().min(0).default(0),
  type: z.enum(["WORK", "OVERTIME", "LEAVE", "VACATION", "HOLIDAY", "MEDICAL", "REMOTE"]).default("WORK"),
  notes: z.string().optional(),
});

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().cuid(),
  type: z.enum(["VACATION", "SICK_LEAVE", "MATERNITY", "PATERNITY", "MARRIAGE", "BEREAVEMENT", "STUDY", "UNPAID", "OTHER"]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type CreateMenuOrderInput = z.infer<typeof createMenuOrderSchema>;
export type CreateCatalogProductInput = z.infer<typeof createCatalogProductSchema>;
export type CreateSitePageInput = z.infer<typeof createSitePageSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;