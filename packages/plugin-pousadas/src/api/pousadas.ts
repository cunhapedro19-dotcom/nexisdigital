"use server";

import { z } from "zod";
import { getPluginRegistryServer } from "@nexis/plugin/registry";
import { getServerEventBus } from "@nexis/core/events";
import { withTenant } from "@nexis/db/client";
import type { Room, Booking, Availability, Guest, PousadasConfig, SeasonalPricing } from "../types";
import { pousadasConfigSchema } from "../types";

/**
 * API Routes para o plugin Pousadas
 * Em produção, estas seriam route handlers do Next.js (app/api/pousadas/*)
 */

// =========================================================
// Schemas de validação
// =========================================================

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  capacity: z.number().int().min(1).max(20),
  basePrice: z.number().int().min(0),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const updateRoomSchema = createRoomSchema.partial();

const createBookingSchema = z.object({
  roomId: z.string().cuid(),
  guest: z.object({
    fullName: z.string().min(1).max(200),
    email: z.string().email(),
    phone: z.string().min(10),
    document: z.string().optional(),
    nationality: z.string().optional(),
    birthDate: z.string().optional(),
    notes: z.string().optional(),
    marketingConsent: z.boolean().default(false),
  }),
  checkIn: z.string(), // YYYY-MM-DD
  checkOut: z.string(), // YYYY-MM-DD
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  specialRequests: z.string().optional(),
  source: z.enum(["DIRECT", "PHONE", "EMAIL", "WALK_IN", "OTA_BOOKING", "OTA_AIRBNB", "OTA_EXPEDIA", "OTA_OTHER"]).default("DIRECT"),
});

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"]).optional(),
  specialRequests: z.string().optional(),
  internalNotes: z.string().optional(),
});

const availabilityQuerySchema = z.object({
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
});

const createAvailabilitySchema = z.object({
  roomId: z.string().cuid(),
  date: z.string(), // YYYY-MM-DD
  status: z.enum(["AVAILABLE", "BLOCKED", "MAINTENANCE", "RESERVED"]).default("AVAILABLE"),
  priceOverride: z.number().int().min(0).optional(),
  minStay: z.number().int().min(1).optional(),
  maxStay: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

const seasonalPricingSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.string(),
  endDate: z.string(),
  priceMultiplier: z.number().min(0.1).max(10),
  appliesTo: z.array(z.string().cuid()).optional(),
  minStay: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
});

// =========================================================
// Plugin Instance
// =========================================================

let pluginInstance: any = null;

export async function getPousadasPlugin(tenantId: string) {
  if (!pluginInstance) {
    const registry = getPluginRegistryServer();
    const eventBus = getServerEventBus();
    const tenantPrisma = withTenant(null as any, tenantId); // Em produção: prisma real

    const context = {
      tenantId,
      prisma: tenantPrisma,
      config: {},
      eventEmitter: eventBus,
      storage: {
        upload: async () => { throw new Error("Storage não implementado"); },
        delete: async () => { throw new Error("Storage não implementado"); },
        getSignedUrl: async () => { throw new Error("Storage não implementado"); },
      },
      email: {
        send: async () => { console.log("[EMAIL] Enviado"); },
        sendTemplate: async () => { console.log("[EMAIL TEMPLATE] Enviado"); },
      },
      payments: {
        createCheckoutSession: async () => { throw new Error("Payments não implementado"); },
        createPortalSession: async () => { throw new Error("Payments não implementado"); },
        verifyWebhook: async () => { throw new Error("Payments não implementado"); },
      },
    };

    pluginInstance = await registry.load("pousadas", context);
  }
  return pluginInstance;
}

// =========================================================
// API Handlers (simulados para demonstração)
// =========================================================

