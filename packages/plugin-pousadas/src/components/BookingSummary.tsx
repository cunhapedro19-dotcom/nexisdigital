"use client";

import { Calendar, Users, Clock, CreditCard, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "../utils/pricing";
import { formatDateBR } from "../utils/date-helpers";
import type { Room, Booking, PousadasConfig } from "../types";

interface BookingSummaryProps {
  room: Room;
  booking?: Booking;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  config: PousadasConfig;
  pricing: {
    base: number;
    seasonal: number;
    discount: number;
    taxes: number;
    fees: number;
    total: number;
  };
  depositRequired: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  paymentUrl?: string;
  className?: string;
}

export function BookingSummary({
  room,
  booking,
  checkIn,
  checkOut,
  nights,
  adults,
  children,
  config,
  pricing,
  depositRequired,
  onConfirm,
  onCancel,
  isLoading = false,
  paymentUrl,
  className = "",
}: BookingSummaryProps) {
  const totalGuests = adults + children;
  const isPaid = booking?.status === "CONFIRMED" || booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT";
  const requiresPayment = depositRequired > 0 && !isPaid;

  return (
    <aside className={`${className} card sticky top-24`} aria-labelledby="summary-title">
      <header className="pb-4 border-b border-[var(--border-default)]">
        <h2 id="summary-title" className="font-semibold text-[var(--text-primary)]">Resumo da reserva</h2>
      </header>

      <div className="space-y-4 py-4">
        {/* Quarto */}
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
            {room.images?.[0] ? (
              <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                <span className="text-2xl">🏨</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[var(--text-primary)] truncate">{room.name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {totalGuests} hóspede{totalGuests !== 1 ? "s" : ""} • {room.capacity} pessoas máx.
            </p>
          </div>
        </div>

        {/* Datas */}
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <Calendar className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              {formatDateBR(checkIn)} - {formatDateBR(checkOut)}
            </p>
            <p>{nights} noite{nights !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {booking && booking.checkIn && (
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
            <div>
              <p>Check-in: após {config.checkInTime}</p>
              <p>Check-out: até {config.checkOutTime}</p>
            </div>
          </div>
        )}

        {/* Detalhamento de preços */}
        <div className="border-t border-[var(--border-default)] pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Diária base ({nights}x)</span>
            <span className="text-[var(--text-primary)]">{formatCurrency(pricing.base)}</span>
          </div>

          {pricing.seasonal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Temporada/Eventos</span>
              <span className="text-[var(--text-warning)]">+ {formatCurrency(pricing.seasonal)}</span>
            </div>
          )}

          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Descontos</span>
              <span className="text-[var(--text-success)]">- {formatCurrency(pricing.discount)}</span>
            </div>
          )}

          {pricing.taxes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Taxas e impostos</span>
              <span className="text-[var(--text-primary)]">{formatCurrency(pricing.taxes)}</span>
            </div>
          )}

          {pricing.fees > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Taxas de serviço</span>
              <span className="text-[var(--text-primary)]">{formatCurrency(pricing.fees)}</span>
            </div>
          )}

          <div className="border-t border-[var(--border-default)] pt-2 flex justify-between">
            <span className="font-semibold text-[var(--text-primary)]">Total</span>
            <span className="font-bold text-lg text-[var(--brand-cyan)]">{formatCurrency(pricing.total)}</span>
          </div>
        </div>

        {/* Depósito */}
        {requiresPayment && (
          <div className="p-3 bg-[var(--brand-amber)]/10 border border-[var(--brand-amber)]/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-[var(--brand-amber)]" />
              <span className="font-medium text-[var(--text-primary)]">Depósito necessário</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Esta reserva requer um depósito de <strong>{config.depositPercentage}%</strong> ({formatCurrency(depositRequired)})
              para ser confirmada. O valor será descontado do total na estadia.
            </p>
            <div className="flex justify-between text-sm font-medium">
              <span>Depósito agora</span>
              <span className="text-[var(--brand-cyan)]">{formatCurrency(depositRequired)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>Restante na estadia</span>
              <span>{formatCurrency(pricing.total - depositRequired)}</span>
            </div>
          </div>
        )}

        {/* Política de cancelamento */}
        <div className="p-3 bg-[var(--bg-secondary)] rounded-lg space-y-1 text-sm">
          <p className="font-medium text-[var(--text-primary)]">Política de cancelamento: {config.cancellationPolicy}</p>
          {config.cancellationPolicy === "flexible" && (
            <p className="text-[var(--text-secondary)]">Cancelamento grátis até 1 dia antes do check-in.</p>
          )}
          {config.cancellationPolicy === "moderate" && (
            <p className="text-[var(--text-secondary)]">Cancelamento grátis até 5 dias antes. Após isso, 50% de reembolso.</p>
          )}
          {config.cancellationPolicy === "strict" && (
            <p className="text-[var(--text-secondary)]">Cancelamento grátis até 14 dias antes. Após isso, 50% até 7 dias, sem reembolso depois.</p>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-2 border-t border-[var(--border-default)]">
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn btn-ghost flex-1"
              disabled={isLoading}
            >
              Voltar
            </button>
          )}

          {requiresPayment && paymentUrl ? (
            <a
              href={paymentUrl}
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pagar depósito
            </a>
          ) : onConfirm ? (
            <button
              onClick={onConfirm}
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span> Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar reserva
                </>
              )}
            </button>
          ) : null}
        </div>

        {/* Segurança */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Shield className="w-3 h-3" />
          <span>Pagamento seguro com criptografia SSL</span>
        </div>
      </div>
    </aside>
  );
}