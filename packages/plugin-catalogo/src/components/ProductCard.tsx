"use client";

import type { Product, CatalogSettings } from "../types";
import { formatCurrency, getStockDisplay, shouldShowPrices } from "../utils/helpers";
import { FileDown, Eye, Plus, Tag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  settings: CatalogSettings;
  onAddToQuote: (product: Product) => void;
  onShowDetails?: (product: Product) => void;
}

export function ProductCard({ product, settings, onAddToQuote, onShowDetails }: ProductCardProps) {
  const stock = getStockDisplay(product);
  const showPrices = shouldShowPrices(settings);

  return (
    <article className="card flex flex-col overflow-hidden group hover:border-[var(--brand-cyan)]/50 transition-all" aria-label={product.name}>
      {/* Imagem */}
      <div className="relative aspect-[4/3] bg-[var(--bg-secondary)] overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--text-muted)]">📦</div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 left-2 badge badge-warning text-xs">Destaque</span>
        )}
        {product.pdfUrl && (
          <span className="absolute top-2 right-2 badge badge-outline text-xs flex items-center gap-1 bg-[var(--bg-primary)]/80">
            <FileDown className="w-3 h-3" /> PDF
          </span>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {/* Categoria / marca */}
        <p className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {product.brand ? `${product.brand} • ` : ""}{product.category}
        </p>

        <h3 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--brand-cyan)] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 flex-1">
          {product.shortDescription || product.description}
        </p>

        {/* SKU + estoque */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
          <span className="font-mono">SKU {product.sku}</span>
          <span className={stock.className}>{stock.label}</span>
        </div>

        {/* Preço */}
        {showPrices && (
          <div className="mb-3">
            <span className="text-lg font-bold text-[var(--brand-cyan)]">
              {formatCurrency(product.price, settings.currency)}
            </span>
            <span className="text-xs text-[var(--text-muted)] ml-1">/ {product.unit}</span>
            {product.wholesalePrice != null && (
              <p className="text-xs text-[var(--text-success)]">
                Atacado: {formatCurrency(product.wholesalePrice, settings.currency)} (a partir de {product.minOrderQty * 10} un.)
              </p>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onAddToQuote(product)}
            className="btn btn-primary flex-1 text-sm"
            aria-label={`Adicionar ${product.name} à cotação`}
          >
            <Plus className="w-4 h-4 mr-1" />
            {settings.quoteMode === "required" ? "Orçar" : "Adicionar"}
          </button>
          {onShowDetails && (
            <button
              onClick={() => onShowDetails(product)}
              className="btn btn-ghost p-2.5"
              aria-label={`Ver detalhes de ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
