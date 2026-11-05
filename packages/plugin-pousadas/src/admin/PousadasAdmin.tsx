"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Home,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ArrowUpRight,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Loader2,
} from "lucide-react";
import { AdminPageLayout, AdminSection, AdminTable, AdminTableColumn, AdminBadge, AdminButton, AdminInput, AdminSelect, AdminSwitch, AdminField, AdminOverlay, AdminEditorModal, AdminTabs, TabsList, TabsTrigger, TabsContent, AdminEditorModalField } from "@nexis/ui/admin";
import { formatCurrency, formatDateBR } from "../utils/date-helpers";
import type { Room, Booking, Guest, Availability, PousadasConfig, SeasonalPricing } from "../types";
import { MOCK_ROOMS, MOCK_BOOKINGS, MOCK_GUESTS, MOCK_AVAILABILITIES, MOCK_CONFIG, MOCK_SEASONAL } from "./mock-data";
import { useAdminToast } from "@nexis/ui/admin";

function getStatusBadge(status: Booking["status"]) {
  const config: Record<Booking["status"], { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
    PENDING: { label: "Pendente", variant: "warning" },
    CONFIRMED: { label: "Confirmada", variant: "success" },
    CHECKED_IN: { label: "Hospedado", variant: "info" },
    CHECKED_OUT: { label: "Finalizada", variant: "default" },
    CANCELLED: { label: "Cancelada", variant: "danger" },
    NO_SHOW: { label: "No-show", variant: "danger" },
  };
  const c = config[status];
  return <AdminBadge variant={c.variant}>{c.label}</AdminBadge>;
}

function getSourceBadge(source: Booking["source"]) {
  const config: Record<Booking["source"], { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
    DIRECT: { label: "Direta", variant: "default" },
    ONLINE: { label: "Online", variant: "success" },
    PHONE: { label: "Telefone", variant: "info" },
    EMAIL: { label: "E-mail", variant: "warning" },
    WALKIN: { label: "Walk-in", variant: "danger" },
  };
  const c = config[source];
  return <AdminBadge variant={c.variant}>{c.label}</AdminBadge>;
}

// =========================================================
// Dashboard Tab
// =========================================================

