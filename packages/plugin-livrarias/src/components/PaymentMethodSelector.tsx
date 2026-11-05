"use client";

import { CreditCard, Smartphone, FileText, Check } from "lucide-react";

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  methods?: Array<{ id: string; label: string; icon: React.ReactNode; description?: string }>;
}

export function PaymentMethodSelector({
  value,
  onChange,
  methods = [
    { id: "credit_card", label: "Cartão de Crédito", icon: <CreditCard className="w-5 h-5" />, description: "Visa, Mastercard, Elo, Amex" },
    { id: "pix", label: "PIX", icon: <Smartphone className="w-5 h-5" />, description: "Pagamento instantâneo" },
    { id: "boleto", label: "Boleto Bancário", icon: <FileText className="w-5 h-5" />, description: "Vencimento em 3 dias úteis" },
  ],
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      {methods.map(method => (
        <label
          key={method.id}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            value === method.id
              ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/5"
              : "border-[var(--border-default)] hover:border-[var(--brand-cyan)]/50"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={method.id}
            checked={value === method.id}
            onChange={e => onChange(e.target.value)}
            className="w-4 h-4 text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]"
          />
          <div className="flex-shrink-0 text-[var(--brand-cyan)]">{method.icon}</div>
          <div className="flex-1">
            <p className="font-medium text-[var(--text-primary)]">{method.label}</p>
            {method.description && <p className="text-sm text-[var(--text-muted)]">{method.description}</p>}
          </div>
          {value === method.id && <Check className="w-5 h-5 text-[var(--brand-cyan)]" />}
        </label>
      ))}
    </div>
  );
}