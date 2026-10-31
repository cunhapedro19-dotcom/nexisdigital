"use client";

/* ============================================================
   Motor de disponibilidade da Pousada Arandis (demo).
   Ocupação = reservas do visitante (localStorage) + uma base
   de ocupação simulada (determinística por chalé+data), para
   que a agenda já pareça "viva" na primeira visita.
   ============================================================ */

export type ReservationStatus = "pendente" | "confirmada" | "cancelada";

export interface Reservation {
  id: string;
  code: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  guests: number;
  notes: string;
  status: ReservationStatus;
  createdAt: number; // epoch ms
}

const STORAGE_KEY = "nx-demo-pousadas-reservations:v1";

/** Lê as reservas do localStorage (apenas cliente). */
export function getReservations(): Reservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reservation[]) : [];
  } catch {
    return [];
  }
}

/** Salva as reservas no localStorage. */
export function saveReservations(reservations: Reservation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch {
    // storage cheio ou indisponível
  }
}

/** Gera código curto legível (ex.: AR-7K9M). */
function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "AR-";
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** Cria reserva pendente e retorna o objeto salvo. */
export function createReservation(input: {
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkin: string;
  checkout: string;
  guests: number;
  notes: string;
}): Reservation {
  const res: Reservation = {
    id: `res_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    code: genCode(),
    ...input,
    status: "pendente",
    createdAt: Date.now(),
  };
  const all = getReservations();
  all.push(res);
  saveReservations(all);
  return res;
}

/** Cancela uma reserva do visitante (apenas suas próprias). */
export function cancelReservation(id: string): boolean {
  const all = getReservations();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  all[idx].status = "cancelada";
  saveReservations(all);
  return true;
}

/* ============================================================
   Disponibilidade determinística (simulada) por chalé + data.
   Usa hash simples para que a mesma data+chalé sempre dê o mesmo
   resultado, sem precisar de backend.
   ============================================================ */

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Retorna true se o chalé tem ocupação "base" (simulada) na data.
 * Determinístico: mesmo roomId + data = mesmo resultado.
 * ~30% dos dias ocupados na base.
 */
function hasBaseOccupancy(roomId: string, date: string): boolean {
  return hashStr(`${roomId}|${date}|base`) % 100 < 30;
}

/**
 * Verifica se há reserva do visitante (confirmada/pendente) cobrindo a data.
 * Datas no formato YYYY-MM-DD; check-in inclusive, check-out exclusive.
 */
function hasVisitorReservation(roomId: string, date: string): boolean {
  const reservations = getReservations();
  return reservations.some(
    (r) =>
      r.roomId === roomId &&
      (r.status === "confirmada" || r.status === "pendente") &&
      r.checkin <= date &&
      r.checkout > date,
  );
}

/**
 * Resultado da verificação de disponibilidade para um intervalo.
 */
export interface AvailabilityResult {
  available: boolean; // true se TODOS os dias livres
  nights: number;
  blockedDays: string[]; // datas YYYY-MM-DD com ocupação
  reason?: string; // "base" | "visitor" | "past"
}

/**
 * Checa disponibilidade de um chalé para um intervalo [checkin, checkout).
 * Retorna objeto com detalhes (dias bloqueados, motivo).
 */
export function checkAvailability(
  roomId: string,
  checkin: string,
  checkout: string,
): AvailabilityResult {
  const today = new Date().toISOString().slice(0, 10);
  if (checkin < today) {
    return { available: false, nights: 0, blockedDays: [checkin], reason: "past" };
  }
  if (checkin >= checkout) {
    return { available: false, nights: 0, blockedDays: [], reason: "invalid_range" };
  }

  const blocked: string[] = [];
  let d = new Date(checkin + "T00:00:00");
  const end = new Date(checkout + "T00:00:00");

  while (d < end) {
    const ds = d.toISOString().slice(0, 10);
    if (hasBaseOccupancy(roomId, ds) || hasVisitorReservation(roomId, ds)) {
      blocked.push(ds);
    }
    d.setDate(d.getDate() + 1);
  }

  return {
    available: blocked.length === 0,
    nights: Math.ceil((end.getTime() - new Date(checkin).getTime()) / 86400000),
    blockedDays: blocked,
    reason: blocked.length ? (blocked.some((bd) => hasBaseOccupancy(roomId, bd)) ? "base" : "visitor") : undefined,
  };
}

/**
 * Lista datas disponíveis para um chalé nos próximos N dias (para calendário).
 */
export function getAvailableDates(roomId: string, daysAhead = 120): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const out: string[] = [];
  let d = new Date(today + "T00:00:00");
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  while (d <= end) {
    const ds = d.toISOString().slice(0, 10);
    if (!hasBaseOccupancy(roomId, ds) && !hasVisitorReservation(roomId, ds)) {
      out.push(ds);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Formata data YYYY-MM-DD → DD/MM para exibição. */
export function fmtDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}`;
}

/** Formata intervalo → "DD/MM a DD/MM". */
export function fmtRange(checkin: string, checkout: string): string {
  return `${fmtDate(checkin)} a ${fmtDate(checkout)}`;
}