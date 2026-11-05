"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Booking, BookingCreateInput, BookingResponse, Room, Guest, Availability, PousadasConfig, SeasonalPricing } from "../types";
import { calculateBookingPrice, calculateDepositAmount, getAvailableRooms } from "../utils/pricing";
import { formatDateKey, parseDateKey } from "../utils/date-helpers";

interface UseBookingState {
  // Estado do fluxo de reserva
  step: "search" | "select-room" | "guest-details" | "confirmation" | "payment" | "success";
  searchParams: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  } | null;
  selectedRoom: Room | null;
  guestData: Guest | null;
  booking: Booking | null;
  paymentUrl: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useBooking(
  rooms: Room[],
  availabilities: Availability[],
  bookings: Booking[],
  config: PousadasConfig,
  seasonalPricings: SeasonalPricing[] = []
) {
  const [state, setState] = useState<UseBookingState>({
    step: "search",
    searchParams: null,
    selectedRoom: null,
    guestData: null,
    booking: null,
    paymentUrl: null,
    error: null,
    isLoading: false,
  });

  // Persistir estado do booking no localStorage
  const [persistedState, setPersistedState] = useLocalStorage<Partial<UseBookingState>>(
    "pousadas-booking-flow",
    {}
  );

  // Restaurar estado persistido na inicialização
  useEffect(() => {
    if (persistedState.step) {
      setState(prev => ({ ...prev, ...persistedState }));
    }
  }, []);

  // Salvar estado quando mudar
  useEffect(() => {
    setPersistedState(state);
  }, [state, setPersistedState]);

  const setStep = useCallback((step: UseBookingState["step"]) => {
    setState(prev => ({ ...prev, step, error: null }));
  }, []);

  const setSearchParams = useCallback((params: UseBookingState["searchParams"]) => {
    setState(prev => ({ ...prev, searchParams: params, step: "select-room", error: null }));
  }, []);

  const selectRoom = useCallback((room: Room) => {
    if (!state.searchParams) return;

    const availableRooms = getAvailableRooms(
      rooms,
      parseDateKey(state.searchParams.checkIn),
      parseDateKey(state.searchParams.checkOut),
      availabilities,
      bookings,
      state.searchParams.adults,
      state.searchParams.children
    );

    if (!availableRooms.find(r => r.id === room.id)) {
      setState(prev => ({ ...prev, error: "Quarto não está mais disponível para estas datas" }));
      return;
    }

    setState(prev => ({ ...prev, selectedRoom: room, step: "guest-details", error: null }));
  }, [rooms, availabilities, bookings, state.searchParams]);

  const setGuestData = useCallback((guest: Guest) => {
    setState(prev => ({ ...prev, guestData: guest, step: "confirmation", error: null }));
  }, []);

  const createBooking = useCallback(async () => {
    if (!state.searchParams || !state.selectedRoom || !state.guestData) {
      setState(prev => ({ ...prev, error: "Dados incompletos para criar reserva" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Calcular preço
      const pricing = calculateBookingPrice(
        state.selectedRoom,
        parseDateKey(state.searchParams.checkIn),
        parseDateKey(state.searchParams.checkOut),
        config,
        seasonalPricings,
        availabilities
      );

      const depositRequired = calculateDepositAmount(pricing.total, config);

      // Criar objeto de reserva
      const bookingData: Booking = {
        id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        tenantId: "demo", // Será preenchido pelo servidor
        roomId: state.selectedRoom.id,
        guestId: state.guestData.id || `guest_${Date.now()}`,
        checkIn: parseDateKey(state.searchParams.checkIn),
        checkOut: parseDateKey(state.searchParams.checkOut),
        nights: pricing.nights,
        adults: state.searchParams.adults,
        children: state.searchParams.children,
        status: depositRequired > 0 ? "PENDING" : "CONFIRMED",
        source: "DIRECT",
        basePrice: pricing.base,
        discount: pricing.discount,
        taxes: pricing.taxes,
        fees: pricing.fees,
        totalPrice: pricing.total,
        depositPaid: 0,
        depositRequired,
        cancellationPolicy: config.cancellationPolicy,
        specialRequests: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Em produção, chamaria API aqui
      // const response = await fetch("/api/pousadas/bookings", { method: "POST", body: JSON.stringify(bookingData) });
      // const result: BookingResponse = await response.json();

      // Simular resposta da API
      const paymentUrl = depositRequired > 0 ? `/pousadas/pagamento/${bookingData.id}` : null;

      setState(prev => ({
        ...prev,
        booking: bookingData,
        paymentUrl,
        step: depositRequired > 0 ? "payment" : "success",
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erro ao criar reserva",
        isLoading: false,
      }));
    }
  }, [state.searchParams, state.selectedRoom, state.guestData, rooms, availabilities, bookings, config, seasonalPricings]);

  const confirmPayment = useCallback(async (paymentId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Em produção, verificaria pagamento com Stripe/MP
      // const verified = await verifyPayment(paymentId);

      setState(prev => ({
        ...prev,
        booking: prev.booking ? { ...prev.booking, status: "CONFIRMED", depositPaid: prev.booking.depositRequired } : null,
        step: "success",
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Falha ao confirmar pagamento",
        isLoading: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      step: "search",
      searchParams: null,
      selectedRoom: null,
      guestData: null,
      booking: null,
      paymentUrl: null,
      error: null,
      isLoading: false,
    });
    setPersistedState({});
  }, [setPersistedState]);

  // Computed
  const availableRooms = state.searchParams
    ? getAvailableRooms(
        rooms,
        parseDateKey(state.searchParams.checkIn),
        parseDateKey(state.searchParams.checkOut),
        availabilities,
        bookings,
        state.searchParams.adults,
        state.searchParams.children
      )
    : [];

  const pricing = state.selectedRoom && state.searchParams
    ? calculateBookingPrice(
        state.selectedRoom,
        parseDateKey(state.searchParams.checkIn),
        parseDateKey(state.searchParams.checkOut),
        config,
        seasonalPricings,
        availabilities
      )
    : null;

  return {
    ...state,
    availableRooms,
    pricing,
    setStep,
    setSearchParams,
    selectRoom,
    setGuestData,
    createBooking,
    confirmPayment,
    reset,
  };
}