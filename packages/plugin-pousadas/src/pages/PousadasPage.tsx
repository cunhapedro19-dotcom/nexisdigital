"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Calendar, Users, Star, Search, Filter, Loader2, Bed, Wifi, Car, Coffee, Bath, Tv, Waves } from "lucide-react";
import { AvailabilityCalendar, RoomCard, RoomGrid } from "../components";
import { useBooking } from "../hooks/use-booking";
import { formatCurrency } from "../utils/pricing";
import type { Room, Availability, Booking, PousadasConfig, SeasonalPricing } from "../types";

// Demo data
const DEMO_ROOMS: Room[] = [
  {
    id: "room-1",
    tenantId: "demo",
    name: "Suíte Master com Varanda",
    description: "Suíte espaçosa com varanda privativa, vista para o jardim, cama king size, banheira de hidromassagem e mini-bar.",
    capacity: 2,
    basePrice: 45000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Banheira", "Varanda", "Cofre", "Secador"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
    ],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "room-2",
    tenantId: "demo",
    name: "Quarto Deluxe Vista Mar",
    description: "Quarto elegante com vista panorâmica para o mar, cama queen, área de estar e banheiro moderno com chuveiro duplo.",
    capacity: 3,
    basePrice: 38000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Vista mar", "Área de estar", "Cofre"],
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    ],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "room-3",
    tenantId: "demo",
    name: "Quarto Família Superior",
    description: "Ideal para famílias, com dois ambientes: quarto de casal e ante-sala com sofá-cama, duas TVs e banheiro amplo.",
    capacity: 4,
    basePrice: 52000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Sofá-cama", "Duas TVs", "Banheira", "Varanda"],
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "room-4",
    tenantId: "demo",
    name: "Bangalô Premium",
    description: "Bangalô privativo com piscina exclusiva, deck, sala de estar, cozinha compacta e suíte master.",
    capacity: 2,
    basePrice: 89000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Piscina privativa", "Deck", "Cozinha", "Banheira", "Varanda"],
    images: [
      "https://images.unsplash.com/photo-1584132915606-3c7a2b8c4a5b?w=800&q=80",
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "room-5",
    tenantId: "demo",
    name: "Quarto Standard Conforto",
    description: "Quarto aconchegante com cama queen, estação de trabalho, banheiro moderno e todas as comodidades essenciais.",
    capacity: 2,
    basePrice: 28000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Estação de trabalho", "Cofre"],
    images: [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
    ],
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "room-6",
    tenantId: "demo",
    name: "Suíte Júnior Executiva",
    description: "Suíte compacta mas completa, ideal para casais ou viajantes a trabalho, com área de trabalho e banheiro premium.",
    capacity: 2,
    basePrice: 35000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Área de trabalho", "Banheira", "Cofre"],
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    ],
    isActive: true,
    sortOrder: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEMO_AVAILABILITIES: Availability[] = [
  // Bloquear algumas datas para demo
  { id: "av-1", tenantId: "demo", roomId: "room-1", date: new Date("2026-12-25"), status: "BLOCKED", createdAt: new Date(), updatedAt: new Date() },
  { id: "av-2", tenantId: "demo", roomId: "room-2", date: new Date("2026-12-25"), status: "BLOCKED", createdAt: new Date(), updatedAt: new Date() },
  { id: "av-3", tenantId: "demo", roomId: "room-3", date: new Date("2026-12-31"), status: "BLOCKED", createdAt: new Date(), updatedAt: new Date() },
  { id: "av-4", tenantId: "demo", roomId: "room-4", date: new Date("2026-12-31"), status: "BLOCKED", createdAt: new Date(), updatedAt: new Date() },
];

const DEMO_BOOKINGS: Booking[] = [];

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

