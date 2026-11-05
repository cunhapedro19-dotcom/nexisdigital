"use client";

import type { Book, Cart, CartItem, Coupon, ShippingMethod, LivrariaSettings, Address } from "../types";

/**
 * Motor de precificação para o plugin Livrarias
 */

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  loyaltyDiscount: number;
  items: Array<{
    bookId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  appliedCoupon?: Coupon;
  appliedShippingMethod?: ShippingMethod;
}

export function calculateCartTotals(
  cart: Cart,
  books: Map<string, Book>,
  settings: LivrariaSettings,
  coupon?: Coupon,
  shippingMethod?: ShippingMethod,
  loyaltyPointsToRedeem: number = 0
): PricingBreakdown {
  const items = cart.items.map(item => {
    const book = books.get(item.bookId);
    const unitPrice = book?.price || item.unitPrice;
    const itemTotal = unitPrice * item.quantity;
    // Desconto por item ainda não existe no modelo CartItem — 0 por enquanto.
    const itemDiscount = 0;

    return {
      bookId: item.bookId,
      quantity: item.quantity,
      unitPrice,
      discount: itemDiscount,
      total: itemTotal - itemDiscount,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemDiscounts = items.reduce((sum, item) => sum + item.discount * item.quantity, 0);

  let discount = itemDiscounts + (cart.discount || 0);
  let appliedCoupon: Coupon | undefined;

  // Aplicar cupom
  if (coupon && isCouponValid(coupon, cart, books)) {
    appliedCoupon = coupon;
    if (coupon.type === "percentage") {
      const couponDiscount = Math.floor((subtotal - itemDiscounts) * (coupon.value / 100));
      discount += coupon.maxDiscount ? Math.min(couponDiscount, coupon.maxDiscount) : couponDiscount;
    } else if (coupon.type === "fixed") {
      discount += Math.min(coupon.value, subtotal - itemDiscounts);
    }
    // free_shipping é tratado no frete
  }

  // Fidelidade
  const loyaltyDiscount = Math.min(loyaltyPointsToRedeem * settings.pointsRedemptionRate, subtotal - discount);
  discount += loyaltyDiscount;

  // Frete
  let shipping = 0;
  let appliedShippingMethod: ShippingMethod | undefined;

  if (shippingMethod) {
    appliedShippingMethod = shippingMethod;
    if (shippingMethod.type === "flat_rate") {
      shipping = shippingMethod.cost;
    } else if (shippingMethod.type === "calculated") {
      // Cálculo simplificado baseado no peso/valor
      shipping = shippingMethod.cost;
    }
    // free e pickup = 0
  } else if (settings.shippingMethods.length > 0) {
    // Usar primeiro método ativo como padrão
    const defaultMethod = settings.shippingMethods.find(m => m.isActive);
    if (defaultMethod) {
      appliedShippingMethod = defaultMethod;
      if (defaultMethod.type === "flat_rate") {
        shipping = defaultMethod.cost;
      }
    }
  }

  // Frete grátis por cupom
  if (appliedCoupon?.type === "free_shipping") {
    shipping = 0;
  }

  // Frete grátis por valor mínimo
  if (settings.freeShippingThreshold > 0 && subtotal - discount >= settings.freeShippingThreshold) {
    shipping = 0;
  }

  // Imposto
  const taxableAmount = subtotal - discount + shipping;
  const tax = settings.taxIncluded ? 0 : Math.round(taxableAmount * (settings.taxRate / 100));

  const total = subtotal - discount + shipping + tax;

  // Pontos de fidelidade ganhos
  const loyaltyPointsEarned = settings.loyaltyEnabled
    ? calculateLoyaltyPoints(total, settings.pointsPerReal)
    : 0;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: Math.max(0, total),
    loyaltyPointsEarned,
    loyaltyPointsRedeemed: loyaltyPointsToRedeem,
    loyaltyDiscount,
    items,
    appliedCoupon,
    appliedShippingMethod,
  };
}

export function isCouponValid(coupon: Coupon, cart: Cart, books: Map<string, Book>): boolean {
  const now = new Date();

  if (!coupon.isActive) return false;
  if (now < coupon.validFrom || now > coupon.validUntil) return false;
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return false;

  // Verificar valor mínimo
  const subtotal = cart.items.reduce((sum, item) => {
    const book = books.get(item.bookId);
    return sum + (book?.price || item.unitPrice) * item.quantity;
  }, 0);

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return false;

  // Verificar categorias aplicáveis
  if (coupon.applicableCategories.length > 0) {
    const hasApplicableCategory = cart.items.some(item => {
      const book = books.get(item.bookId);
      return book && coupon.applicableCategories.includes(book.category);
    });
    if (!hasApplicableCategory) return false;
  }

  // Verificar livros aplicáveis
  if (coupon.applicableBooks.length > 0) {
    const hasApplicableBook = cart.items.some(item => coupon.applicableBooks.includes(item.bookId));
    if (!hasApplicableBook) return false;
  }

  return true;
}

export function calculateShippingCost(
  cart: Cart,
  books: Map<string, Book>,
  shippingMethod: ShippingMethod,
  address: Address
): number {
  switch (shippingMethod.type) {
    case "flat_rate":
      return shippingMethod.cost;
    case "free":
    case "pickup":
      return 0;
    case "calculated":
      // Cálculo simplificado: baseado no peso total ou valor
      const totalWeight = cart.items.reduce((sum, item) => {
        const book = books.get(item.bookId);
        return sum + (book?.weight || 0.5) * item.quantity;
      }, 0);

      // Exemplo: R$ 15,00 base + R$ 2,00 por kg
      return shippingMethod.cost + Math.ceil(totalWeight) * 200;
    default:
      return shippingMethod.cost;
  }
}

export function getAvailableShippingMethods(
  cart: Cart,
  books: Map<string, Book>,
  settings: LivrariaSettings,
  address: Address
): ShippingMethod[] {
  return settings.shippingMethods.filter(method => {
    if (!method.isActive) return false;

    // Verificar estados aplicáveis
    if (method.applicableStates && method.applicableStates.length > 0) {
      if (!method.applicableStates.includes(address.state)) return false;
    }

    // Verificar valor mínimo/máximo do pedido
    const subtotal = cart.items.reduce((sum, item) => {
      const book = books.get(item.bookId);
      return sum + (book?.price || item.unitPrice) * item.quantity;
    }, 0);

    if (method.minOrderAmount && subtotal < method.minOrderAmount) return false;
    if (method.maxOrderAmount && subtotal > method.maxOrderAmount) return false;

    return true;
  });
}

export function calculateLoyaltyPoints(amount: number, rate: number): number {
  return Math.floor((amount / 100) * rate);
}

export function calculatePointsRedemptionValue(points: number, rate: number): number {
  return points * rate;
}

export function getStockStatus(book: Book): "in_stock" | "low_stock" | "out_of_stock" | "backorder" {
  const available = book.stockQuantity - book.reservedQuantity;

  if (available <= 0) {
    return book.allowBackorder ? "backorder" : "out_of_stock";
  }
  if (available <= book.lowStockThreshold) {
    return "low_stock";
  }
  return "in_stock";
}

export function getStockMessage(book: Book): string {
  const status = getStockStatus(book);
  const available = book.stockQuantity - book.reservedQuantity;

  switch (status) {
    case "in_stock":
      return `Em estoque (${available} disponíveis)`;
    case "low_stock":
      return `Poucas unidades (${available} restantes)`;
    case "backorder":
      return "Disponível sob encomenda";
    case "out_of_stock":
      return "Fora de estoque";
  }
}

export function canAddToCart(book: Book, quantity: number = 1): { allowed: boolean; message?: string } {
  const available = book.stockQuantity - book.reservedQuantity;

  if (!book.isActive) {
    return { allowed: false, message: "Produto indisponível" };
  }

  if (available <= 0 && !book.allowBackorder) {
    return { allowed: false, message: "Fora de estoque" };
  }

  if (available > 0 && quantity > available && !book.allowBackorder) {
    return { allowed: false, message: `Apenas ${available} unidade(s) disponível(eis)` };
  }

  return { allowed: true };
}