"use client";

import { formatCurrency } from "../utils/formatters";
import { Truck, Gift, Shield } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  itemCount: number;
  freeShippingThreshold?: number;
  loyaltyPoints?: number;
  loyaltyPointsValue?: number;
}

export function CartSummary({
  subtotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  itemCount,
  freeShippingThreshold = 9900,
  loyaltyPoints = 0,
  loyaltyPointsValue = 0,
}: CartSummaryProps) {
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-semibold text-[var(--text-primary)]">Resumo do Pedido</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
          <span className="font-medium text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-[var(--text-success)]">
            <span>Desconto</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        {loyaltyPointsValue > 0 && (
          <div className="flex justify-between text-sm text-[var(--text-success)]">
            <span>Pontos de Fidelidade ({loyaltyPoints} pts)</span>
            <span>-{formatCurrency(loyaltyPointsValue)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)] flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Frete
          </span>
          <span className="font-medium text-[var(--text-primary)]">
            {shipping > 0 ? formatCurrency(shipping) : "Grátis"}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Impostos</span>
            <span className="font-medium text-[var(--text-primary)]">{formatCurrency(tax)}</span>
          </div>
        )}

        {remainingForFreeShipping > 0 && shipping === 0 && (
          <div className="text-xs text-[var(--brand-amber)] bg-[var(--brand-amber)]/10 p-2 rounded-lg">
            Adicione mais {formatCurrency(remainingForFreeShipping)} para ganhar frete grátis!
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-default)] pt-4 space-y-2">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-[var(--text-primary)]">Total</span>
          <span className="text-[var(--brand-cyan)]">{formatCurrency(total)}</span>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <Shield className="w-4 h-4" />
          <span>Compra segura e criptografada</span>
        </div>

        {loyaltyPoints > 0 && (
          <div className="text-center text-sm text-[var(--text-muted)]">
            Você ganhará <span className="font-medium text-[var(--brand-cyan)]">{loyaltyPoints}</span> pontos de fidelidade
          </div>
        )}
      </div>
    </div>
  );
}