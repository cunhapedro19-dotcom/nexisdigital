"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Cart, CartItem, Book, Coupon, LivrariaSettings } from "../types";
import { calculateCartTotals, getAvailableShippingMethods } from "../utils/pricing";

const CART_STORAGE_KEY = "nexis-livrarias-cart";
const CART_EXPIRY_HOURS = 48;

function generateCartId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyCart(tenantId: string, customerId?: string, sessionId?: string): Cart {
  return {
    id: generateCartId(),
    tenantId,
    customerId,
    sessionId,
    items: [],
    discount: 0,
    subtotal: 0,
    total: 0,
    expiresAt: new Date(Date.now() + CART_EXPIRY_HOURS * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export interface UseCartReturn {
  cart: Cart;
  isLoading: boolean;
  addItem: (book: Book, quantity?: number, format?: "hardcover" | "paperback" | "ebook" | "audiobook") => void;
  removeItem: (bookId: string, format?: string) => void;
  updateQuantity: (bookId: string, quantity: number, format?: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  setShippingMethod: (methodId: string) => void;
  redeemLoyaltyPoints: (points: number) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isEmpty: boolean;
  pricing: ReturnType<typeof calculateCartTotals> | null;
  availableShippingMethods: ReturnType<typeof getAvailableShippingMethods>;
}

export function useCart(
  tenantId: string,
  settings: LivrariaSettings,
  books: Map<string, Book>,
  customerId?: string
): UseCartReturn {
  const sessionId = typeof window !== "undefined" ? (window.sessionStorage.getItem("nexis-session-id") || `session-${Date.now()}`) : `session-${Date.now()}`;

  if (typeof window !== "undefined" && !window.sessionStorage.getItem("nexis-session-id")) {
    window.sessionStorage.setItem("nexis-session-id", sessionId);
  }

  const [cart, setCart] = useLocalStorage<Cart | null>(CART_STORAGE_KEY, null);
  const [isLoading, setIsLoading] = useState(true);
  const [pricing, setPricing] = useState<ReturnType<typeof calculateCartTotals> | null>(null);
  const [availableShippingMethods, setAvailableShippingMethods] = useState<ReturnType<typeof getAvailableShippingMethods>>([]);

  // Inicializar carrinho
  useEffect(() => {
    if (!cart) {
      const newCart = createEmptyCart(tenantId, customerId, sessionId);
      setCart(newCart);
    } else if (cart.tenantId !== tenantId) {
      const newCart = createEmptyCart(tenantId, customerId, sessionId);
      setCart(newCart);
    } else if (new Date(cart.expiresAt) < new Date()) {
      const newCart = createEmptyCart(tenantId, customerId, sessionId);
      setCart(newCart);
    }
    setIsLoading(false);
  }, [cart, tenantId, customerId, sessionId, setCart]);

  // Recalcular preços quando carrinho ou livros mudam
  useEffect(() => {
    if (!cart) return;

    // TODO: plugar coupon/shipping/loyalty reais quando estes campos
    // existirem no modelo Cart (hoje o estado fica no checkout).
    const newPricing = calculateCartTotals(cart, books, settings);
    setPricing(newPricing);

    const methods = getAvailableShippingMethods(cart, books, settings, { state: "" });
    setAvailableShippingMethods(methods);
  }, [cart, books, settings]);

  const updateCart = useCallback((updater: (prev: Cart) => Cart) => {
    setCart(prev => {
      if (!prev) return createEmptyCart(tenantId, customerId, sessionId);
      const updated = updater(prev);
      return { ...updated, updatedAt: new Date() };
    });
  }, [setCart, tenantId, customerId, sessionId]);

  const addItem = useCallback((book: Book, quantity: number = 1, format: "hardcover" | "paperback" | "ebook" | "audiobook" = "paperback") => {
    updateCart(prev => {
      if (!prev) return createEmptyCart(tenantId, customerId, sessionId);

      const existingIndex = prev.items.findIndex(item => item.bookId === book.id && item.format === format);

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          total: (newItems[existingIndex].quantity + quantity) * newItems[existingIndex].unitPrice,
        };
      } else {
        const newItem: CartItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          cartId: prev.id,
          bookId: book.id,
          book,
          quantity,
          format,
          unitPrice: book.price,
          total: book.price * quantity,
        };
        newItems = [...prev.items, newItem];
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      return { ...prev, items: newItems, subtotal };
    });
  }, [updateCart, tenantId, customerId, sessionId]);

  const removeItem = useCallback((bookId: string, format: string = "paperback") => {
    updateCart(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter(item => !(item.bookId === bookId && item.format === format));
      const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      return { ...prev, items: newItems, subtotal };
    });
  }, [updateCart]);

  const updateQuantity = useCallback((bookId: string, quantity: number, format: string = "paperback") => {
    if (quantity <= 0) {
      removeItem(bookId, format);
      return;
    }

    updateCart(prev => {
      if (!prev) return prev;
      const newItems = prev.items.map(item => {
        if (item.bookId === bookId && item.format === format) {
          return { ...item, quantity, total: item.unitPrice * quantity };
        }
        return item;
      });
      const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      return { ...prev, items: newItems, subtotal };
    });
  }, [updateCart, removeItem]);

  const clearCart = useCallback(() => {
    setCart(createEmptyCart(tenantId, customerId, sessionId));
  }, [setCart, tenantId, customerId, sessionId]);

  const applyCoupon = useCallback((coupon: Coupon) => {
    updateCart(prev => {
      if (!prev) return prev;
      return { ...prev, couponCode: coupon.code };
    });
  }, [updateCart]);

  const removeCoupon = useCallback(() => {
    updateCart(prev => {
      if (!prev) return prev;
      const { couponCode, ...rest } = prev;
      return rest;
    });
  }, [updateCart]);

  const setShippingMethod = useCallback((methodId: string) => {
    updateCart(prev => {
      if (!prev) return prev;
      return { ...prev, shippingMethodId: methodId };
    });
  }, [updateCart]);

  const redeemLoyaltyPoints = useCallback((points: number) => {
    updateCart(prev => {
      if (!prev) return prev;
      return { ...prev, loyaltyPointsRedeemed: points };
    });
  }, [updateCart]);

  const getItemCount = useCallback(() => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart]);

  const getSubtotal = useCallback(() => {
    return cart?.subtotal || 0;
  }, [cart]);

  const getTotal = useCallback(() => {
    return pricing?.total || cart?.total || 0;
  }, [cart, pricing]);

  return {
    cart: cart || createEmptyCart(tenantId, customerId, sessionId),
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setShippingMethod,
    redeemLoyaltyPoints,
    getItemCount,
    getSubtotal,
    getTotal,
    isEmpty: !cart || cart.items.length === 0,
    pricing,
    availableShippingMethods,
  };
}