export const pousadasApi = {
  // ---- Rooms ----
  async listRooms(tenantId: string): Promise<Room[]> {
    // Em produção: await prisma.room.findMany({ where: { tenantId, isActive: true }, orderBy: { sortOrder: 'asc' } })
    return []; // Mock - dados viriam do PluginData
  },

  async getRoom(tenantId: string, roomId: string): Promise<Room | null> {
    // Em produção: await prisma.room.findUnique({ where: { id: roomId, tenantId } })
    return null;
  },

  async createRoom(tenantId: string, data: z.infer<typeof createRoomSchema>): Promise<Room> {
    const validated = createRoomSchema.parse(data);
    // Em produção: await prisma.room.create({ data: { ...validated, tenantId } })
    // Emit event
    getServerEventBus().emitTyped("room.created", { roomId: "new", tenantId }, { tenantId });
    return { id: `room-${Date.now()}`, tenantId, ...validated, createdAt: new Date(), updatedAt: new Date() };
  },

  async updateRoom(tenantId: string, roomId: string, data: z.infer<typeof updateRoomSchema>): Promise<Room> {
    const validated = updateRoomSchema.parse(data);
    // Em produção: await prisma.room.update({ where: { id: roomId, tenantId }, data: validated })
    getServerEventBus().emitTyped("room.updated", { roomId, tenantId }, { tenantId });
    return { id: roomId, tenantId, ...validated } as Room;
  },

  async deleteRoom(tenantId: string, roomId: string): Promise<void> {
    // Em produção: await prisma.room.update({ where: { id: roomId, tenantId }, data: { isActive: false } })
    getServerEventBus().emitTyped("room.deleted", { roomId, tenantId }, { tenantId });
  },

  // ---- Bookings ----
  async listBookings(tenantId: string, params?: { status?: string; from?: Date; to?: Date }): Promise<Booking[]> {
    // Em produção: await prisma.booking.findMany({ where: { tenantId, ... } })
    return [];
  },

  async getBooking(tenantId: string, bookingId: string): Promise<Booking | null> {
    // Em produção: await prisma.booking.findUnique({ where: { id: bookingId, tenantId } })
    return null;
  },

  async createBooking(tenantId: string, data: z.infer<typeof createBookingSchema>): Promise<{ booking: Booking; paymentUrl?: string }> {
    const validated = createBookingSchema.parse(data);
    // Em produção: criar guest, booking, calcular preço, criar payment intent
    getServerEventBus().emitTyped("booking.created", { bookingId: "new", tenantId, roomId: validated.roomId }, { tenantId });
    return { booking: {} as Booking, paymentUrl: "/pousadas/pagamento/new" };
  },

  async updateBooking(tenantId: string, bookingId: string, data: z.infer<typeof updateBookingSchema>): Promise<Booking> {
    const validated = updateBookingSchema.parse(data);
    // Em produção: await prisma.booking.update({ where: { id: bookingId, tenantId }, data: validated })
    if (validated.status) {
      getServerEventBus().emitTyped(`booking.${validated.status.toLowerCase()}`, { bookingId, tenantId }, { tenantId });
    }
    return {} as Booking;
  },

  async cancelBooking(tenantId: string, bookingId: string, reason?: string): Promise<Booking> {
    // Em produção: await prisma.booking.update({ where: { id: bookingId, tenantId }, data: { status: "CANCELLED", cancellationReason: reason } })
    getServerEventBus().emitTyped("booking.cancelled", { bookingId, tenantId, reason }, { tenantId });
    return {} as Booking;
  },

  async checkIn(tenantId: string, bookingId: string): Promise<Booking> {
    // Em produção: await prisma.booking.update({ where: { id: bookingId, tenantId }, data: { status: "CHECKED_IN" } })
    getServerEventBus().emitTyped("booking.checked_in", { bookingId, tenantId }, { tenantId });
    return {} as Booking;
  },

  async checkOut(tenantId: string, bookingId: string): Promise<Booking> {
    // Em produção: await prisma.booking.update({ where: { id: bookingId, tenantId }, data: { status: "CHECKED_OUT" } })
    getServerEventBus().emitTyped("booking.checked_out", { bookingId, tenantId }, { tenantId });
    return {} as Booking;
  },

  // ---- Availability ----
  async getAvailability(tenantId: string, params: z.infer<typeof availabilityQuerySchema>): Promise<any[]> {
    const validated = availabilityQuerySchema.parse(params);
    // Em produção: buscar quartos disponíveis no período
    return [];
  },

  async setAvailability(tenantId: string, data: z.infer<typeof createAvailabilitySchema>): Promise<Availability> {
    const validated = createAvailabilitySchema.parse(data);
    // Em produção: await prisma.availability.upsert({ where: { roomId_date: { roomId: validated.roomId, date: new Date(validated.date) } }, create: ..., update: ... })
    getServerEventBus().emitTyped("availability.updated", { roomId: validated.roomId, date: validated.date, tenantId }, { tenantId });
    return { id: `av-${Date.now()}`, tenantId, ...validated, date: new Date(validated.date), createdAt: new Date(), updatedAt: new Date() };
  },

  async bulkSetAvailability(tenantId: string, items: z.infer<typeof createAvailabilitySchema>[]): Promise<Availability[]> {
    // Em produção: transaction com múltiplos upserts
    return [];
  },

  // ---- Seasonal Pricing ----
  async listSeasonalPricing(tenantId: string): Promise<SeasonalPricing[]> {
    return [];
  },

  async createSeasonalPricing(tenantId: string, data: z.infer<typeof seasonalPricingSchema>): Promise<SeasonalPricing> {
    const validated = seasonalPricingSchema.parse(data);
    // Em produção: await prisma.seasonalPricing.create({ data: { ...validated, tenantId } })
    return { id: `sp-${Date.now()}`, tenantId, ...validated, startDate: new Date(validated.startDate), endDate: new Date(validated.endDate), createdAt: new Date(), updatedAt: new Date() };
  },

  async updateSeasonalPricing(tenantId: string, id: string, data: Partial<z.infer<typeof seasonalPricingSchema>>): Promise<SeasonalPricing> {
    // Em produção: await prisma.seasonalPricing.update({ where: { id, tenantId }, data })
    return {} as SeasonalPricing;
  },

  async deleteSeasonalPricing(tenantId: string, id: string): Promise<void> {
    // Em produção: await prisma.seasonalPricing.delete({ where: { id, tenantId } })
  },

  // ---- Config ----
  async getConfig(tenantId: string): Promise<PousadasConfig> {
    // Em produção: buscar de tenant.settings.pousadas
    return {
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
  },

  async updateConfig(tenantId: string, config: Partial<PousadasConfig>): Promise<PousadasConfig> {
    const validated = pousadasConfigSchema.parse(config);
    // Em produção: await prisma.tenant.update({ where: { id: tenantId }, data: { settings: { pousadas: validated } } })
    getServerEventBus().emitTyped("config.updated", { tenantId, config: validated }, { tenantId });
    return validated;
  },

  // ---- Guests ----
  async listGuests(tenantId: string): Promise<Guest[]> {
    return [];
  },

  async getGuest(tenantId: string, guestId: string): Promise<Guest | null> {
    return null;
  },

  async createGuest(tenantId: string, data: Omit<Guest, "id" | "tenantId" | "createdAt" | "updatedAt">): Promise<Guest> {
    // Em produção: await prisma.guest.create({ data: { ...data, tenantId } })
    return { id: `guest-${Date.now()}`, tenantId, ...data, createdAt: new Date(), updatedAt: new Date() };
  },
};

// =========================================================
// Next.js Route Handlers (para uso real)
// =========================================================

/*
// app/api/pousadas/rooms/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = getTenantIdFromRequest(request); // via middleware/auth
  const rooms = await pousadasApi.listRooms(tenantId);
  return Response.json({ rooms });
}

export async function POST(request: Request) {
  const tenantId = getTenantIdFromRequest(request);
  const body = await request.json();
  const room = await pousadasApi.createRoom(tenantId, body);
  return Response.json({ room }, { status: 201 });
}

// app/api/pousadas/bookings/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = getTenantIdFromRequest(request);
  const status = searchParams.get("status");
  const bookings = await pousadasApi.listBookings(tenantId, { status });
  return Response.json({ bookings });
}

export async function POST(request: Request) {
  const tenantId = getTenantIdFromRequest(request);
  const body = await request.json();
  const result = await pousadasApi.createBooking(tenantId, body);
  return Response.json(result, { status: 201 });
}

// app/api/pousadas/availability/route.ts
export async function POST(request: Request) {
  const tenantId = getTenantIdFromRequest(request);
  const body = await request.json();
  const availability = await pousadasApi.setAvailability(tenantId, body);
  return Response.json({ availability });
}
*/