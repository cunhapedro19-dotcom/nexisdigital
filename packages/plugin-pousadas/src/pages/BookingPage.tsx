"use client";

import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, CreditCard, Shield, Clock, Calendar, Users, ArrowLeft } from "lucide-react";
import { BookingForm } from "../components/BookingForm";
import { BookingSummary } from "../components/BookingSummary";
import { formatCurrency } from "../utils/pricing";
import type { Room, PousadasConfig } from "../types";
import { useState, useEffect } from "react";

// Demo data
const ROOMS: Record<string, Room> = {
  "room-1": {
    id: "room-1",
    tenantId: "demo",
    name: "Suíte Master com Varanda",
    description: "Suíte espaçosa com varanda privativa, vista para o jardim, cama king size, banheira de hidromassagem e mini-bar.",
    capacity: 2,
    basePrice: 45000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Banheira", "Varanda", "Cofre", "Secador"],
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const DEMO_CONFIG: PousadasConfig = {
  checkInTime: "14:00",
  checkOutTime: "11:00",
  allowOnlineBooking: true,
  requireDeposit: true,
  depositPercentage: 30,
  cancellationPolicy: "moderate",
  maxAdvanceBookingDays: 365,
  minStayNights: 1,
  maxStayNights: 30,
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room") || "room-1";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");

  const room = ROOMS[roomId];
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const pricing = room && nights > 0 ? {
    base: room.basePrice * nights,
    seasonal: 0,
    discount: 0,
    taxes: Math.round(room.basePrice * nights * 0.05),
    fees: 0,
    total: Math.round(room.basePrice * nights * 1.05),
  } : null;

  const depositRequired = pricing ? Math.round(pricing.total * (DEMO_CONFIG.depositPercentage / 100)) : 0;

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular criação de reserva
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBooking = {
        id: `booking_${Date.now()}`,
        ...data,
        roomId,
        checkIn,
        checkOut,
        nights,
        adults,
        children,
        totalPrice: pricing?.total,
        depositRequired,
        status: depositRequired > 0 ? "PENDING" : "CONFIRMED",
      };

      setBookingData(newBooking);
      setStep(depositRequired > 0 ? "payment" : "success");
    } catch (err) {
      setError("Erro ao processar reserva. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (bookingData) {
      setBookingData({ ...bookingData, status: "CONFIRMED", depositPaid: depositRequired });
      setStep("success");
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Quarto não encontrado</h1>
          <a href="/pousadas" className="btn btn-primary">Voltar para busca</a>
        </div>
      </div>
    );
  }

  if (!checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Datas não informadas</h1>
          <p className="text-[var(--text-secondary)] mb-6">Por favor, selecione as datas de check-in e check-out.</p>
          <a href="/pousadas" className="btn btn-primary">Buscar disponibilidade</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {["Quarto", "Dados", step === "success" ? "Concluído" : "Pagamento"].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium
                ${i < 2 ? "bg-[var(--brand-cyan)] text-white" :
                  step === "success" ? "bg-[var(--text-success)] text-white" :
                  i === 2 ? "bg-[var(--brand-cyan)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"}
              `}>
                {step === "success" && i === 2 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : i + 1}
              </div>
              <span className="ml-2 hidden sm:block text-sm font-medium">{label}</span>
              {i < 2 && <div className={`w-16 h-0.5 mx-2 ${i < 1 ? "bg-[var(--brand-cyan)]" : "bg-[var(--brand-cyan)]"}`} />}
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-6">
            {/* Quarto selecionado */}
            <div className="card p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)]">
                  {room.images?.[0] ? (
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">🏨</div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{room.name}</h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    {new Date(checkIn).toLocaleDateString("pt-BR")} - {new Date(checkOut).toLocaleDateString("pt-BR")} • {nights} noite{nights !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[var(--brand-cyan)] font-semibold mt-2">{formatCurrency(room.basePrice)}/noite</p>
                </div>
              </div>

              {step === "form" && (
                <BookingForm
                  onSubmit={handleFormSubmit}
                  onCancel={() => window.history.back()}
                  disabled={isLoading}
                />
              )}

              {step === "payment" && bookingData && (
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Pagamento do Depósito</h3>

                  <div className="space-y-4 mb-6">
                    <p className="text-[var(--text-secondary)]">
                      Para confirmar sua reserva, é necessário pagar o depósito de <strong>{DEMO_CONFIG.depositPercentage}%</strong>.
                    </p>

                    <div className="p-4 bg-[var(--bg-secondary)] rounded-lg space-y-2">
                      <div className="flex justify-between"><span>Total da estadia</span><span>{formatCurrency(pricing!.total)}</span></div>
                      <div className="flex justify-between"><span>Depósito ({DEMO_CONFIG.depositPercentage}%)</span><span className="font-semibold text-[var(--brand-cyan)]">{formatCurrency(depositRequired)}</span></div>
                      <div className="flex justify-between border-t pt-2"><span>Restante na estadia</span><span>{formatCurrency(pricing!.total - depositRequired)}</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handlePaymentSuccess}
                      disabled={isLoading}
                      className="btn btn-primary w-full py-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pagar depósito de {formatCurrency(depositRequired)}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setStep("form")}
                      className="btn btn-ghost w-full"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para dados
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-6 pt-4 border-t border-[var(--border-default)]">
                    <Shield className="w-3 h-3" />
                    <span>Pagamento seguro com criptografia SSL • Stripe / Mercado Pago</span>
                  </div>
                </div>
              )}

              {step === "success" && bookingData && (
                <div className="card p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[var(--text-success)]/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-[var(--text-success)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Reserva Confirmada!</h2>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Sua reserva foi confirmada com sucesso. Enviamos os detalhes para <strong>{bookingData.guest?.email}</strong>.
                  </p>

                  <div className="card p-6 text-left mb-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Detalhes da reserva</h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Código</dt><dd className="font-mono font-medium">{bookingData.id.slice(-8).toUpperCase()}</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Quarto</dt><dd>{room.name}</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Check-in</dt><dd>{new Date(checkIn).toLocaleDateString("pt-BR")} às {DEMO_CONFIG.checkInTime}</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Check-out</dt><dd>{new Date(checkOut).toLocaleDateString("pt-BR")} até {DEMO_CONFIG.checkOutTime}</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Hóspedes</dt><dd>{adults + children}</dd></div>
                      <div className="flex justify-between border-t pt-3"><dt className="font-semibold text-[var(--text-primary)]">Total</dt><dd className="font-bold text-[var(--brand-cyan)]">{formatCurrency(pricing!.total)}</dd></div>
                    </dl>
                  </div>

                  <div className="flex gap-3">
                    <a href="/pousadas" className="btn btn-primary flex-1">Nova reserva</a>
                    <a href="/admin/pousadas" className="btn btn-ghost flex-1">Ver no Admin</a>
                  </div>
                </div>
              )}
            </div>
          </main>

          <aside className="lg:col-span-1">
            {(step === "form" || step === "payment") && pricing && (
              <BookingSummary
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                adults={adults}
                children={children}
                config={DEMO_CONFIG}
                pricing={pricing}
                depositRequired={depositRequired}
                className="hidden lg:block"
              />
            )}

            {step === "success" && (
              <div className="card p-6 sticky top-24">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Próximos passos</h3>
                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[var(--text-success)] shrink-0 mt-0.5" /> Confirmação enviada por email</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[var(--text-success)] shrink-0 mt-0.5" /> Depósito processado</li>
                  <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-[var(--brand-cyan)] shrink-0 mt-0.5" /> Check-in a partir das {DEMO_CONFIG.checkInTime}</li>
                  <li className="flex items-start gap-2"><Calendar className="w-4 h-4 text-[var(--brand-cyan)] shrink-0 mt-0.5" /> Leve documento com foto</li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}