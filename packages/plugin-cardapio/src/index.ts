"use client";

/**
 * @nexis/plugin-cardapio
 * Plugin de Cardápio Digital - Menu, Carrinho com Modificadores, Pedidos, Mesas, Admin
 */

export * from "./types";
export * from "./utils/helpers";
export * from "./hooks/use-local-storage";
export * from "./hooks/use-order";

// Tipos de plugin
export interface CardapioPluginConfig {
  tenantId: string;
  config: import("./types").RestaurantConfig;
  menuItems: import("./types").MenuItem[];
  categories: import("./types").MenuCategory[];
  tables: import("./types").Table[];
}

export interface CardapioPluginInstance {
  instanceId: string;
  tenantId: string;
  config: CardapioPluginConfig;

  // Menu
  getMenu: () => Promise<import("./types").MenuItem[]>;
  getMenuItem: (id: string) => Promise<import("./types").MenuItem | null>;
  getMenuByCategory: (category: string) => Promise<import("./types").MenuItem[]>;
  searchMenu: (query: string) => Promise<import("./types").MenuItem[]>;

  // Carrinho / Pedidos
  addToCart: (itemId: string, quantity: number, modifiers?: import("./hooks/use-order").CartItemWithModifiers["modifiers"], notes?: string) => Promise<void>;
  getCart: () => Promise<import("./hooks/use-order").CartItemWithModifiers[]>;
  clearCart: () => Promise<void>;
  submitOrder: () => Promise<import("./types").MenuOrder | null>;
  getOrder: (id: string) => Promise<import("./types").MenuOrder | null>;
  getOrders: (filters?: { status?: string }) => Promise<import("./types").MenuOrder[]>;
  updateOrderStatus: (id: string, status: import("./types").OrderStatus) => Promise<import("./types").MenuOrder>;

  // Mesas
  getTables: () => Promise<import("./types").Table[]>;
  getTable: (id: string) => Promise<import("./types").Table | null>;

  // Admin
  createMenuItem: (data: Partial<import("./types").MenuItem>) => Promise<import("./types").MenuItem>;
  updateMenuItem: (id: string, data: Partial<import("./types").MenuItem>) => Promise<import("./types").MenuItem>;
  deleteMenuItem: (id: string) => Promise<void>;
  updateConfig: (data: Partial<import("./types").RestaurantConfig>) => Promise<import("./types").RestaurantConfig>;
}

// Páginas
export { default as CardapioPage } from "./pages/CardapioPage";

// Admin
export { default as CardapioAdmin } from "./admin/CardapioAdmin";

// Componentes
export { MenuCard } from "./components/MenuCard";
export { CartSidebar } from "./components/CartSidebar";
export { ItemDetailsModal } from "./components/ItemDetailsModal";

// Tipos para integração com plataforma
export type {
  MenuItem,
  MenuItemModifier,
  ModifierOption,
  MenuCategory,
  MenuOrder,
  MenuOrderItem,
  OrderType,
  OrderStatus,
  TableStatus,
  SpicyLevel,
  Table,
  RestaurantConfig,
  OpeningHour,
} from "./types";
export type { CartItemWithModifiers } from "./hooks/use-order";
