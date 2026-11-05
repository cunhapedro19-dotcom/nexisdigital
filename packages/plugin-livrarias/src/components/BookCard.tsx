"use client";

import { Book } from "../types";
import { formatCurrency as fmtCurrency } from "../utils/formatters";
import { ShoppingCart, Star, Tag, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

interface BookCardProps {
  book: Book;
  variant?: "default" | "compact" | "featured";
  onAddToCart?: (book: Book, format: string) => void;
  showAddToCart?: boolean;
  selectedFormat?: string;
  formats?: string[];
}

export function BookCard({
  book,
  variant = "default",
  onAddToCart,
  showAddToCart = true,
  selectedFormat = "paperback",
  formats = ["paperback", "hardcover", "ebook"],
}: BookCardProps) {
  const discount = book.compareAtPrice && book.compareAtPrice > book.price
    ? Math.round(((book.compareAtPrice - book.price) / book.compareAtPrice) * 100)
    : 0;

  const isLowStock = book.stockQuantity - book.reservedQuantity > 0 && book.stockQuantity - book.reservedQuantity <= book.lowStockThreshold;
  const isOutOfStock = book.stockQuantity - book.reservedQuantity <= 0 && !book.allowBackorder;

  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(book, selectedFormat);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
        {book.coverImage && (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-16 h-24 object-cover rounded"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--text-primary)] truncate">{book.title}</h4>
          <p className="text-sm text-[var(--text-muted)] truncate">{book.author}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-[var(--brand-cyan)]">{fmtCurrency(book.price)}</span>
            {book.compareAtPrice && book.compareAtPrice > book.price && (
              <span className="text-sm text-[var(--text-muted)] line-through">{fmtCurrency(book.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className={clsx(
      "group flex flex-col bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] overflow-hidden",
      "transition-all duration-200 hover:border-[var(--brand-cyan)]/50 hover:shadow-lg",
      variant === "featured" && "lg:flex-row"
    )}>
      <div className="relative aspect-[2/3] lg:aspect-auto lg:w-48 flex-shrink-0 overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--brand-cyan)]/10 to-[var(--brand-amber)]/10 flex items-center justify-center">
            <span className="text-6xl">📖</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {book.isNewRelease && (
            <span className="badge badge-primary text-xs px-2 py-1">Lançamento</span>
          )}
          {book.isBestseller && (
            <span className="badge badge-amber text-xs px-2 py-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Mais Vendido
            </span>
          )}
          {book.isFeatured && (
            <span className="badge badge-outline text-xs px-2 py-1">Destaque</span>
          )}
          {discount > 0 && (
            <span className="badge badge-danger text-xs px-2 py-1">-{discount}%</span>
          )}
        </div>

        {/* Stock indicator */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 right-2 bg-[var(--text-warning)]/90 text-[var(--bg-primary)] text-xs font-medium px-2 py-1 rounded text-center">
            Poucas unidades!
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[var(--bg-primary)]/80 flex items-center justify-center">
            <span className="text-[var(--text-danger)] font-medium px-4 py-2 bg-[var(--bg-primary)] rounded-lg">
              Fora de estoque
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col min-w-0">
        {/* Category */}
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">
          {book.category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-[var(--text-primary)] line-clamp-2 mb-1 group-hover:text-[var(--brand-cyan)] transition-colors">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-1">por {book.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[var(--brand-amber)] text-[var(--brand-amber)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">4.5</span>
            <span className="text-xs text-[var(--text-muted)]">(128)</span>
          </div>
          {book.format !== "ebook" && (
            <Tag className="w-4 h-4 text-[var(--text-muted)]" title={book.format} />
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-[var(--brand-cyan)]">{fmtCurrency(book.price)}</span>
          {book.compareAtPrice && book.compareAtPrice > book.price && (
            <span className="text-sm text-[var(--text-muted)] line-through">{fmtCurrency(book.compareAtPrice)}</span>
          )}
        </div>

        {/* Formats */}
        {formats.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs text-[var(--text-muted)] mb-1">Formato:</label>
            <div className="flex gap-1" role="radiogroup">
              {formats.map(format => (
                <button
                  key={format}
                  type="button"
                  role="radio"
                  aria-checked={selectedFormat === format}
                  className={clsx(
                    "px-2 py-1 text-xs rounded border transition-colors",
                    selectedFormat === format
                      ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                      : "bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                  )}
                  onClick={() => {}}
                >
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={clsx(
              "w-full py-2.5 px-4 rounded-lg font-medium transition-all",
              "flex items-center justify-center gap-2",
              isOutOfStock
                ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--brand-cyan)] text-white hover:bg-[var(--brand-cyan)]/90 focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
            )}
            aria-label={isOutOfStock ? `${book.title} está fora de estoque` : `Adicionar ${book.title} ao carrinho`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? "Indisponível" : "Adicionar ao Carrinho"}
          </button>
        )}
      </div>
    </article>
  );
}