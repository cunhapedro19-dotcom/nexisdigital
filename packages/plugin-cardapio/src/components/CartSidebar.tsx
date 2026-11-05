"use client";

import type { CartItemWithModifiers } from "../hooks/use-order";
import { formatCurrency, formatPreparationTime } from "../utils/helpers";
import { X, Plus, Minus, Trash2, ShoppingBag, Bike, Utensils, ShoppingBasket } from "lucide-react";
import { clsx } from "clsx";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemWithModifiers[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  estimatedTime: number;
  onOrderTypeChange: (type: "DINE_IN" | "TAKEAWAY" | "DELIVERY") => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  itemCount,
  subtotal,
  deliveryFee,
  total,
  orderType,
  estimatedTime,
  onOrderTypeChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartSidebarProps) {
  const orderTypes = [
    { id: "DINE_IN" as const, label: "No local", icon: Utensils },
    { id: "TAKEAWAY" as const, label: "Retirada", icon: ShoppingBasket },
    { id: "DELIVERY" as const, label: "Entrega", icon: Bike },
  ];

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

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[var(--bg-primary)] border-l border-[var(--border-default)] shadow-xl flex flex-col transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-amber)]/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[var(--brand-amber)]" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--text-primary)]">Seu Pedido</h2>
              <p className="text-sm text-[var(--text-muted)]">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order type selector */}
        <div className="p-4 border-b border-[var(--border-default)]">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de pedido">
            {orderTypes.map(type => (
              <button
                key={type.id}
                onClick={() => onOrderTypeChange(type.id)}
                role="radio"
                aria-checked={orderType === type.id}
                className={clsx(
                  "flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all",
                  orderType === type.id
                    ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                    : "bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                )}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-[var(--text-muted)]" />
              </div>
              <h3 className="font-medium text-[var(--text-primary)] mb-1">Carrinho vazio</h3>
              <p className="text-sm text-[var(--text-muted)]">Adicione itens do cardápio</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] text-sm">
                      {item.quantity}× {item.menuItem.name}
                    </p>
                    {item.modifiers.length > 0 && (
                      <ul className="text-xs text-[var(--text-muted)] mt-1">
                        {item.modifiers.map(m => (
                          <li key={m.optionId}>
                            + {m.name}
                            {m.additionalPrice > 0 && ` (+${formatCurrency(m.additionalPrice)})`}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.notes && (
                      <p className="text-xs text-[var(--text-warning)] mt-1 italic">"{item.notes}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="btn btn-ghost p-1.5 text-[var(--text-danger)]"
                    aria-label={`Remover ${item.menuItem.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className="btn btn-ghost p-1.5 rounded"
                      aria-label="Diminuir"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="btn btn-ghost p-1.5 rounded"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border-default)] p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="font-medium text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Taxa de entrega</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1">
                <span className="text-[var(--text-primary)]">Total</span>
                <span className="text-[var(--brand-cyan)]">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                Tempo estimado: ~{formatPreparationTime(estimatedTime)}
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={onClearCart} className="btn btn-ghost text-[var(--text-danger)] text-sm">
                Limpar
              </button>
              <button onClick={onCheckout} className="btn btn-primary flex-1">
                Finalizar Pedido
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}