"use client";

import { z } from "zod";

/**
 * Tipos para o plugin de Cardápio Digital
 * Sistema de cardápio online com pedidos, mesas e delivery
 */

// =========================================================
// Enums e Constantes
// =========================================================

export const MenuCategorySchema = z.enum([
  "entradas",
  "pratos-principais",
  "sobremesas",
  "bebidas",
  "lanches",
  "pizzas",
  "combos",
  "promocoes",
]);
export type MenuCategory = z.infer<typeof MenuCategorySchema>;

export const MenuItemStatusSchema = z.enum(["AVAILABLE", "UNAVAILABLE", "LIMITED", "SEASONAL"]);
export type MenuItemStatus = z.infer<typeof MenuItemStatusSchema>;

export const OrderTypeSchema = z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const OrderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const TableStatusSchema = z.enum(["FREE", "OCCUPIED", "RESERVED", "WAITING", "CLEANING"]);
export type TableStatus = z.infer<typeof TableStatusSchema>;

export const SpicyLevelSchema = z.enum(["none", "mild", "medium", "hot", "extra-hot"]);
export type SpicyLevel = z.infer<typeof SpicyLevelSchema>;

// =========================================================
// Entidades Principais
// =========================================================

export interface MenuItem {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: MenuCategory;
  subcategory?: string;
  price: number; // em centavos
  promotionalPrice?: number;
  costPrice?: number;
  image?: string;
  galleryImages: string[];
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isLactoseFree: boolean;
  spicyLevel: SpicyLevel;
  servings: number;
  preparationTime: number; // em minutos
  calories?: number;
  status: MenuItemStatus;
  isFeatured: boolean;
  isBestseller: boolean;
  sortOrder: number;
  complementaryItems: string[]; // IDs de itens que combinam
  modifiers: MenuItemModifier[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemModifier {
  id: string;
  name: string;
  description?: string;
  type: "single" | "multiple";
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  additionalPrice: number; // em centavos
  isDefault: boolean;
  isActive: boolean;
}

export interface MenuOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  tableId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: MenuOrderItem[];
  notes?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tipAmount: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  estimatedTime: number; // em minutos
  placedAt: Date;
  confirmedAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  unitPrice: number;
  modifiers: Array<{
    modifierId: string;
    optionId: string;
    name: string;
    additionalPrice: number;
  }>;
  notes?: string;
  total: number;
}

export interface Table {
  id: string;
  tenantId: string;
  number: string;
  name?: string;
  capacity: number;
  minSpend?: number;
  location: "indoor" | "outdoor" | "balcony" | "bar" | "vip";
  status: TableStatus;
  currentOrderId?: string;
  reservationName?: string;
  reservationPhone?: string;
  reservationTime?: Date;
  qrCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantConfig {
  restaurantName: string;
  tagline?: string;
  logo?: string;
  coverImage?: string;
  description: string;
  contactPhone: string;
  contactWhatsApp?: string;
  contactEmail?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  openingHours: OpeningHour[];
  holidayHours?: string;
  deliveryEnabled: boolean;
  deliveryFee: number;
  deliveryRadiusKm: number;
  minDeliveryOrder: number;
  averageDeliveryTime: number;
  takeawayEnabled: boolean;
  dineInEnabled: boolean;
  showQrMenu: boolean;
  paymentMethods: ("pix" | "credit_card" | "debit_card" | "cash" | "meal_voucher")[];
  acceptsTips: boolean;
  socialLinks: Record<string, string>;
  primaryColor: string;
  currency: string;
  serviceChargePercent: number; // taxa de serviço
}

export interface OpeningHour {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  open: string; // "18:00"
  close: string; // "23:00"
  isOpen: boolean;
}

// =========================================================
// Schemas Zod
// =========================================================

export const MenuItemSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().min(10),
  shortDescription: z.string().max(150).optional(),
  category: MenuCategorySchema,
  subcategory: z.string().optional(),
  price: z.number().int().min(0),
  promotionalPrice: z.number().int().min(0).optional(),
  image: z.string().url().optional(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spicyLevel: SpicyLevelSchema.default("none"),
  servings: z.number().int().min(1).default(1),
  preparationTime: z.number().int().min(1).default(15),
  status: MenuItemStatusSchema.default("AVAILABLE"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const MenuOrderSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  type: OrderTypeSchema,
  tableId: z.string().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
    modifiers: z.array(z.object({
      modifierId: z.string(),
      optionId: z.string(),
    })).default([]),
  })).min(1),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export type MenuItemFormData = z.infer<typeof MenuItemSchema>;
export type MenuOrderFormData = z.infer<typeof MenuOrderSchema>;
