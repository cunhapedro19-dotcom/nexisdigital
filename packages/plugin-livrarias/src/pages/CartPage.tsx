"use client";

import { Cart, Book } from "../types";
import { formatCurrency } from "../utils/formatters";
import { Plus, Minus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface CartPageProps {
  cart: Cart;
  books: Map<string, Book>;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export default function CartPage({ cart, books, onUpdateQuantity, onRemoveItem, onCheckout }: CartPageProps) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = cart.discount || 0;
  const total = subtotal - discount;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Seu carrinho está vazio</h1>
          <p className="text-[var(--text-secondary)] mb-6">Adicione alguns livros para começar sua compra</p>
          <a href="/" className="btn btn-primary">Continuar comprando</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Carrinho de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => {
              const book = books.get(item.bookId);
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)]"
                >
                  <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-tertiary)]">
                    {book?.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--text-primary)] mb-1">{book?.title || "Livro"}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-2">{book?.author || ""}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[var(--brand-cyan)]">{formatCurrency(item.unitPrice)}</span>
                      {book?.compareAtPrice && book.compareAtPrice > book.price && (
                        <span className="text-sm text-[var(--text-muted)] line-through">{formatCurrency(book.compareAtPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="btn btn-ghost p-1.5 rounded"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="btn btn-ghost p-1.5 rounded"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto btn btn-ghost p-1.5 rounded text-[var(--text-danger)] hover:bg-[var(--text-danger)]/10"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[var(--text-primary)] text-lg">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              );
            })}

            {/* Coupon */}
            <div className="flex gap-2 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)]">
              <input
                type="text"
                placeholder="Cupom de desconto"
                className="flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              />
              <button className="btn btn-outline whitespace-nowrap">Aplicar</button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 card p-6 space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Resumo do Pedido</h2>

              <div className="space-y-3 border-t border-[var(--border-default)] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal ({cart.items.length} itens)</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-[var(--text-success)]">
                    <span>Desconto</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Frete</span>
                  <span className="font-medium text-[var(--text-primary)]">Calcular no checkout</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--border-default)]">
                  <span className="font-bold text-[var(--text-primary)] text-lg">Total</span>
                  <span className="font-bold text-[var(--brand-cyan)] text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
              >
                Finalizar Compra
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span>Compra segura</span>
              </div>

              <div className="text-center text-xs text-[var(--text-muted)]">
                <p>Frete grátis acima de R$ 99,00</p>
                <p>Parcelamento em até 6x sem juros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <a href="/" className="btn btn-ghost flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" />
            Continuar comprando
          </a>
        </div>
      </div>
    </div>
  );
}