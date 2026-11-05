"use client";

import { formatCurrency } from "../utils/formatters";
import { Package, Truck, Clock } from "lucide-react";

interface OrderSummaryProps {
  order: any;
  items: any[];
}

export function OrderSummary({ order, items = [] }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = order.shippingCost || 0;
  const discount = order.discount || 0;
  const total = order.total || subtotal + shipping - discount;

  return (
    <div className="card p-6 space-y-6">
      <h2 className="font-semibold text-[var(--text-primary)]">Resumo do Pedido</h2>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="w-16 h-20 flex-shrink-0 rounded bg-[var(--bg-secondary)] overflow-hidden">
              {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📖</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">{item.title}</p>
              <p className="text-sm text-[var(--text-muted)]">{item.author}</p>
              <p className="text-sm text-[var(--text-secondary)]">Qtd: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border-default)] pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Subtotal</span>
          <span className="font-medium text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-[var(--text-success)]">
            <span>Desconto</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm flex items-center gap-2">
          <span className="text-[var(--text-secondary)] flex items-center gap-1"><Truck className="w-4 h-4" /> Frete</span>
          <span className="font-medium text-[var(--text-primary)]">{shipping > 0 ? formatCurrency(shipping) : "Grátis"}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-[var(--border-default)] font-bold text-lg">
          <span className="text-[var(--text-primary)]">Total</span>
          <span className="text-[var(--brand-cyan)]">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="border-t border-[var(--border-default)] pt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Package className="w-4 h-4" />
          <span>Entrega estimada: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString("pt-BR") : "A calcular"}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Clock className="w-4 h-4" />
          <span>Pedido realizado em {order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR") : "—"}</span>
        </div>
      </div>
    </div>
  );
}