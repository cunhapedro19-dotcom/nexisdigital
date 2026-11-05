import type { Room, Guest, Booking, Availability, PousadasConfig, SeasonalPricing } from "../types";

/**
 * Dados mock para o admin do plugin Pousadas
 * Datas como Date (admin usa .toISOString() diretamente)
 */

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth(); // 0-based

function dayOfMonth(day: number, monthOffset = 0): Date {
  return new Date(y, m + monthOffset, day, 12, 0, 0, 0);
}

// =========================================================
// Quartos
// =========================================================

export const MOCK_ROOMS: Room[] = [
  {
    id: "room-1",
    tenantId: "demo",
    name: "Suíte_master_com_vista_para_o_mar",
    description: "Suíte ampla com varanda privativa e vista frontal para a praia. Cama king, ar-condicionado e frigobar.",
    capacity: 3,
    basePrice: 48000,
    amenities: ["Ar-condicionado", "TV Smart", "Frigobar", "Varanda", "Vista mar", "Wi-Fi"],
    images: [],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "room-2",
    tenantId: "demo",
    name: "Quarto Casal Jardim",
    description: "Quarto acolhedor com cama queen, aberto para o jardim interno com redes.",
    capacity: 2,
    basePrice: 32000,
    amenities: ["Ar-condicionado", "TV Smart", "Frigobar", "Wi-Fi"],
    images: [],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "room-3",
    tenantId: "demo",
    name: "Quarto Família",
    description: "Quarto espaçoso para famílias, com cama de casal e duas de solteiro.",
    capacity: 5,
    basePrice: 56000,
    amenities: ["Ar-condicionado", "TV Smart", "Frigobar", "Wi-Fi", "Cofre"],
    images: [],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "room-4",
    tenantId: "demo",
    name: "Chalé Colonial",
    description: "Chalé independente em construção original restaurada, com varanda em madeira.",
    capacity: 2,
    basePrice: 42000,
    amenities: ["Ar-condicionado", "Wi-Fi", "Varanda", "Café da manhã incluso"],
    images: [],
    isActive: true,
    sortOrder: 4,
  },
];

// =========================================================
// Hóspedes
// =========================================================

export const MOCK_GUESTS: Guest[] = [
  {
    id: "guest-1",
    tenantId: "demo",
    fullName: "Mariana Costa",
    email: "mariana.costa@email.com",
    phone: "+55 11 98877-6655",
    document: "123.456.789-00",
    nationality: "Brasileira",
    marketingConsent: true,
  },
  {
    id: "guest-2",
    tenantId: "demo",
    fullName: "Pedro Almeida",
    email: "pedro.almeida@email.com",
    phone: "+55 21 97766-5544",
    document: "234.567.890-11",
    nationality: "Brasileira",
    marketingConsent: false,
  },
  {
    id: "guest-3",
    tenantId: "demo",
    fullName: "Carla Menezes",
    email: "carla.menezes@email.com",
    phone: "+55 31 96655-4433",
    document: "345.678.901-22",
    nationality: "Brasileira",
    marketingConsent: true,
  },
  {
    id: "guest-4",
    tenantId: "demo",
    fullName: "Thomas Müller",
    email: "thomas.mueller@email.de",
    phone: "+49 170 1234567",
    document: "P77654321",
    nationality: "Alemã",
    marketingConsent: false,
  },
  {
    id: "guest-5",
    tenantId: "demo",
    fullName: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    phone: "+55 47 95544-3322",
    document: "456.789.012-33",
    nationality: "Brasileira",
    marketingConsent: true,
  },
];

// =========================================================
// Reservas
// =========================================================

function booking(
  id: string,
  roomId: string,
  guestId: string,
  inDay: number,
  inMonthOffset: number,
  outDay: number,
  outMonthOffset: number,
  status: Booking["status"],
  source: Booking["source"],
  adults: number,
  children: number,
  totalPrice: number
): Booking {
  const checkIn = dayOfMonth(inDay, inMonthOffset);
  const checkOut = dayOfMonth(outDay, outMonthOffset);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
  return {
    id,
    tenantId: "demo",
    roomId,
    guestId,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    status,
    source,
    basePrice: totalPrice,
    discount: 0,
    taxes: 0,
    fees: 0,
    totalPrice,
    depositPaid: status === "CONFIRMED" || status === "CHECKED_IN" ? Math.round(totalPrice * 0.3) : 0,
    depositRequired: 0,
    cancellationPolicy: "moderate",
    cancelledAt: null,
    createdAt: new Date(y, m - 1, 20),
    updatedAt: new Date(),
  };
}

