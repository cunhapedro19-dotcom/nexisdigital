"use client";

import { useState } from "react";
import type { Product } from "../types";
import { formatCurrency, getStockDisplay, getEffectivePrice, VOLUME_TIERS } from "../utils/helpers";
import { X, FileDown, Plus, Minus } from "lucide-react";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToQuote: (product: Product, quantity: number) => void;
}

export function ProductDetailsModal({ product, onClose, onAddToQuote }: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const stock = getStockDisplay(product);
  const unitPrice = getEffectivePrice(product, quantity);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[var(--bg-primary)] rounded-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border-default)]">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-mono mb-1">SKU {product.sku}</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{product.name}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Imagem + info */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="aspect-[4/3] bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">{product.description}</p>
              <p className={`text-sm font-medium ${stock.className}`}>{stock.label}</p>
              {product.brand && (
                <p className="text-sm text-[var(--text-muted)]">Marca: <strong>{product.brand}</strong></p>
              )}
              {product.pdfUrl && (
                <a
                  href={product.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline text-sm inline-flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" /> Baixar ficha técnica (PDF)
                </a>
              )}
            </div>
          </div>

          {/* Especificações */}
          {product.specifications.length > 0 && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-2">Especificações</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-[var(--border-muted)] py-1.5">
                    <dt className="text-[var(--text-muted)]">{spec.key}</dt>
                    <dd className="text-[var(--text-primary)] font-medium text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Tabela de volume */}
          {product.wholesalePrice != null && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-2">Descontos por volume</h3>
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {VOLUME_TIERS.map(tier => (
                  <div
                    key={tier.minQty}
                    className={`p-2 rounded-lg border ${
                      quantity >= tier.minQty
                        ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/5 text-[var(--brand-cyan)] font-semibold"
                        : "border-[var(--border-default)] text-[var(--text-muted)]"
                    }`}
                  >
                    <p className="font-medium">{tier.minQty}+</p>
                    <p>{tier.discount}% off</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-default)] p-4 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn btn-ghost p-2 rounded-lg" aria-label="Diminuir quantidade">
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 text-center font-bold bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg py-1.5 text-[var(--text-primary)]"
              aria-label="Quantidade"
              min={1}
            />
            <button onClick={() => setQuantity(q => q + 1)} className="btn btn-ghost p-2 rounded-lg" aria-label="Aumentar quantidade">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              onAddToQuote(product, quantity);
              onClose();
            }}
            className="btn btn-primary flex-1 flex items-center justify-between px-4 py-2.5"
          >
            <span>Adicionar à cotação</span>
            <span>{formatCurrency(unitPrice * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
