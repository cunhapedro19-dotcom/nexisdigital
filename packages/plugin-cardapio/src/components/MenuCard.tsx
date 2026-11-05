"use client";

import type { MenuItem } from "../types";
import { formatCurrency, getSpicyLabel } from "../utils/helpers";
import { Plus, Flame, Leaf, Wheat, Clock } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onShowDetails?: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart, onShowDetails }: MenuCardProps) {
  const hasPromo = item.promotionalPrice != null && item.promotionalPrice < item.price;
  const price = hasPromo ? item.promotionalPrice! : item.price;
  const isUnavailable = item.status === "UNAVAILABLE";

  return (
    <article
      className="card flex flex-col overflow-hidden group transition-all hover:border-[var(--brand-cyan)]/50"
      aria-label={item.name}
    >
      {/* Imagem */}
      {item.image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasPromo && (
            <span className="absolute top-2 left-2 badge badge-danger">
              Promoção
            </span>
          )}
          {isUnavailable && (
            <div className="absolute inset-0 bg-[var(--bg-primary)]/80 flex items-center justify-center">
              <span className="badge badge-danger">Indisponível</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col">
        {/* Badges dietéticos */}
        <div className="flex flex-wrap gap-1 mb-2">
          {item.isVegetarian && (
            <span className="badge badge-success text-xs flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Vegetariano
            </span>
          )}
          {item.isVegan && (
            <span className="badge badge-success text-xs">Vegano</span>
          )}
          {item.isGlutenFree && (
            <span className="badge badge-outline text-xs flex items-center gap-1">
              <Wheat className="w-3 h-3" /> Sem glúten
            </span>
          )}
          {getSpicyLabel(item.spicyLevel) && (
            <span className="badge badge-warning text-xs">{getSpicyLabel(item.spicyLevel)}</span>
          )}
        </div>

        {/* Nome e descrição */}
        <h3 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--brand-cyan)] transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 flex-1">
          {item.shortDescription || item.description}
        </p>

        {/* Tempo de preparo */}
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>~{item.preparationTime} min</span>
        </div>

        {/* Preço e botão */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            {hasPromo && (
              <span className="text-xs text-[var(--text-muted)] line-through block">
                {formatCurrency(item.price)}
              </span>
            )}
            <span className="text-lg font-bold text-[var(--brand-cyan)]">
              {formatCurrency(price)}
            </span>
          </div>
          <button
            onClick={() => !isUnavailable && onAddToCart(item)}
            disabled={isUnavailable}
            className="btn btn-primary p-2.5 rounded-full"
            aria-label={`Adicionar ${item.name} ao pedido`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Detalhes */}
      {onShowDetails && (
        <button
          onClick={() => onShowDetails(item)}
          className="text-sm text-[var(--brand-cyan)] hover:underline py-2 border-t border-[var(--border-muted)]"
        >
          Ver detalhes
        </button>
      )}
    </article>
  );
}