const DEMO_SEASONAL: SeasonalPricing[] = [
  { id: "sp-1", tenantId: "demo", name: "Réveillon", startDate: new Date("2026-12-28"), endDate: new Date("2027-01-05"), priceMultiplier: 2.0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "sp-2", tenantId: "demo", name: "Carnaval", startDate: new Date("2027-02-10"), endDate: new Date("2027-02-18"), priceMultiplier: 1.8, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "sp-3", tenantId: "demo", name: "Férias Julho", startDate: new Date("2027-07-01"), endDate: new Date("2027-07-31"), priceMultiplier: 1.3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

export default function PousadasPage() {
  const {
    step,
    searchParams,
    selectedRoom,
    guestData,
    booking,
    availableRooms,
    pricing,
    setStep,
    setSearchParams,
    selectRoom,
    setGuestData,
    createBooking,
    reset,
  } = useBooking(DEMO_ROOMS, DEMO_AVAILABILITIES, DEMO_BOOKINGS, DEMO_CONFIG, DEMO_SEASONAL);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Calcular noites
  const nights = searchParams ? Math.ceil(
    (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  // Preços para cada quarto disponível
  const pricingMap = new Map<string, { total: number }>();
  availableRooms.forEach(room => {
    if (searchParams) {
      const p = pricing; // Simplificado - em produção calcularia por quarto
      pricingMap.set(room.id, { total: p?.total || room.basePrice * nights });
    }
  });

  const handleSearch = (checkIn: string, checkOut: string) => {
    setSearchParams({
      checkIn,
      checkOut,
      adults: searchParams?.adults || 1,
      children: searchParams?.children || 0,
    });
  };

  const handleRoomSelect = (room: Room) => {
    selectRoom(room);
  };

  const handleGuestSubmit = (guest: typeof guestData) => {
    setGuestData(guest!);
  };

  const handleBookingCreate = async () => {
    await createBooking();
  };

  if (step === "search" || step === "select-room") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Search */}
        <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="absolute inset-0 opacity-5">
            <svg className="h-full w-full" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="url(#grad)"/></svg>
          </div>
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
                Encontre sua <span className="text-[var(--brand-cyan)]">Estadia Perfeita</span>
              </h1>
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                Quartos confortáveis, atendimento acolhedor e a melhor localização. Reserve direto e garanta o melhor preço.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <AvailabilityCalendar
                rooms={DEMO_ROOMS}
                availabilities={DEMO_AVAILABILITIES}
                bookings={DEMO_BOOKINGS}
                onSelectRange={handleSearch}
                minDate={new Date()}
                adults={searchParams?.adults || 1}
                children={searchParams?.children || 0}
              />

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                <div className="sm:col-span-2">
                  <label htmlFor="adults" className="label">Adultos</label>
                  <select
                    id="adults"
                    value={searchParams?.adults || 1}
                    onChange={e => setSearchParams({ ...(searchParams || { checkIn: "", checkOut: "", adults: 1, children: 0 }), adults: Number(e.target.value) })}
                    className="input"
                  >
                    {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="children" className="label">Crianças</label>
                  <select
                    id="children"
                    value={searchParams?.children || 0}
                    onChange={e => setSearchParams({ ...(searchParams || { checkIn: "", checkOut: "", adults: 1, children: 0 }), children: Number(e.target.value) })}
                    className="input"
                  >
                    {[...Array(5)].map((_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {}}
                    disabled={!searchParams?.checkIn || !searchParams?.checkOut}
                    className="btn btn-primary w-full h-10 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resultados */}
        {searchParams && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {availableRooms.length} quarto{availableRooms.length !== 1 ? "s" : ""} disponível{availableRooms.length !== 1 ? "eis" : ""}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    {formatDateBR(searchParams.checkIn)} - {formatDateBR(searchParams.checkOut)} • {nights} noite{nights !== 1 ? "s" : ""} • {searchParams.adults + searchParams.children} hóspede{searchParams.adults + searchParams.children !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="btn btn-ghost lg:hidden"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </button>
                  <button className="btn btn-ghost">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Ordenar
                  </button>
                </div>
              </div>

              <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Filtros lateral */}
                <aside className={`${showMobileFilters ? "block" : "hidden"} lg:block`}>
                  <div className="card p-4 sticky top-24 space-y-6">
                    <h3 className="font-semibold text-[var(--text-primary)]">Filtros</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="label">Preço por noite</label>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <span>R$ 200</span>
                          <input type="range" min="200" max="1000" className="flex-1" />
                          <span>R$ 1.000+</span>
                        </div>
                      </div>
                      <div>
                        <label className="label">Comodidades</label>
                        <div className="space-y-2">
                          {[
                            ["Wi-Fi", "wifi"],
                            ["Ar-condicionado", "ac"],
                            ["Café da manhã", "breakfast"],
                            ["Piscina", "pool"],
                            ["Estacionamento", "parking"],
                            ["Vista mar", "ocean-view"],
                          ].map(([label, key]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="checkbox" />
                              <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Grid de quartos */}
                <main className="lg:col-span-3">
                  <RoomGrid
                    rooms={availableRooms}
                    checkIn={searchParams.checkIn}
                    checkOut={searchParams.checkOut}
                    nights={nights}
                    onSelect={handleRoomSelect}
                    pricingMap={pricingMap}
                  />
                </main>
              </div>
            </div>
          </section>
        )}

        {/* Benefícios */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">Por que reservar direto?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Melhor Preço Garantido", desc: "Sem taxas de intermediários, você paga menos reservando direto." },
                { icon: Star, title: "Cancelamento Flexível", desc: "Políticas mais vantajosas que sites de terceiros." },
                { icon: Coffee, title: "Café da Manhã Incluído", desc: "Reservas diretas ganham café da manhã cortesia." },
                { icon: Wifi, title: "Upgrade Prioritário", desc: "Clientes diretos têm prioridade em upgrades disponíveis." },
              ].map((benefit, i) => (
                <div key={i} className="card p-6 text-center group">
                  <div className="w-14 h-14 mx-auto mb-4 bg-[var(--brand-cyan)]/10 rounded-xl flex items-center justify-center group-hover:bg-[var(--brand-cyan)] group-hover:text-white transition-colors">
                    <benefit.icon className="w-7 h-7 text-[var(--brand-cyan)] group-hover:text-white" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">{benefit.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Dúvidas ou precisa de ajuda?</h2>
            <p className="text-[var(--text-secondary)] mb-8">Nossa equipe está pronta para tornar sua estadia inesquecível.</p>
            <a href="/contato" className="btn btn-primary px-8 py-3 inline-flex">
              Falar com a gente
            </a>
          </div>
        </section>
      </div>
    );
  }

  // Step: guest-details
  if (step === "guest-details" && selectedRoom) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {["Busca", "Quarto", "Hóspede", "Confirmação"].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${i < 2 ? "bg-[var(--brand-cyan)] text-white" : i === 2 ? "bg-[var(--brand-cyan)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"}
                `}>
                  {i + 1}
                </div>
                <span className="ml-2 hidden sm:block text-sm font-medium">
                  {label}
                </span>
                {i < 3 && <div className={`w-16 h-0.5 mx-2 ${i < 2 ? "bg-[var(--brand-cyan)]" : "bg-[var(--bg-secondary)]"}`} />}
              </div>
            ))}
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <main className="lg:col-span-2 space-y-6">
              {/* Quarto selecionado */}
              <div className="card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)]">
                    {selectedRoom.images?.[0] ? (
                      <img src={selectedRoom.images[0]} alt={selectedRoom.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">🏨</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedRoom.name}</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                      {formatDateBR(searchParams!.checkIn)} - {formatDateBR(searchParams!.checkOut)} • {nights} noite{nights !== 1 ? "s" : ""}
                    </p>
                    <p className="text-[var(--brand-cyan)] font-semibold mt-2">{formatCurrency(selectedRoom.basePrice)}/noite</p>
                  </div>
                </div>

                <form onSubmit={handleBookingCreate}>
                  <BookingForm
                    onSubmit={async (data) => {
                      // O useBooking já cria a reserva internamente
                      await handleBookingCreate();
                    }}
                    onCancel={() => setStep("select-room")}
                  />
                </form>
              </div>
            </main>

            <aside className="lg:col-span-1">
              <BookingSummary
                room={selectedRoom}
                checkIn={searchParams!.checkIn}
                checkOut={searchParams!.checkOut}
                nights={nights}
                adults={searchParams!.adults}
                children={searchParams!.children}
                config={DEMO_CONFIG}
                pricing={pricing!}
                depositRequired={pricing ? Math.round(pricing.total * (DEMO_CONFIG.depositPercentage / 100)) : 0}
                onConfirm={handleBookingCreate}
                onCancel={() => setStep("select-room")}
                className="hidden lg:block"
              />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Step: confirmation / payment / success
  if ((step === "confirmation" || step === "payment" || step === "success") && booking && selectedRoom) {
    const isSuccess = step === "success";
    const isPayment = step === "payment";

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {["Busca", "Quarto", "Hóspede", isSuccess ? "Sucesso" : "Pagamento"].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${i < 3 ? "bg-[var(--brand-cyan)] text-white" : isSuccess ? "bg-[var(--text-success)] text-white" : "bg-[var(--brand-cyan)] text-white"}
                `}>
                  {isSuccess && i === 3 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : i + 1}
                </div>
                <span className="ml-2 hidden sm:block text-sm font-medium">{label}</span>
                {i < 3 && <div className={`w-16 h-0.5 mx-2 ${i < 2 ? "bg-[var(--brand-cyan)]" : "bg-[var(--brand-cyan)]"}`} />}
              </div>
            ))}
          </div>

          {isSuccess ? (
            <div className="card p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-[var(--text-success)]/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--text-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Reserva Confirmada!</h1>
              <p className="text-[var(--text-secondary)] mb-6">Sua estadia está garantida. Enviamos a confirmação para <strong>{guestData?.email}</strong>.</p>

              <div className="card p-6 text-left mb-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">Detalhes da reserva</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Código</dt><dd className="font-mono font-medium">{booking.id.slice(-8).toUpperCase()}</dd></div>
                  <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Quarto</dt><dd>{selectedRoom.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Check-in</dt><dd>{formatDateBR(booking.checkIn)} às {DEMO_CONFIG.checkInTime}</dd></div>
                  <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Check-out</dt><dd>{formatDateBR(booking.checkOut)} até {DEMO_CONFIG.checkOutTime}</dd></div>
                  <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Hóspedes</dt><dd>{booking.adults + booking.children}</dd></div>
                  <div className="flex justify-between border-t pt-3"><dt className="font-semibold text-[var(--text-primary)]">Total</dt><dd className="font-bold text-[var(--brand-cyan)]">{formatCurrency(booking.totalPrice)}</dd></div>
                </dl>
              </div>

              <div className="flex gap-3">
                <button onClick={reset} className="btn btn-primary flex-1">Nova reserva</button>
                <a href="/admin/pousadas" className="btn btn-ghost flex-1">Ver no Admin</a>
              </div>
            </div>
          ) : isPayment ? (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pagamento do Depósito</h2>
              <div className="space-y-4 mb-6">
                <p className="text-[var(--text-secondary)]">
                  Para confirmar sua reserva, é necessário pagar o depósito de <strong>{DEMO_CONFIG.depositPercentage}%</strong>.
                </p>
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg space-y-2">
                  <div className="flex justify-between"><span>Total da estadia</span><span>{formatCurrency(booking.totalPrice)}</span></div>
                  <div className="flex justify-between"><span>Depósito ({DEMO_CONFIG.depositPercentage}%)</span><span className="font-semibold text-[var(--brand-cyan)]">{formatCurrency(Math.round(booking.totalPrice * (DEMO_CONFIG.depositPercentage / 100)))}</span></div>
                  <div className="flex justify-between border-t pt-2"><span>Restante na estadia</span><span>{formatCurrency(booking.totalPrice - Math.round(booking.totalPrice * (DEMO_CONFIG.depositPercentage / 100)))}</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <a href="/pousadas/pagamento/demo" className="btn btn-primary w-full py-3">
                  Pagar com Stripe / Mercado Pago
                </a>
                <button onClick={() => setStep("confirmation")} className="btn btn-ghost w-full">Voltar</button>
              </div>
            </div>
          ) : (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Confirme sua reserva</h2>
              <p className="text-[var(--text-secondary)] mb-6">Revise os detalhes antes de confirmar.</p>

              <div className="space-y-4 mb-6">
                <BookingSummary
                  room={selectedRoom}
                  booking={booking}
                  checkIn={searchParams!.checkIn}
                  checkOut={searchParams!.checkOut}
                  nights={nights}
                  adults={searchParams!.adults}
                  children={searchParams!.children}
                  config={DEMO_CONFIG}
                  pricing={pricing!}
                  depositRequired={Math.round(pricing!.total * (DEMO_CONFIG.depositPercentage / 100))}
                  onConfirm={handleBookingCreate}
                  onCancel={() => setStep("guest-details")}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function formatDateBR(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}