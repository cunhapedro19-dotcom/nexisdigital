"use client";

import { Tag, Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface Coupon {
  code: string;
  name: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
}

interface CouponInputProps {
  value?: string;
  onApply: (code: string) => Promise<Coupon | null>;
  onRemove: () => void;
  appliedCoupon?: Coupon | null;
  isLoading?: boolean;
}

export function CouponInput({ value = "", onApply, onRemove, appliedCoupon, isLoading = false }: CouponInputProps) {
  const [code, setCode] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    try {
      const coupon = await onApply(code.trim());
      if (!coupon) {
        setError("Cupom inválido ou expirado");
      }
    } catch {
      setError("Erro ao aplicar cupom");
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center gap-3 p-3 bg-[var(--text-success)]/10 border border-[var(--text-success)]/20 rounded-lg">
        <Tag className="w-5 h-5 text-[var(--text-success)]" />
        <div className="flex-1">
          <p className="font-medium text-[var(--text-success)]">Cupom aplicado: {appliedCoupon.code}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {appliedCoupon.type === "percentage" ? `${appliedCoupon.value}% de desconto` :
             appliedCoupon.type === "fixed" ? `${formatCurrency(appliedCoupon.value)} de desconto` :
             "Frete grátis"}
          </p>
        </div>
        <button onClick={onRemove} className="btn btn-ghost btn-sm text-[var(--text-danger)] hover:bg-[var(--text-danger)]/10">
          Remover
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value); setError(null); }}
          placeholder="Cupom de desconto"
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)] disabled:opacity-50"
        />
        {error && (
          <div className="absolute -bottom-6 left-0 right-0 text-xs text-[var(--text-danger)]">{error}</div>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="btn btn-outline whitespace-nowrap disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
      </button>
    </form>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}