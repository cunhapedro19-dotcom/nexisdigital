"use client";

import { Star, Send, X } from "lucide-react";
import { useState } from "react";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; title: string; comment: string }) => void;
  onCancel?: () => void;
  initialRating?: number;
  initialTitle?: string;
  initialComment?: string;
  isLoading?: boolean;
  requirePurchase?: boolean;
}

export function ReviewForm({
  onSubmit,
  onCancel,
  initialRating = 0,
  initialTitle = "",
  initialComment = "",
  isLoading = false,
  requirePurchase = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(initialTitle);
  const [comment, setComment] = useState(initialComment);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, title, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Escreva sua avaliação</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost p-2"><X className="w-4 h-4" /></button>
        )}
      </div>

      {requirePurchase && (
        <div className="p-3 bg-[var(--brand-amber)]/10 border border-[var(--brand-amber)]/20 rounded-lg text-sm text-[var(--text-warning)]">
          Apenas clientes que compraram este produto podem avaliar.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Sua nota</label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Avaliação de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} estrela${star !== 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 text-3xl transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "fill-[var(--brand-amber)] text-[var(--brand-amber)]"
                    : "text-[var(--text-muted)]"
                }`}
              />
            </button>
          ))}
        </div>
        {rating === 0 && <p className="text-xs text-[var(--text-danger)] mt-1">Selecione uma nota</p>}
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Título (opcional)</label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Resuma sua experiência"
          className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Comentário</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Conte sua experiência com o produto..."
          rows={4}
          className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)] resize-y"
          maxLength={2000}
        />
        <p className="text-xs text-[var(--text-muted)] mt-1">{comment.length}/2000 caracteres</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={rating === 0 || isLoading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {isLoading ? "Enviando..." : "Enviar Avaliação"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">Cancelar</button>
        )}
      </div>
    </form>
  );
}