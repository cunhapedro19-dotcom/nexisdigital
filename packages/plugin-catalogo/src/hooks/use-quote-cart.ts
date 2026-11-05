"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Product, QuoteCartItem } from "../types";
import { calculateQuoteSummary, getEffectivePrice, isValidQuantity } from "../utils/helpers";

/**
 * @nexis/plugin-catalogo — Hook de carrinho de orçamento
 * Diferente do e-commerce: guarda produtos + quantidades para pedir orçamento
 */

export interface UseQuoteCartReturn {
  items: QuoteCartItem[];
  itemCount: number;
  summary: { subtotal: number; total: number; itemCount: number };
  addProduct: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  submitQuote: (customer: { name: string; email: string; phone?: string; company?: string }, notes?: string) => Promise<{ quoteNumber: string } | null>;
  isLoading: boolean;
  lastQuoteNumber: string | null;
}

const QUOTE_CART_KEY = "nexis-catalogo-quote-cart";

export function useQuoteCart(tenantId: string, products: Product[] = []): UseQuoteCartReturn {
  const [cart, setCart] = useLocalStorage<QuoteCartItem[]>(`${QUOTE_CART_KEY}-${tenantId}`, []);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuoteNumber, setLastQuoteNumber] = useState<string | null>(null);

  // Limpa produtos que não existem mais
  useEffect(() => {
    if (products.length === 0) return;
    setCart(prev => prev.filter(item => products.some(p => p.id === item.productId)));
  }, [products, setCart]);

  const itemCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const summary = useMemo(
    () => calculateQuoteSummary(cart, products),
    [cart, products]
  );

  const addProduct = useCallback((product: Product, quantity: number = product.minOrderQty || 1): boolean => {
    if (!isValidQuantity(product, quantity)) return false;

    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { productId: product.id, quantity }];
    });
    return true;
  }, [setCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prev =>
      quantity <= 0
        ? prev.filter(i => i.productId !== productId)
        : prev.map(i => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, [setCart]);

  const removeItem = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const submitQuote = useCallback(async (
    customer: { name: string; email: string; phone?: string; company?: string },
    notes?: string
  ): Promise<{ quoteNumber: string } | null> => {
    if (cart.length === 0) return null;

    setIsLoading(true);
    try {
      // Em produção: POST /api/tenants/:tenantId/quotes
      const quoteNumber = `QT${new Date().getFullYear().toString().slice(2)}-${Math.floor(Math.random() * 90000 + 10000)}`;
      await new Promise(r => setTimeout(r, 400));

      setLastQuoteNumber(quoteNumber);
      clearCart();
      return { quoteNumber };
    } finally {
      setIsLoading(false);
    }
  }, [cart, clearCart]);

  return {
    items: cart,
    itemCount,
    summary,
    addProduct,
    updateQuantity,
    removeItem,
    clearCart,
    submitQuote,
    isLoading,
    lastQuoteNumber,
  };
}

export { getEffectivePrice };
