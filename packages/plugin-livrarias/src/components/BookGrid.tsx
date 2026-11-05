"use client";

import { Book } from "../types";
import { BookCard } from "./BookCard";
import { ChevronLeft, ChevronRight, Filter, Grid, List } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface BookGridProps {
  books: Book[];
  onAddToCart?: (book: Book, format: string) => void;
  variant?: "default" | "featured";
  showFilters?: boolean;
  filters?: {
    categories?: string[];
    formats?: string[];
    priceRange?: [number, number];
    sortBy?: string;
  };
  onFilterChange?: (filters: any) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;
  emptyMessage?: string;
}

export function BookGrid({
  books,
  onAddToCart,
  variant = "default",
  showFilters = false,
  filters,
  onFilterChange,
  pagination,
  isLoading = false,
  emptyMessage = "Nenhum livro encontrado",
}: BookGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-[var(--bg-tertiary)] rounded-xl mb-4" />
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2 mb-3" />
            <div className="h-6 bg-[var(--bg-tertiary)] rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{emptyMessage}</h3>
        <p className="text-[var(--text-muted)]">Tente ajustar seus filtros ou buscar por outro termo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      {(showFilters || pagination) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {showFilters && (
            <div className="flex items-center gap-3 flex-wrap">
              <button className="btn btn-ghost gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
              <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1" role="group" aria-label="Modo de visualização">
                <button
                  onClick={() => setViewMode("grid")}
                  className={clsx("p-2 rounded transition-colors", viewMode === "grid" ? "bg-[var(--brand-cyan)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
                  aria-label="Visualização em grade"
                  aria-pressed={viewMode === "grid"}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={clsx("p-2 rounded transition-colors", viewMode === "list" ? "bg-[var(--brand-cyan)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
                  aria-label="Visualização em lista"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {pagination && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn btn-ghost p-2"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn btn-ghost p-2"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid/List */}
      <div
        className={clsx(
          "gap-6",
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-3"
        )}
        role="list"
        aria-label="Lista de livros"
      >
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            variant={viewMode === "list" ? "compact" : variant}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Pagination bottom */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1" aria-label="Paginação">
          <button
            onClick={() => pagination.onPageChange(1)}
            disabled={pagination.page <= 1}
            className="btn btn-ghost px-3"
            aria-label="Primeira página"
          >
            «
          </button>
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn btn-ghost px-3"
            aria-label="Página anterior"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum: number;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => pagination.onPageChange(pageNum)}
                className={clsx(
                  "btn w-10",
                  pagination.page === pageNum
                    ? "btn-primary"
                    : "btn-ghost"
                )}
                aria-label={`Página ${pageNum}`}
                aria-current={pagination.page === pageNum ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-ghost px-3"
            aria-label="Próxima página"
          >
            ›
          </button>
          <button
            onClick={() => pagination.onPageChange(pagination.totalPages)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-ghost px-3"
            aria-label="Última página"
          >
            »
          </button>
        </nav>
      )}
    </div>
  );
}