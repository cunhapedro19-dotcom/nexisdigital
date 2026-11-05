"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { MenuItem, MenuOrder, MenuItemModifier } from "../types";
import { estimateWaitTime } from "../utils/helpers";

/**
 * Hook de pedido para o plugin Cardápio
 * Gerencia carrinho, modificadores e criação de pedidos
 */

export interface CartItemWithModifiers {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  modifiers: Array<{
    modifierId: string;
    optionId: string;
    name: string;
    additionalPrice: number;
  }>;
  unitPrice: number; // preço base + modificadores
  total: number;
}

export interface UseOrderReturn {
  items: CartItemWithModifiers[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableNumber?: string;
  customerInfo: { name: string; phone: string; address: string };
  notes: string;
  estimatedTime: number;
  isLoading: boolean;
  setOrderType: (type: "DINE_IN" | "TAKEAWAY" | "DELIVERY") => void;
  setTableNumber: (table: string) => void;
  setCustomerInfo: (info: { name: string; phone: string; address: string }) => void;
  setNotes: (notes: string) => void;
  addItem: (item: MenuItem, quantity?: number, modifiers?: CartItemWithModifiers["modifiers"], notes?: string) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setDeliveryFee: (fee: number) => void;
  submitOrder: () => Promise<MenuOrder | null>;
}

const CART_KEY = "nexis-cardapio-cart";

export function useOrder(tenantId: string, deliveryFee: number = 0): UseOrderReturn {
  const [cart, setCart] = useLocalStorage<CartItemWithModifiers[]>(CART_KEY, []);
  const [orderType, setOrderTypeState] = useLocalStorage<"DINE_IN" | "TAKEAWAY" | "DELIVERY">("nexis-cardapio-order-type", "DINE_IN");
  const [tableNumber, setTableNumberState] = useLocalStorage<string>("nexis-cardapio-table", "");
  const [customerInfo, setCustomerInfoState] = useLocalStorage("nexis-cardapio-customer", { name: "", phone: "", address: "" });
  const [notes, setNotesState] = useLocalStorage("nexis-cardapio-notes", "");
  const [customDeliveryFee, setCustomDeliveryFee] = useLocalStorage("nexis-cardapio-delivery-fee", deliveryFee);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<MenuOrder | null>(null);

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);

  const effectiveDeliveryFee = orderType === "DELIVERY" ? customDeliveryFee : 0;
  const total = subtotal + effectiveDeliveryFee;

  const estimatedTime = useMemo(
    () => estimateWaitTime(cart.map(i => ({ preparationTime: i.menuItem.preparationTime, quantity: i.quantity }))),
    [cart]
  );

  const setOrderType = useCallback((type: "DINE_IN" | "TAKEAWAY" | "DELIVERY") => {
    setOrderTypeState(type);
  }, [setOrderTypeState]);

  const setTableNumber = useCallback((table: string) => {
    setTableNumberState(table);
    if (table) setOrderTypeState("DINE_IN");
  }, [setTableNumberState, setOrderTypeState]);

  const setCustomerInfo = useCallback((info: { name: string; phone: string; address: string }) => {
    setCustomerInfoState(info);
  }, [setCustomerInfoState]);

  const setNotes = useCallback((n: string) => {
    setNotesState(n);
  }, [setNotesState]);

  const setDeliveryFee = useCallback((fee: number) => {
    setCustomDeliveryFee(fee);
  }, [setCustomDeliveryFee]);

  const addItem = useCallback((
    item: MenuItem,
    quantity: number = 1,
    modifiers: CartItemWithModifiers["modifiers"] = [],
    notes?: string
  ) => {
    const modifiersTotal = modifiers.reduce((sum, m) => sum + m.additionalPrice, 0);
    const unitPrice = item.promotionalPrice ?? item.price;
    const finalUnitPrice = unitPrice + modifiersTotal;

    setCart(prev => {
      // Agrupar itens idênticos (mesmo item, mesmos modificadores, mesmas observações)
      const existingIndex = prev.findIndex(i =>
        i.menuItem.id === item.id &&
        i.notes === notes &&
        sameModifiers(i.modifiers, modifiers)
      );

      if (existingIndex >= 0) {
        const newItems = [...prev];
        const existing = newItems[existingIndex];
        newItems[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
          total: (existing.quantity + quantity) * finalUnitPrice,
        };
        return newItems;
      }

      return [
        ...prev,
        {
          menuItem: item,
          quantity,
          notes,
          modifiers,
          unitPrice: finalUnitPrice,
          total: finalUnitPrice * quantity,
        },
      ];
    });
  }, [setCart]);

  const removeItem = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, [setCart]);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setCart(prev => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        quantity,
        total: newItems[index].unitPrice * quantity,
      };
      return newItems;
    });
  }, [setCart, removeItem]);

  const clearCart = useCallback(() => {
    setCart([]);
    setNotesState("");
  }, [setCart, setNotesState]);

  const submitOrder = useCallback(async (): Promise<MenuOrder | null> => {
    if (cart.length === 0) return null;

    setIsLoading(true);
    try {
      // Em produção: POST /api/tenants/:tenantId/orders
      const order: MenuOrder = {
        id: `order-${Date.now()}`,
        tenantId,
        orderNumber: `#${Date.now().toString(36).toUpperCase()}`,
        type: orderType,
        status: "PENDING",
        tableId: tableNumber || undefined,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || undefined,
        customerAddress: orderType === "DELIVERY" ? customerInfo.address : undefined,
        items: cart.map(item => ({
          id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          orderId: "",
          menuItemId: item.menuItem.id,
          menuItem: item.menuItem,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          modifiers: item.modifiers,
          notes: item.notes,
          total: item.total,
        })),
        notes: notes || undefined,
        subtotal,
        discount: 0,
        deliveryFee: effectiveDeliveryFee,
        tipAmount: 0,
        total,
        paymentStatus: "PENDING",
        estimatedTime,
        placedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setLastOrder(order);
      clearCart();
      return order;
    } finally {
      setIsLoading(false);
    }
  }, [cart, tenantId, orderType, tableNumber, customerInfo, notes, subtotal, effectiveDeliveryFee, total, estimatedTime, clearCart]);

  return {
    items: cart,
    itemCount,
    subtotal,
    deliveryFee: effectiveDeliveryFee,
    total,
    orderType,
    tableNumber: tableNumber || undefined,
    customerInfo,
    notes,
    estimatedTime,
    isLoading,
    setOrderType,
    setTableNumber,
    setCustomerInfo,
    setNotes,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setDeliveryFee,
    submitOrder,
  };
}

function sameModifiers(
  a: CartItemWithModifiers["modifiers"],
  b: CartItemWithModifiers["modifiers"]
): boolean {
  if (a.length !== b.length) return false;
  const aKeys = a.map(m => `${m.modifierId}:${m.optionId}`).sort();
  const bKeys = b.map(m => `${m.modifierId}:${m.optionId}`).sort();
  return aKeys.every((key, i) => key === bKeys[i]);
}