export const MOCK_BOOKINGS: Booking[] = [
  booking("bk-101", "room-1", "guest-1", 24, -1, 28, -1, "CHECKED_OUT", "DIRECT", 2, 0, 192000),
  booking("bk-102", "room-2", "guest-2", 27, -1, 30, -1, "CHECKED_OUT", "OTA_BOOKING", 2, 1, 96000),
  booking("bk-103", "room-3", "guest-3", 1, 0, 4, 0, "CHECKED_IN", "PHONE", 2, 2, 168000),
  booking("bk-104", "room-1", "guest-4", 2, 0, 6, 0, "CONFIRMED", "OTA_AIRBNB", 2, 0, 192000),
  booking("bk-105", "room-4", "guest-5", 5, 0, 8, 0, "CONFIRMED", "DIRECT", 2, 0, 126000),
  booking("bk-106", "room-2", "guest-1", 8, 0, 10, 0, "PENDING", "EMAIL", 2, 0, 64000),
  booking("bk-107", "room-3", "guest-2", 12, 0, 15, 0, "PENDING", "WALK_IN", 3, 1, 168000),
  booking("bk-108", "room-4", "guest-3", 15, 0, 17, 0, "CONFIRMED", "OTA_BOOKING", 2, 0, 84000),
  booking("bk-109", "room-1", "guest-5", 20, 0, 24, 0, "PENDING", "OTA_EXPEDIA", 2, 0, 192000),
  booking("bk-110", "room-2", "guest-4", 22, 0, 26, 0, "CONFIRMED", "DIRECT", 2, 0, 128000),
  booking("bk-111", "room-3", "guest-1", 26, 0, 30, 0, "PENDING", "PHONE", 4, 0, 168000),
  booking("bk-112", "room-4", "guest-2", 3, 1, 7, 1, "CONFIRMED", "DIRECT", 2, 0, 168000),
];

// =========================================================
// Disponibilidade (bloqueios do mês atual)
// =========================================================

export const MOCK_AVAILABILITIES: Availability[] = [
  { id: "av-1", tenantId: "demo", roomId: "room-1", date: dayOfMonth(18), status: "MAINTENANCE", createdAt: new Date(), updatedAt: new Date() },
  { id: "av-2", tenantId: "demo", roomId: "room-1", date: dayOfMonth(19), status: "MAINTENANCE", createdAt: new Date(), updatedAt: new Date() },
  { id: "av-3", tenantId: "demo", roomId: "room-2", date: dayOfMonth(21), status: "BLOCKED", createdAt: new Date(), updatedAt: new Date() },
  { id: "av-4", tenantId: "demo", roomId: "room-4", date: dayOfMonth(25), status: "BLOCKED", createdAt: new Date(), updatedAt: Date() },
];

// =========================================================
// Configuração
// =========================================================

export const MOCK_CONFIG: PousadasConfig = {
  checkInTime: "14:00",
  checkOutTime: "11:00",
  allowOnlineBooking: true,
  requireDeposit: true,
  depositPercentage: 30,
  cancellationPolicy: "moderate",
  maxAdvanceBookingDays: 365,
  minStayNights: 2,
  maxStayNights: 30,
};

// =========================================================
// Preços sazonais
// =========================================================

export const MOCK_SEASONAL: SeasonalPricing[] = [
  {
    id: "season-1",
    tenantId: "demo",
    name: "Réveillon",
    startDate: new Date(y, 11, 28),
    endDate: new Date(y + 1, 0, 3),
    priceMultiplier: 1.8,
    minStay: 4,
    isActive: true,
  },
  {
    id: "season-2",
    tenantId: "demo",
    name: "Carnaval",
    startDate: new Date(y + 1, 1, 14),
    endDate: new Date(y + 1, 1, 18),
    priceMultiplier: 1.6,
    minStay: 3,
    isActive: true,
  },
  {
    id: "season-3",
    tenantId: "demo",
    name: "Baixa temporada inverno",
    startDate: new Date(y, 4, 1),
    endDate: new Date(y, 8, 30),
    priceMultiplier: 0.8,
    minStay: 1,
    isActive: true,
  },
];
