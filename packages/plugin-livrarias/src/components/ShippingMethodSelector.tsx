"use client";

import { Truck, Calendar, MapPin } from "lucide-react";

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  type: "flat_rate" | "free" | "calculated" | "pickup";
}

interface ShippingMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  methods: ShippingMethod[];
  formatCurrency: (value: number) => string;
}

export function ShippingMethodSelector({ value, onChange, methods, formatCurrency }: ShippingMethodSelectorProps) {
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
            name="shippingMethod"
            value={method.id}
            checked={value === method.id}
            onChange={e => onChange(e.target.value)}
            className="w-4 h-4 text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-[var(--text-primary)]">{method.name}</p>
              {method.type === "pickup" && <MapPin className="w-4 h-4 text-[var(--brand-cyan)]" />}
              {method.type === "free" && <span className="badge badge-success text-xs">Grátis</span>}
            </div>
            {method.description && <p className="text-sm text-[var(--text-muted)]">{method.description}</p>}
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {method.estimatedDaysMin === method.estimatedDaysMax
                ? `${method.estimatedDaysMin} dia${method.estimatedDaysMin !== 1 ? "s" : ""} útil${method.estimatedDaysMin !== 1 ? "is" : ""}`
                : `${method.estimatedDaysMin}-${method.estimatedDaysMax} dias úteis`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[var(--text-primary)]">{formatCurrency(method.price)}</p>
          </div>
        </label>
      ))}
    </div>
  );
}