"use client";

import { z } from "zod";

/**
 * Tipos do plugin Pousadas
 */

// =========================================================
// Configuração do Plugin
// =========================================================

export const pousadasConfigSchema = z.object({
  checkInTime: z.string().default("14:00"),
  checkOutTime: z.string().default("11:00"),
  allowOnlineBooking: z.boolean().default(true),
  requireDeposit: z.boolean().default(false),
  depositPercentage: z.number().min(0).max(100).default(30),
  cancellationPolicy: z.enum(["flexible", "moderate", "strict"]).default("moderate"),
  maxAdvanceBookingDays: z.number().default(365),
  minStayNights: z.number().default(1),
  maxStayNights: z.number().default(30),
});

export type PousadasConfig = z.infer<typeof pousadasConfigSchema>;

// =========================================================
// Quartos (Rooms)
// =========================================================

export const roomSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  capacity: z.number().int().min(1).max(20),
  basePrice: z.number().int().min(0), // em centavos
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Room = z.infer<typeof roomSchema>;
export type RoomInput = Omit<Room, "id" | "tenantId" | "createdAt" | "updatedAt">;

// =========================================================
// Hóspedes (Guests)
// =========================================================

export const guestSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  document: z.string().optional(), // CPF/Passport
  nationality: z.string().optional(),
  birthDate: z.date().optional(),
  notes: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Guest = z.infer<typeof guestSchema>;
export type GuestInput = Omit<Guest, "id" | "tenantId" | "createdAt" | "updatedAt">;

// =========================================================
// Reservas (Bookings)
// =========================================================

export const bookingStatusSchema = z.enum([
  "PENDING",      // Aguardando confirmação/pagamento
  "CONFIRMED",    // Confirmada
  "CHECKED_IN",   // Check-in realizado
  "CHECKED_OUT",  // Check-out realizado
  "CANCELLED",    // Cancelada
  "NO_SHOW",      // Não compareceu
]);

export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const bookingSourceSchema = z.enum([
  "DIRECT",       // Site próprio
  "PHONE",        // Telefone
  "EMAIL",        // Email
  "WALK_IN",      // Presencial
  "OTA_BOOKING",  // Booking.com
  "OTA_AIRBNB",   // Airbnb
  "OTA_EXPEDIA",  // Expedia
  "OTA_OTHER",    // Outro OTA
]);

export type BookingSource = z.infer<typeof bookingSourceSchema>;

export const bookingSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  roomId: z.string().cuid(),
  guestId: z.string().cuid(),
  checkIn: z.date(),
  checkOut: z.date(),
  nights: z.number().int().min(1),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  status: bookingStatusSchema.default("PENDING"),
  source: bookingSourceSchema.default("DIRECT"),
  basePrice: z.number().int().min(0), // total em centavos
  discount: z.number().int().min(0).default(0),
  taxes: z.number().int().min(0).default(0),
  fees: z.number().int().min(0).default(0),
  totalPrice: z.number().int().min(0),
  depositPaid: z.number().int().min(0).default(0),
  depositRequired: z.number().int().min(0).default(0),
  cancellationPolicy: z.enum(["flexible", "moderate", "strict"]).default("moderate"),
  cancelledAt: z.date().nullable().optional(),
  cancellationReason: z.string().optional(),
  specialRequests: z.string().optional(),
  internalNotes: z.string().optional(),
  externalReference: z.string().optional(), // ID do OTA
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Booking = z.infer<typeof bookingSchema>;
export type BookingInput = Omit<Booking, "id" | "tenantId" | "createdAt" | "updatedAt">;

// =========================================================
// Disponibilidade (Availability)
// =========================================================

export const availabilitySchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  roomId: z.string().cuid(),
  date: z.date(),
  status: z.enum(["AVAILABLE", "BLOCKED", "MAINTENANCE", "RESERVED"]).default("AVAILABLE"),
  priceOverride: z.number().int().min(0).optional(), // em centavos, opcional
  minStay: z.number().int().min(1).optional(),
  maxStay: z.number().int().min(1).optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Availability = z.infer<typeof availabilitySchema>;
export type AvailabilityInput = Omit<Availability, "id" | "tenantId" | "createdAt" | "updatedAt">;

