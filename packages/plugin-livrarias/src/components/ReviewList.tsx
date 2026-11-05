"use client";

import { Star, User, Calendar, ThumbsUp, ThumbsDown, Flag } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
}

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onHelpful?: (reviewId: string, helpful: boolean) => void;
  onReport?: (reviewId: string) => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  onHelpful,
  onReport,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ReviewListProps) {
  const getStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push(<Star key={i} className="w-4 h-4 fill-[var(--brand-amber)] text-[var(--brand-amber)]" />);
      else if (i - 0.5 <= rating) stars.push(<Star key={i} className="w-4 h-4 fill-[var(--brand-amber)]/50 text-[var(--brand-amber)]/50" />);
      else stars.push(<Star key={i} className="w-4 h-4 text-[var(--text-muted)]" />);
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex items-center gap-4 text-center sm:text-left flex-1">
            <div className="text-5xl font-bold text-[var(--brand-amber)]">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              {getStars(Math.round(averageRating))}
            </div>
            <div className="text-sm text-[var(--text-muted)]">{totalReviews} avaliações</div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-muted)] w-8">{star}★</span>
                <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded overflow-hidden">
                  <div className="h-full bg-[var(--brand-amber)]" style={{ width: `${Math.max(0, (totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0))}%` }} />
                </div>
                <span className="text-sm text-[var(--text-muted)] w-10 text-right">{(totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="card p-8 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Nenhuma avaliação ainda</h3>
            <p className="text-[var(--text-muted)]">Seja o primeiro a avaliar este produto</p>
          </div>
        ) : (
          reviews.map(review => (
            <article key={review.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand-cyan)]/10 flex items-center justify-center text-[var(--brand-cyan)] font-medium flex-shrink-0">
                  {review.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[var(--text-primary)]">{review.customerName}</span>
                    {review.isVerifiedPurchase && (
                      <span className="badge badge-success text-xs">Compra verificada</span>
                    )}
                    <span className="text-sm text-[var(--text-muted)]">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {getStars(review.rating)}
                    <span className="text-sm font-medium text-[var(--text-primary)] ml-1">{review.rating.toFixed(1)}</span>
                  </div>
                  {review.title && <h4 className="font-medium text-[var(--text-primary)] mb-1">{review.title}</h4>}
                  {review.comment && <p className="text-[var(--text-secondary)]">{review.comment}</p>}
                  <div className="flex items-center gap-4 mt-3">
                    <button onClick={() => onHelpful?.(review.id, true)} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-success)]">
                      <ThumbsUp className="w-4 h-4" /> Útil ({review.helpfulCount})
                    </button>
                    <button onClick={() => onHelpful?.(review.id, false)} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-danger)]">
                      <ThumbsDown className="w-4 h-4" /> Não útil
                    </button>
                    <button onClick={() => onReport?.(review.id)} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-warning)]">
                      <Flag className="w-4 h-4" /> Denunciar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}

        {showPagination && totalPages > 1 && (
          <nav className="flex items-center justify-center gap-1" aria-label="Paginação de avaliações">
            <button onClick={() => onPageChange?.(1)} disabled={currentPage <= 1} className="btn btn-ghost px-3" aria-label="Primeira página">«</button>
            <button onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1} className="btn btn-ghost px-3" aria-label="Página anterior">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button key={pageNum} onClick={() => onPageChange?.(pageNum)} className={`btn w-10 ${currentPage === pageNum ? "btn-primary" : "btn-ghost"}`} aria-label={`Página ${pageNum}`} aria-current={currentPage === pageNum ? "page" : undefined}>{pageNum}</button>
              );
            })}
            <button onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages} className="btn btn-ghost px-3" aria-label="Próxima página">›</button>
            <button onClick={() => onPageChange?.(totalPages)} disabled={currentPage >= totalPages} className="btn btn-ghost px-3" aria-label="Última página">»</button>
          </nav>
        )}
      </div>
    </div>
  );
}