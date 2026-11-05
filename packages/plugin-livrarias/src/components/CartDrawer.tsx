"use client";

import { Cart, CartItem, Book } from "../types";
import { formatCurrency as fmtCurrency } from "../utils/formatters";
import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface CartDrawerProps {
  cart: Cart;
  books: Map<string, Book>;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  subtotal: number;
  total: number;
  discount: number;
  itemCount: number;
}

export function CartDrawer({
  cart,
  books,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  subtotal,
  total,
  discount,
  itemCount,
}: CartDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen && !showCheckout) return null;

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          isOpen || showCheckout ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={clsx(
          "fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[var(--bg-primary)] border-l border-[var(--border-default)] shadow-xl",
          "flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen || showCheckout ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[var(--brand-cyan)]" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--text-primary)]">Carrinho</h2>
              <p className="text-sm text-[var(--text-muted)]">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Carrinho vazio</h3>
              <p className="text-[var(--text-muted)]">Adicione livros para começar sua compra</p>
            </div>
          ) : (
            <>
              {cart.items.map(item => {
                const book = books.get(item.bookId);
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg"
                  >
                    <div className="relative w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-[var(--bg-tertiary)]">
                      {book?.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--text-primary)] truncate">{book?.title || "Livro"}</h4>
                      <p className="text-sm text-[var(--text-muted)] truncate">{book?.author || ""}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-[var(--brand-cyan)]">{fmtCurrency(item.unitPrice)}</span>
                        {book?.compareAtPrice && book.compareAtPrice > book.price && (
                          <span className="text-xs text-[var(--text-muted)] line-through">{fmtCurrency(book.compareAtPrice)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="btn btn-ghost p-1.5 rounded"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="btn btn-ghost p-1.5 rounded"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-auto btn btn-ghost p-1.5 rounded text-[var(--text-danger)] hover:bg-[var(--text-danger)]/10"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">{fmtCurrency(item.total)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="border-t border-[var(--border-default)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="font-medium text-[var(--text-primary)]">{fmtCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-[var(--text-success)]">
                    <span>Desconto</span>
                    <span>-{fmtCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Frete</span>
                  <span className="font-medium text-[var(--text-primary)]">A calcular</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-default)]">
                  <span className="font-bold text-[var(--text-primary)]">Total</span>
                  <span className="font-bold text-[var(--brand-cyan)] text-lg">{fmtCurrency(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-[var(--border-default)] space-y-3">
            <button
              onClick={onCheckout}
              className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            >
              Finalizar Compra
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onClose(); setShowCheckout(true); }}
              className="btn btn-outline w-full py-2"
            >
              Ver carrinho completo
            </button>
            <p className="text-xs text-center text-[var(--text-muted)]">
              Frete e impostos calculados no checkout
            </p>
          </div>
        )}
      </aside>
    </>
  );
}