// =========================================================
// Pagamentos (Payments) - para depósitos
// =========================================================

export const paymentSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  bookingId: z.string().cuid(),
  amount: z.number().int().min(0), // em centavos
  currency: z.string().default("BRL"),
  method: z.enum(["STRIPE", "MERCADO_PAGO", "PIX", "CASH", "CARD", "BANK_TRANSFER"]),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED", "PARTIAL_REFUND"]).default("PENDING"),
  providerPaymentId: z.string().optional(),
  providerData: z.record(z.unknown()).optional(),
  refundedAmount: z.number().int().min(0).default(0),
  refundedAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentInput = Omit<Payment, "id" | "tenantId" | "createdAt" | "updatedAt">;

// =========================================================
// Preços Sazonais (Seasonal Pricing)
// =========================================================

export const seasonalPricingSchema = z.object({
  id: z.string().cuid().optional(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  priceMultiplier: z.number().min(0.1).max(10).default(1), // ex: 1.5 = 50% a mais
  appliesTo: z.array(z.string().cuid()).optional(), // roomIds, vazio = todos
  minStay: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SeasonalPricing = z.infer<typeof seasonalPricingSchema>;
export type SeasonalPricingInput = Omit<SeasonalPricing, "id" | "tenantId" | "createdAt" | "updatedAt">;

// =========================================================
// Tipos para API
// =========================================================

export interface AvailabilityQuery {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults?: number;
  children?: number;
}

export interface AvailabilityResult {
  roomId: string;
  roomName: string;
  capacity: number;
  basePrice: number;
  images: string[];
  amenities: string[];
  available: boolean;
  totalPrice: number;
  nights: number;
  priceBreakdown: {
    base: number;
    discount: number;
    taxes: number;
    fees: number;
    seasonal?: number;
  };
}

export interface BookingCreateInput {
  roomId: string;
  guest: GuestInput;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests?: string;
  source?: BookingSource;
}

export interface BookingResponse {
  booking: Booking;
  paymentUrl?: string; // URL para pagamento de depósito
  requiresPayment: boolean;
}

// =========================================================
// Tipos para Admin
// =========================================================

export interface DashboardStats {
  totalRooms: number;
  activeRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingBookings: number;
  upcomingBookings: number;
}

export interface OccupancyData {
  date: string;
  occupied: number;
  available: number;
  blocked: number;
  maintenance: number;
  revenue: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
  avgDailyRate: number;
  occupancyRate: number;
}

// =========================================================
// Webhook Payloads
// =========================================================

export const webhookBookingCreatedSchema = z.object({
  bookingId: z.string().cuid(),
  tenantId: z.string().cuid(),
  roomId: z.string().cuid(),
  guestId: z.string().cuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  totalPrice: z.number(),
  source: bookingSourceSchema,
});

export const webhookBookingConfirmedSchema = z.object({
  bookingId: z.string().cuid(),
  tenantId: z.string().cuid(),
});

export const webhookBookingCancelledSchema = z.object({
  bookingId: z.string().cuid(),
  tenantId: z.string().cuid(),
  reason: z.string().optional(),
});

export const webhookBookingCheckedInSchema = z.object({
  bookingId: z.string().cuid(),
  tenantId: z.string().cuid(),
});

export const webhookBookingCheckedOutSchema = z.object({
  bookingId: z.string().cuid(),
  tenantId: z.string().cuid(),
});

export const webhookAvailabilityUpdatedSchema = z.object({
  roomId: z.string().cuid(),
  tenantId: z.string().cuid(),
  date: z.string(),
  status: z.enum(["AVAILABLE", "BLOCKED", "MAINTENANCE", "RESERVED"]),
});

export type WebhookBookingCreated = z.infer<typeof webhookBookingCreatedSchema>;
export type WebhookBookingConfirmed = z.infer<typeof webhookBookingConfirmedSchema>;
export type WebhookBookingCancelled = z.infer<typeof webhookBookingCancelledSchema>;
export type WebhookBookingCheckedIn = z.infer<typeof webhookBookingCheckedInSchema>;
export type WebhookBookingCheckedOut = z.infer<typeof webhookBookingCheckedOutSchema>;
export type WebhookAvailabilityUpdated = z.infer<typeof webhookAvailabilityUpdatedSchema>;