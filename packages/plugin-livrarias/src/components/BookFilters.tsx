"use client";

import { Filter, X, ChevronDown, ChevronUp, Tag, Calendar, Star } from "lucide-react";
import { BookCategory, BookFormat } from "../types";
import { useState } from "react";
import { clsx } from "clsx";

interface BookFiltersProps {
  categories: BookCategory[];
  selectedCategory?: BookCategory;
  selectedFormat?: BookFormat;
  priceRange?: [number, number];
  sortBy?: string;
  onCategoryChange?: (category: BookCategory | undefined) => void;
  onFormatChange?: (format: BookFormat | undefined) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSortChange?: (sortBy: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function BookFilters({
  categories,
  selectedCategory,
  selectedFormat,
  priceRange = [0, 200],
  sortBy = "relevance",
  onCategoryChange,
  onFormatChange,
  onPriceRangeChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters = false,
}: BookFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formats: BookFormat[] = ["paperback", "hardcover", "ebook", "audiobook"];

  const sortOptions = [
    { value: "relevance", label: "Relevância" },
    { value: "price_asc", label: "Menor preço" },
    { value: "price_desc", label: "Maior preço" },
    { value: "newest", label: "Mais recentes" },
    { value: "bestselling", label: "Mais vendidos" },
    { value: "rating", label: "Melhor avaliado" },
  ];

  return (
    <div className="border border-[var(--border-default)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--text-muted)]" />
          <span className="font-medium text-[var(--text-primary)]">Filtros</span>
          {hasActiveFilters && (
            <span className="badge badge-primary text-xs">{Object.keys({
              category: selectedCategory,
              format: selectedFormat,
              price: priceRange[0] > 0 || priceRange[1] < 200,
            }).filter(Boolean).length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-[var(--brand-cyan)] hover:underline"
            >
              Limpar
            </button>
          )}
          <ChevronDown className={clsx("w-5 h-5 text-[var(--text-muted)] transition-transform", isExpanded && "rotate-180")} />
        </div>
      </button>

      {/* Filters Content */}
      <div className={clsx("overflow-hidden transition-all duration-300", isExpanded ? "max-h-96 pb-4" : "max-h-0")}>
        <div className="px-4 space-y-6 border-t border-[var(--border-default)] pt-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Categoria
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange?.(undefined)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm border transition-all",
                  !selectedCategory
                    ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                    : "bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                )}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange?.(cat)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all capitalize",
                    selectedCategory === cat
                      ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                      : "bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                  )}
                >
                  {cat.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Formato
            </label>
            <div className="flex flex-wrap gap-2">
              {formats.map(format => (
                <button
                  key={format}
                  onClick={() => onFormatChange?.(selectedFormat === format ? undefined : format)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm border transition-all capitalize",
                    selectedFormat === format
                      ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                      : "bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Faixa de Preço
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={200}
                value={priceRange[0]}
                onChange={e => onPriceRangeChange?.([Number(e.target.value), priceRange[1]])}
                className="w-24 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                placeholder="Mín"
              />
              <span className="text-[var(--text-muted)]">até</span>
              <input
                type="number"
                min={0}
                max={200}
                value={priceRange[1]}
                onChange={e => onPriceRangeChange?.([priceRange[0], Number(e.target.value)])}
                className="w-24 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                placeholder="Máx"
              />
              <span className="text-sm text-[var(--text-muted)]">R$ 0 - R$ 200</span>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort-select" className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" />
              Ordenar por
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={e => onSortChange?.(e.target.value)}
              className="w-full max-w-xs px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}