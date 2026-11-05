"use client";

import type { Product, QuoteCartItem } from "../types";
import { formatCurrency, getEffectivePrice } from "../utils/helpers";
import { X, Plus, Minus, Trash2, FileText, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuoteCartItem[];
  products: Product[];
  itemCount: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function QuoteDrawer({
  isOpen,
  onClose,
  items,
  products,
  itemCount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: QuoteDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={clsx(
          "fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[var(--bg-primary)] border-l border-[var(--border-default)] shadow-xl flex flex-col transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Cotação"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--brand-cyan)]" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--text-primary)]">Sua Cotação</h2>
              <p className="text-sm text-[var(--text-muted)]">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-[var(--text-muted)]" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)] mb-1">Cotação vazia</h3>
              <p className="text-sm text-[var(--text-muted)]">Adicione produtos do catálogo</p>
            </div>
          ) : (
            items.map(item => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              const unitPrice = getEffectivePrice(product, item.quantity);
              return (
                <div key={item.productId} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] text-sm">{product.name}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{product.sku}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {formatCurrency(unitPrice, "BRL")} / {product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="btn btn-ghost p-1.5 text-[var(--text-danger)]"
                      aria-label={`Remover ${product.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="btn btn-ghost p-1.5 rounded"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => onUpdateQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))}
                        className="w-14 text-center text-sm bg-[var(--bg-primary)] border border-[var(--border-default)] rounded py-0.5 text-[var(--text-primary)]"
                        aria-label={`Quantidade de ${product.name}`}
                        min={1}
                      />
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="btn btn-ghost p-1.5 rounded"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-[var(--text-primary)] text-sm">
                      {formatCurrency(unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border-default)] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] text-sm">Total estimado</span>
              <span className="text-lg font-bold text-[var(--brand-cyan)]">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              * Valores estimados — o orçamento oficial é enviado por email em até 24h úteis.
            </p>
            <div className="flex gap-2">
              <button onClick={onClearCart} className="btn btn-ghost text-[var(--text-danger)] text-sm">
                Limpar
              </button>
              <button onClick={onCheckout} className="btn btn-primary flex-1">
                Solicitar Orçamento
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
