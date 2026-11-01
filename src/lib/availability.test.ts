import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBaseOccupancy,
  getReservations,
  checkAvailability,
  getAvailableDates,
  createReservation,
  cancelReservation,
  type AvailabilityResult,
} from "./availability";

const ROOM_ID = "suite-master";

describe("availability.ts", () => {
  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    vi.resetAllMocks();
    localStorage.clear();
  });

  describe("getBaseOccupancy", () => {
    it("retorna dias ocupados determinísticos baseados no roomId", () => {
      const occupied = getBaseOccupancy(ROOM_ID);
      expect(Array.isArray(occupied)).toBe(true);
      // Deve ser determinístico - mesma entrada = mesma saída
      expect(getBaseOccupancy(ROOM_ID)).toEqual(occupied);
      // Diferentes rooms têm ocupações diferentes
      expect(getBaseOccupancy("outro-quarto")).not.toEqual(occupied);
    });

    it("retorna datas no formato YYYY-MM-DD", () => {
      const occupied = getBaseOccupancy(ROOM_ID);
      occupied.forEach((date) => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe("getReservations", () => {
    it("retorna array vazio quando não há reservas", () => {
      expect(getReservations()).toEqual([]);
    });

    it("lê reservas do localStorage", () => {
      const mockReservations = [
        {
          id: "res-1",
          roomId: ROOM_ID,
          roomName: "Suíte Master",
          guestName: "João",
          guestEmail: "joao@test.com",
          guestPhone: "",
          checkin: "2026-12-01",
          checkout: "2026-12-05",
          guests: 2,
          notes: "",
          status: "pendente" as const,
          createdAt: Date.now(),
        },
      ];
      localStorage.setItem("nx-demo-pousadas-reservations:v1", JSON.stringify(mockReservations));
      expect(getReservations()).toEqual(mockReservations);
    });
  });

  describe("checkAvailability", () => {
    it("retorna available=true quando não há conflito", () => {
      const result = checkAvailability(ROOM_ID, "2026-12-20", "2026-12-25");
      expect(result.available).toBe(true);
      expect(result.nights).toBe(5);
      expect(result.blockedDays).toEqual([]);
    });

    it("retorna available=false quando checkin >= checkout", () => {
      const result = checkAvailability(ROOM_ID, "2026-12-25", "2026-12-20");
      expect(result.available).toBe(false);
      expect(result.reason).toBe("invalid_range");
    });

    it("detecta conflito com ocupação base", () => {
      const baseOccupied = getBaseOccupancy(ROOM_ID);
      if (baseOccupied.length > 0) {
        const checkin = baseOccupied[0];
        const checkout = "2026-12-25"; // depois do primeiro dia ocupado
        const result = checkAvailability(ROOM_ID, checkin, checkout);
        expect(result.available).toBe(false);
        expect(result.reason).toBe("base");
        expect(result.blockedDays).toContain(checkin);
      }
    });

    it("detecta conflito com reserva do visitante", () => {
      // Cria uma reserva primeiro
      createReservation({
        roomId: ROOM_ID,
        roomName: "Suíte Master",
        guestName: "Teste",
        guestEmail: "teste@test.com",
        guestPhone: "",
        checkin: "2026-12-10",
        checkout: "2026-12-15",
        guests: 2,
        notes: "",
      });

      const result = checkAvailability(ROOM_ID, "2026-12-12", "2026-12-14");
      expect(result.available).toBe(false);
      expect(result.reason).toBe("visitor");
      expect(result.blockedDays).toContain("2026-12-12");
    });

    it("ignora reservas canceladas", () => {
      createReservation({
        roomId: ROOM_ID,
        roomName: "Suíte Master",
        guestName: "Teste",
        guestEmail: "teste@test.com",
        guestPhone: "",
        checkin: "2026-12-10",
        checkout: "2026-12-15",
        guests: 2,
        notes: "",
      });

      const reservations = getReservations();
      const created = reservations.find((r) => r.guestName === "Teste");
      if (created) {
        cancelReservation(created.id);
      }

      const result = checkAvailability(ROOM_ID, "2026-12-12", "2026-12-14");
      expect(result.available).toBe(true);
    });
  });

  describe("getAvailableDates", () => {
    it("retorna array de datas disponíveis nos próximos N dias", () => {
      const dates = getAvailableDates(ROOM_ID, 30);
      expect(Array.isArray(dates)).toBe(true);
      expect(dates.length).toBeGreaterThan(0);
      dates.forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
    });

    it("não inclui datas passadas", () => {
      const dates = getAvailableDates(ROOM_ID, 60);
      const today = new Date().toISOString().slice(0, 10);
      dates.forEach((d) => expect(d >= today).toBe(true));
    });
  });

  describe("createReservation", () => {
    it("cria reserva e salva no localStorage", () => {
      const reservation = createReservation({
        roomId: ROOM_ID,
        roomName: "Suíte Master",
        guestName: "Maria",
        guestEmail: "maria@test.com",
        guestPhone: "11999999999",
        checkin: "2026-12-01",
        checkout: "2026-12-05",
        guests: 2,
        notes: "Teste",
      });

      expect(reservation.id).toMatch(/^res_/);
      expect(reservation.roomId).toBe(ROOM_ID);
      expect(reservation.guestName).toBe("Maria");
      expect(reservation.status).toBe("pendente");
      expect(typeof reservation.createdAt).toBe("number");

      const stored = getReservations();
      expect(stored).toContainEqual(reservation);
    });
  });

  describe("cancelReservation", () => {
    it("marca reserva como cancelada", () => {
      const reservation = createReservation({
        roomId: ROOM_ID,
        roomName: "Suíte Master",
        guestName: "Pedro",
        guestEmail: "pedro@test.com",
        guestPhone: "",
        checkin: "2026-12-10",
        checkout: "2026-12-15",
        guests: 1,
        notes: "",
      });

      cancelReservation(reservation.id);

      const stored = getReservations();
      const updated = stored.find((r) => r.id === reservation.id);
      expect(updated?.status).toBe("cancelada");
    });

    it("não falha se ID não existir", () => {
      expect(() => cancelReservation("id-inexistente")).not.toThrow();
    });
  });
});