function DashboardTab() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const stats = useMemo(() => {
    const activeBookings = MOCK_BOOKINGS.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN");
    const checkInsToday = MOCK_BOOKINGS.filter(b => b.checkIn.toISOString().split("T")[0] === todayStr && b.status === "CONFIRMED");
    const checkOutsToday = MOCK_BOOKINGS.filter(b => b.checkOut.toISOString().split("T")[0] === todayStr && b.status === "CHECKED_IN");
    const revenueThisMonth = MOCK_BOOKINGS
      .filter(b => b.createdAt >= thisMonthStart && b.createdAt <= thisMonthEnd && b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const occupancyRate = MOCK_ROOMS.length > 0
      ? Math.round((activeBookings.length / MOCK_ROOMS.length) * 100)
      : 0;

    return {
      totalRooms: MOCK_ROOMS.length,
      activeBookings: activeBookings.length,
      checkInsToday: checkInsToday.length,
      checkOutsToday: checkOutsToday.length,
      revenueThisMonth,
      occupancyRate,
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminSection title="Total de Quartos" className="card p-4 text-center">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalRooms}</p>
        </AdminSection>
        <AdminSection title="Reservas Ativas" className="card p-4 text-center">
          <p className="text-3xl font-bold text-[var(--brand-cyan)]">{stats.activeBookings}</p>
        </AdminSection>
        <AdminSection title="Check-ins Hoje" className="card p-4 text-center">
          <p className="text-3xl font-bold text-[var(--text-success)]">{stats.checkInsToday}</p>
        </AdminSection>
        <AdminSection title="Check-outs Hoje" className="card p-4 text-center">
          <p className="text-3xl font-bold text-[var(--text-warning)]">{stats.checkOutsToday}</p>
        </AdminSection>
        <AdminSection title="Receita do Mês" className="card p-4 text-center">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.revenueThisMonth)}</p>
        </AdminSection>
        <AdminSection title="Taxa de Ocupação" className="card p-4 text-center">
          <p className="text-3xl font-bold text-[var(--brand-amber)]">{stats.occupancyRate}%</p>
        </AdminSection>
      </div>

      <AdminSection title="Reservas Recentes" icon={Calendar} className="card">
        <AdminTable
          columns={[
            { key: "id", header: "Código", width: "w-32", render: (b: Booking) => <code className="font-mono text-sm">{b.id.slice(-8).toUpperCase()}</code> },
            { key: "guest", header: "Hóspede", render: (b: Booking) => {
              const guest = MOCK_GUESTS.find(g => g.id === b.guestId);
              return guest ? <span>{guest.fullName}</span> : <span className="text-[var(--text-muted)]">—</span>;
            }},
            { key: "room", header: "Quarto", width: "w-40", render: (b: Booking) => {
              const room = MOCK_ROOMS.find(r => r.id === b.roomId);
              return room ? <span>{room.name}</span> : <span className="text-[var(--text-muted)]">—</span>;
            }},
            { key: "dates", header: "Período", render: (b: Booking) => (
              <span className="text-sm">{formatDateBR(b.checkIn)} → {formatDateBR(b.checkOut)}</span>
            )},
            { key: "status", header: "Status", width: "w-36", render: (b: Booking) => getStatusBadge(b.status) },
            { key: "total", header: "Valor", width: "w-32", render: (b: Booking) => formatCurrency(b.totalPrice) },
          ]}
          data={MOCK_BOOKINGS.slice(0, 10)}
          keyExtractor={b => b.id}
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Rooms Tab
// =========================================================

function RoomsTab() {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useAdminToast();

  const handleAddRoom = () => {
    setEditingRoom({
      id: `room-${Date.now()}`,
      tenantId: "demo",
      name: "",
      description: "",
      capacity: 2,
      basePrice: 30000,
      amenities: [],
      photos: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm("Excluir este quarto? Esta ação não pode ser desfeita.")) {
      toast.success("Quarto excluído (simulação)");
    }
  };

  const handleSaveRoom = (data: Partial<Room>) => {
    if (editingRoom?.id.startsWith("room-")) {
      toast.success("Quarto criado (simulação)");
    } else {
      toast.success("Quarto atualizado (simulação)");
    }
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Quartos</h2>
        <button onClick={handleAddRoom} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />Novo Quarto
        </button>
      </div>

      <AdminSection className="card overflow-hidden">
        <AdminTable
          columns={[
            { key: "name", header: "Nome", width: "w-48", render: (r: Room) => <span className="font-medium">{r.name}</span> },
            { key: "capacity", header: "Capacidade", width: "w-24", render: (r: Room) => <span>{r.capacity} pessoas</span> },
            { key: "basePrice", header: "Preço Base", width: "w-36", render: (r: Room) => formatCurrency(r.basePrice) },
            { key: "amenities", header: "Comodidades", render: (r: Room) => (
              <div className="flex flex-wrap gap-1">
                {r.amenities.slice(0, 3).map(a => <AdminBadge key={a} variant="outline" className="text-xs">{a}</AdminBadge>)}
                {r.amenities.length > 3 && <AdminBadge variant="outline" className="text-xs">+{r.amenities.length - 3}</AdminBadge>}
              </div>
            )},
            { key: "isActive", header: "Status", width: "w-24", render: (r: Room) => (
              <AdminBadge variant={r.isActive ? "success" : "default"}>{r.isActive ? "Ativo" : "Inativo"}</AdminBadge>
            )},
            { key: "actions", header: "Ações", width: "w-40", render: (r: Room) => (
              <div className="flex items-center justify-end gap-1">
                <AdminButton variant="ghost" size="sm" onClick={() => handleEditRoom(r)}><Edit className="w-4 h-4" /></AdminButton>
                <AdminButton variant="ghost" size="sm" onClick={() => handleDeleteRoom(r.id)} className="text-[var(--text-danger)]"><Trash2 className="w-4 h-4" /></AdminButton>
              </div>
            )},
          ]}
          data={MOCK_ROOMS}
          keyExtractor={r => r.id}
        />
      </AdminSection>

      {isModalOpen && editingRoom && (
        <AdminOverlay onClose={() => { setIsModalOpen(false); setEditingRoom(null); }}>
          <AdminEditorModal
            title={editingRoom.id.startsWith("room-") ? "Novo Quarto" : `Editar: ${editingRoom.name}`}
            onClose={() => { setIsModalOpen(false); setEditingRoom(null); }}
            onSave={handleSaveRoom}
            initialData={editingRoom}
            fields={[
              { name: "name", label: "Nome do Quarto", type: "text", required: true, placeholder: "Ex: Suíte Master com Vista para o Mar" },
              { name: "description", label: "Descrição", type: "textarea", rows: 3, placeholder: "Descreva o quarto, vista, diferenciais..." },
              { name: "capacity", label: "Capacidade (pessoas)", type: "number", min: 1, max: 10, required: true },
              { name: "basePrice", label: "Preço Base (centavos)", type: "number", min: 0, step: 100, required: true, help: "Preço por noite em centavos (ex: 30000 = R$ 300,00)" },
              { name: "amenities", label: "Comodidades", type: "textarea", rows: 2, placeholder: "Uma por linha: Wi-Fi, Ar condicionado, Frigobar..." },
              { name: "photos", label: "Fotos (URLs)", type: "textarea", rows: 2, placeholder: "Uma URL por linha" },
              { name: "isActive", label: "Ativo", type: "checkbox" },
            ] as AdminEditorModalField[]}
          />
        </AdminOverlay>
      )}
    </div>
  );
}

// =========================================================
// Bookings Tab
// =========================================================

function BookingsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Booking["status"]>("all");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useAdminToast();

  const filteredBookings = useMemo(() => {
    return MOCK_BOOKINGS.filter(b => {
      const matchesSearch = search === "" ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        MOCK_GUESTS.find(g => g.id === b.guestId)?.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const handleStatusChange = (id: string, newStatus: Booking["status"]) => {
    toast.success(`Status alterado para ${newStatus} (simulação)`);
  };

  const handleCheckIn = (id: string) => handleStatusChange(id, "CHECKED_IN");
  const handleCheckOut = (id: string) => handleStatusChange(id, "CHECKED_OUT");
  const handleCancel = (id: string) => {
    if (confirm("Cancelar esta reserva?")) handleStatusChange(id, "CANCELLED");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Reservas</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <AdminInput value={search} onChange={setSearch} placeholder="Buscar reservas..." className="w-64" leftIcon={<Search className="w-4 h-4" />} />
          <AdminSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Todos" },
              { value: "PENDING", label: "Pendentes" },
              { value: "CONFIRMED", label: "Confirmadas" },
              { value: "CHECKED_IN", label: "Hospedados" },
              { value: "CHECKED_OUT", label: "Finalizadas" },
              { value: "CANCELLED", label: "Canceladas" },
            ]}
            className="w-40"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <AdminTable
          columns={[
            { key: "id", header: "Código", width: "w-32", render: (b: Booking) => <code className="font-mono text-sm">{b.id.slice(-8).toUpperCase()}</code> },
            { key: "guest", header: "Hóspede / Quarto", render: (b: Booking) => {
              const room = MOCK_ROOMS.find(r => r.id === b.roomId);
              const guest = MOCK_GUESTS.find(g => g.id === b.guestId);
              return (
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{guest?.fullName}</div>
                  <div className="text-sm text-[var(--text-muted)]">{room?.name}</div>
                </div>
              );
            }},
            { key: "dates", header: "Datas", width: "w-48", render: (b: Booking) => (
              <span className="text-sm">{formatDateBR(b.checkIn)} → {formatDateBR(b.checkOut)}</span>
            )},
            { key: "nights", header: "Noites", width: "w-24", render: (b: Booking) => <span className="text-sm">{b.nights} noites</span> },
            { key: "status", header: "Status", width: "w-36", render: (b: Booking) => getStatusBadge(b.status) },
            { key: "source", header: "Origem", width: "w-32", render: (b: Booking) => getSourceBadge(b.source) },
            { key: "total", header: "Valor", width: "w-32", render: (b: Booking) => formatCurrency(b.totalPrice) },
            { key: "actions", header: "Ações", width: "w-56", render: (b: Booking) => {
              const canCheckIn = b.status === "CONFIRMED";
              const canCheckOut = b.status === "CHECKED_IN";
              const canCancel = ["PENDING", "CONFIRMED"].includes(b.status);
              return (
                <div className="flex items-center justify-end gap-1">
                  {canCheckIn && <AdminButton variant="ghost" size="sm" onClick={() => handleCheckIn(b.id)} className="text-[var(--text-success)] hover:bg-[var(--text-success)]/10" title="Check-in"><ArrowUpRight className="w-4 h-4" /></AdminButton>}
                  {canCheckOut && <AdminButton variant="ghost" size="sm" onClick={() => handleCheckOut(b.id)} title="Check-out"><Package className="w-4 h-4" /></AdminButton>}
                  {canCancel && <AdminButton variant="ghost" size="sm" onClick={() => handleCancel(b.id)} className="text-[var(--text-danger)] hover:bg-[var(--text-danger)]/10" title="Cancelar"><XCircle className="w-4 h-4" /></AdminButton>}
                  <AdminButton variant="ghost" size="sm" onClick={() => { setEditingBooking(b); setIsModalOpen(true); }} title="Ver detalhes"><Eye className="w-4 h-4" /></AdminButton>
                </div>
              );
            }},
          ]}
          data={filteredBookings}
          keyExtractor={b => b.id}
        />
        {filteredBookings.length === 0 && (
          <div className="p-8 text-center text-[var(--text-muted)]">Nenhuma reserva encontrada</div>
        )}
      </div>

      {isModalOpen && editingBooking && (
        <AdminOverlay onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}>
          <AdminEditorModal
            title={`Reserva ${editingBooking.id.slice(-8).toUpperCase()}`}
            onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}
            onSave={() => {}}
            initialData={editingBooking}
            fields={[
              { name: "id", label: "ID", type: "text", disabled: true },
              { name: "status", label: "Status", type: "select", options: [
                { value: "PENDING", label: "Pendente" },
                { value: "CONFIRMED", label: "Confirmada" },
                { value: "CHECKED_IN", label: "Hospedado" },
                { value: "CHECKED_OUT", label: "Finalizada" },
                { value: "CANCELLED", label: "Cancelada" },
                { value: "NO_SHOW", label: "No-show" },
              ]},
              { name: "guestId", label: "Hóspede", type: "text", disabled: true },
              { name: "roomId", label: "Quarto", type: "text", disabled: true },
              { name: "checkIn", label: "Check-in", type: "date", disabled: true },
              { name: "checkOut", label: "Check-out", type: "date", disabled: true },
              { name: "adults", label: "Adultos", type: "number", disabled: true },
              { name: "children", label: "Crianças", type: "number", disabled: true },
              { name: "totalPrice", label: "Valor total (centavos)", type: "number", disabled: true },
              { name: "depositPaid", label: "Depósito pago (centavos)", type: "number", disabled: true },
              { name: "specialRequests", label: "Observações", type: "textarea", rows: 3, disabled: true },
            ]}
            showCancelOnly
          />
        </AdminOverlay>
      )}
    </div>
  );
}

// =========================================================
// Availability Tab
// =========================================================

function AvailabilityTab() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>(MOCK_ROOMS[0]?.id || "");
  const [availabilities, setAvailabilities] = useState(MOCK_AVAILABILITIES);

  const selectedRoom = MOCK_ROOMS.find(r => r.id === selectedRoomId);

  const goPrevMonth = () => setCurrentMonth(prev => prev.month === 1 ? { month: 12, year: prev.year - 1 } : { month: prev.month - 1, year: prev.year });
  const goNextMonth = () => setCurrentMonth(prev => prev.month === 12 ? { month: 1, year: prev.year + 1 } : { month: prev.month + 1, year: prev.year });

  const monthName = new Date(currentMonth.year, currentMonth.month - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const handleDateClick = (date: Date) => {
    const key = date.toISOString().split("T")[0];
    const existing = availabilities.find(a => a.roomId === selectedRoomId && a.date.toISOString().split("T")[0] === key);

    if (existing) {
      const newStatus: Availability["status"] = existing.status === "AVAILABLE" ? "BLOCKED" : "AVAILABLE";
      setAvailabilities(prev => prev.map(a => a.id === existing.id ? { ...a, status: newStatus, updatedAt: new Date() } : a));
    } else {
      setAvailabilities(prev => [...prev, { id: `av-${Date.now()}`, tenantId: "demo", roomId: selectedRoomId, date, status: "BLOCKED", createdAt: new Date(), updatedAt: new Date() }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Disponibilidade</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <AdminSelect
            value={selectedRoomId}
            onChange={setSelectedRoomId}
            options={MOCK_ROOMS.map(r => ({ value: r.id, label: r.name }))}
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <button onClick={goPrevMonth} className="btn btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-medium text-[var(--text-primary)] min-w-[180px] text-center">{monthName}</span>
            <button onClick={goNextMonth} className="btn btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCurrentMonth({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })} className="btn btn-ghost text-sm">Hoje</button>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-center text-[var(--text-muted)] py-8">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]/50" />
          <p>Calendário de disponibilidade (componente AvailabilityCalendar)</p>
          <p className="text-sm mt-2">Quarto: {selectedRoom?.name || "—"}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] flex-wrap">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-[var(--border-default)] bg-[var(--bg-primary)]" /><span>Disponível</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]" /><span>Selecionado</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[var(--text-danger)]/10 border border-[var(--text-danger)]/20" /><span>Bloqueado</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[var(--text-warning)]/10 border border-[var(--text-warning)]/20" /><span>Manutenção</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded ring-2 ring-[var(--brand-cyan)]" /><span>Hoje</span></div>
      </div>
    </div>
  );
}

// =========================================================
// Settings Tab
// =========================================================

function SettingsTab() {
  const [config, setConfig] = useState<PousadasConfig>(MOCK_CONFIG);
  const [seasonal, setSeasonal] = useState<SeasonalPricing[]>(MOCK_SEASONAL);
  const [editingSeasonal, setEditingSeasonal] = useState<SeasonalPricing | null>(null);
  const [isSeasonalModalOpen, setIsSeasonalModalOpen] = useState(false);
  const toast = useAdminToast();

  const handleConfigChange = (key: keyof PousadasConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    toast.success("Configurações salvas com sucesso (simulação)");
  };

  const handleAddSeasonal = () => {
    setEditingSeasonal({
      id: `sp-${Date.now()}`,
      tenantId: "demo",
      name: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priceMultiplier: 1.5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsSeasonalModalOpen(true);
  };

  const handleEditSeasonal = (s: SeasonalPricing) => {
    setEditingSeasonal(s);
    setIsSeasonalModalOpen(true);
  };

  const handleSaveSeasonal = (data: Partial<SeasonalPricing>) => {
    if (editingSeasonal?.id.startsWith("sp-")) {
      setSeasonal(prev => prev.map(s => s.id === editingSeasonal.id ? { ...s, ...data, updatedAt: new Date() } : s));
    } else {
      setSeasonal(prev => [...prev, { ...data, id: `sp-${Date.now()}`, tenantId: "demo", createdAt: new Date(), updatedAt: new Date() } as SeasonalPricing]);
    }
    setIsSeasonalModalOpen(false);
    setEditingSeasonal(null);
    toast.success("Período sazonal salvo (simulação)");
  };

  const handleDeleteSeasonal = (id: string) => {
    if (confirm("Excluir este período sazonal?")) {
      setSeasonal(prev => prev.filter(s => s.id !== id));
      toast.success("Período sazonal excluído (simulação)");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Configurações da Pousada</h2>

      <AdminSection title="Configurações Gerais" icon={Settings} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AdminField label="Horário de Check-in" type="time" value={config.checkInTime} onChange={v => handleConfigChange("checkInTime", v)} />
          <AdminField label="Horário de Check-out" type="time" value={config.checkOutTime} onChange={v => handleConfigChange("checkOutTime", v)} />
          <AdminField label="Permitir reserva online" type="checkbox" checked={config.allowOnlineBooking} onChange={v => handleConfigChange("allowOnlineBooking", v === "on")} />
          <AdminField label="Exigir depósito" type="checkbox" checked={config.requireDeposit} onChange={v => handleConfigChange("requireDeposit", v === "on")} />
        </div>
        <AdminField label="Percentual do depósito (%)" type="number" min={0} max={100} value={config.depositPercentage} onChange={v => handleConfigChange("depositPercentage", Number(v))} />
        <AdminSelect
          label="Política de cancelamento"
          value={config.cancellationPolicy}
          onChange={v => handleConfigChange("cancellationPolicy", v as PousadasConfig["cancellationPolicy"])}
          options={[
            { value: "flexible", label: "Flexível (1 dia antes)" },
            { value: "moderate", label: "Moderada (5 dias antes)" },
            { value: "strict", label: "Estrita (14 dias antes)" },
          ]}
        />
        <AdminField label="Máximo de dias para reserva antecipada" type="number" min={1} max={730} value={config.maxAdvanceBookingDays} onChange={v => handleConfigChange("maxAdvanceBookingDays", Number(v))} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AdminField label="Mínimo de noites" type="number" min={1} max={30} value={config.minStayNights} onChange={v => handleConfigChange("minStayNights", Number(v))} />
          <AdminField label="Máximo de noites" type="number" min={1} max={90} value={config.maxStayNights} onChange={v => handleConfigChange("maxStayNights", Number(v))} />
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-default)]">
          <button onClick={handleSaveConfig} className="btn btn-primary">
            Salvar configurações
          </button>
        </div>
      </AdminSection>

      <AdminSection title="Preços Sazonais" icon={Calendar} className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">Períodos com preços especiais</h3>
          <button onClick={handleAddSeasonal} className="btn btn-primary"><Plus className="w-4 h-4 mr-2" />Novo período</button>
        </div>

        {seasonal.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">Nenhum período sazonal configurado</p>
        ) : (
          <div className="space-y-3">
            {seasonal.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[var(--brand-cyan)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{s.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {formatDateBR(s.startDate)} a {formatDateBR(s.endDate)} • {((s.priceMultiplier - 1) * 100).toFixed(0)}% extra
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AdminSwitch
                    value={s.isActive ? "on" : "off"}
                    onChange={v => setSeasonal(prev => prev.map(x => x.id === s.id ? { ...x, isActive: v === "on" } : x))}
                  />
                  <button onClick={() => handleEditSeasonal(s)} className="btn btn-ghost p-2" title="Editar"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteSeasonal(s.id)} className="btn btn-ghost p-2 text-[var(--text-danger)]" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>

      {isSeasonalModalOpen && editingSeasonal && (
        <AdminOverlay onClose={() => { setIsSeasonalModalOpen(false); setEditingSeasonal(null); }}>
          <AdminEditorModal
            title={editingSeasonal.id.startsWith("sp-") ? `Editar: ${editingSeasonal.name}` : "Novo Período Sazonal"}
            onClose={() => { setIsSeasonalModalOpen(false); setEditingSeasonal(null); }}
            onSave={handleSaveSeasonal}
            initialData={editingSeasonal}
            fields={[
              { name: "name", label: "Nome", type: "text", required: true, placeholder: "Ex: Réveillon, Carnaval, Férias Julho" },
              { name: "startDate", label: "Data inicial", type: "date", required: true },
              { name: "endDate", label: "Data final", type: "date", required: true },
              { name: "priceMultiplier", label: "Multiplicador de preço", type: "number", step: 0.1, min: 0.1, max: 10, required: true, help: "1.0 = preço normal, 1.5 = 50% a mais, 2.0 = dobro" },
              { name: "isActive", label: "Ativo", type: "checkbox" },
            ] as AdminEditorModalField[]}
          />
        </AdminOverlay>
      )}
    </div>
  );
}

// =========================================================
// Main Admin Component
// =========================================================

export default function PousadasAdmin() {
  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-5 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rooms">Quartos</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="rooms" className="p-6">
          <RoomsTab />
        </TabsContent>
        <TabsContent value="bookings" className="p-6">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="availability" className="p-6">
          <AvailabilityTab />
        </TabsContent>
        <TabsContent value="settings" className="p-6">
          <SettingsTab />
        </TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}