"use client";

import { PousadasConfig, Room, Booking, Availability, SeasonalPricing } from "../types";

/**
 * Utilitários de precificação para o plugin Pousadas
 */

export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const inDate = typeof checkIn === "string" ? new Date(checkIn) : checkIn;
  const outDate = typeof checkOut === "string" ? new Date(checkOut) : checkOut;
  const diffTime = outDate.getTime() - inDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amountCents: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function parseCurrency(value: string): number {
  // Converte "R$ 150,00" para centavos
  const cleaned = value.replace(/[^\d,-]/g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) * 100);
}

export function getSeasonalMultiplier(
  date: Date,
  seasonalPricings: SeasonalPricing[],
  roomId?: string
): number {
  let multiplier = 1;

  for (const pricing of seasonalPricings) {
    if (!pricing.isActive) continue;
    if (date < pricing.startDate || date > pricing.endDate) continue;
    if (pricing.appliesTo && roomId && !pricing.appliesTo.includes(roomId)) continue;

    multiplier = Math.max(multiplier, pricing.priceMultiplier);
  }

  return multiplier;
}

export function calculateBookingPrice(
  room: Room,
  checkIn: Date,
  checkOut: Date,
  config: PousadasConfig,
  seasonalPricings: SeasonalPricing[] = [],
  availabilities: Availability[] = []
): {
  base: number;
  seasonal: number;
  discount: number;
  taxes: number;
  fees: number;
  total: number;
  nights: number;
  priceBreakdown: Array<{ date: string; basePrice: number; finalPrice: number; multiplier: number }>;
} {
  const nights = calculateNights(checkIn, checkOut);
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  let baseTotal = 0;
  let seasonalTotal = 0;
  const priceBreakdown: Array<{ date: string; basePrice: number; finalPrice: number; multiplier: number }> = [];

  // Calcular preço por noite
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkInDate);
    currentDate.setDate(checkInDate.getDate() + i);

    const dayStr = currentDate.toISOString().split("T")[0];
    const availability = availabilities.find(a => a.date.toISOString().split("T")[0] === dayStr && a.roomId === room.id);

    // Se está bloqueado/manutenção, não disponível
    if (availability && availability.status !== "AVAILABLE") {
      continue;
    }

    let nightPrice = room.basePrice;

    // Override de preço na disponibilidade
    if (availability?.priceOverride) {
      nightPrice = availability.priceOverride;
    }

    // Multiplicador sazonal
    const multiplier = getSeasonalMultiplier(currentDate, seasonalPricings, room.id);
    const finalPrice = Math.round(nightPrice * multiplier);
    const seasonalAmount = finalPrice - nightPrice;

    baseTotal += nightPrice;
    seasonalTotal += seasonalAmount;

    priceBreakdown.push({
      date: dayStr,
      basePrice: nightPrice,
      finalPrice,
      multiplier,
    });
  }

  // Desconto (pode vir de promoções, fidelidade, etc.)
  const discount = 0; // TODO: implementar lógica de desconto

  // Taxas (pode variar por configuração)
  const taxes = Math.round((baseTotal + seasonalTotal - discount) * 0.05); // 5% exemplo

  // Taxas de serviço/plataforma
  const fees = 0; // TODO: implementar se houver

  const total = baseTotal + seasonalTotal - discount + taxes + fees;

  return {
    base: baseTotal,
    seasonal: seasonalTotal,
    discount,
    taxes,
    fees,
    total,
    nights,
    priceBreakdown,
  };
}

export function calculateDepositAmount(totalPrice: number, config: PousadasConfig): number {
  if (!config.requireDeposit) return 0;
  return Math.round(totalPrice * (config.depositPercentage / 100));
}

export function getCancellationDeadline(
  checkIn: Date,
  policy: "flexible" | "moderate" | "strict"
): Date {
  const deadline = new Date(checkIn);

  switch (policy) {
    case "flexible":
      deadline.setDate(deadline.getDate() - 1); // 1 dia antes
      break;
    case "moderate":
      deadline.setDate(deadline.getDate() - 5); // 5 dias antes
      break;
    case "strict":
      deadline.setDate(deadline.getDate() - 14); // 14 dias antes
      break;
  }

  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

export function calculateCancellationRefund(
  totalPrice: number,
  depositPaid: number,
  policy: "flexible" | "moderate" | "strict",
  daysUntilCheckIn: number
): { refundAmount: number; refundPercentage: number; canCancel: boolean } {
  let refundPercentage = 0;
  let canCancel = true;

  switch (policy) {
    case "flexible":
      if (daysUntilCheckIn >= 1) refundPercentage = 100;
      else { refundPercentage = 0; canCancel = false; }
      break;
    case "moderate":
      if (daysUntilCheckIn >= 5) refundPercentage = 100;
      else if (daysUntilCheckIn >= 1) refundPercentage = 50;
      else { refundPercentage = 0; canCancel = false; }
      break;
    case "strict":
      if (daysUntilCheckIn >= 14) refundPercentage = 100;
      else if (daysUntilCheckIn >= 7) refundPercentage = 50;
      else { refundPercentage = 0; canCancel = false; }
      break;
  }

  const refundAmount = Math.round(totalPrice * (refundPercentage / 100));

  return { refundAmount, refundPercentage, canCancel };
}

export function isDateAvailable(
  roomId: string,
  date: Date,
  availabilities: Availability[],
  existingBookings: Booking[]
): boolean {
  const dayStr = date.toISOString().split("T")[0];

  // Verificar disponibilidade explícita
  const availability = availabilities.find(
    a => a.roomId === roomId && a.date.toISOString().split("T")[0] === dayStr
  );

  if (availability && availability.status !== "AVAILABLE") {
    return false;
  }

  // Verificar reservas existentes
  const hasBooking = existingBookings.some(booking => {
    if (booking.roomId !== roomId) return false;
    if (["CANCELLED", "NO_SHOW", "CHECKED_OUT"].includes(booking.status)) return false;

    const bookingCheckIn = new Date(booking.checkIn);
    const bookingCheckOut = new Date(booking.checkOut);

    return date >= bookingCheckIn && date < bookingCheckOut;
  });

  return !hasBooking;
}

export function getAvailableRooms(
  rooms: Room[],
  checkIn: Date,
  checkOut: Date,
  availabilities: Availability[],
  existingBookings: Booking[],
  adults: number = 1,
  children: number = 0
): Room[] {
  const totalGuests = adults + children;

  return rooms.filter(room => {
    if (!room.isActive) return false;
    if (room.capacity < totalGuests) return false;

    // Verificar todas as noites da estadia
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = calculateNights(checkIn, checkOut);

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(checkInDate.getDate() + i);

      if (!isDateAvailable(room.id, currentDate, availabilities, existingBookings)) {
        return false;
      }
    }

    return true;
  });
}