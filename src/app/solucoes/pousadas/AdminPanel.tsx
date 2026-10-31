"use client";

import { useEffect, useMemo, useState } from "react";
import { currencyBRL } from "@/lib/cn";
import { nextId } from "@/lib/id";
import { DemoArt, type ArtVariant } from "@/components/visual/DemoArt";
import {
  AdminOverlay,
  AdminEditorModal,
  AdminField,
  AdminSection,
  AdminTextarea,
  AdminEmpty,
  ArtPicker,
  DangerButton,
  adminInputCls,
  useAdminToast,
  AdminSearch,
} from "@/components/admin/AdminKit";
import { getReservations, type Reservation, type ReservationStatus } from "./availability";

/* ============================================================
   Modelo de dados da pousada (compartilhado com a vitrine)
   ============================================================ */

export interface PousadaRoom {
  id: string;
  name: string;
  /** Ex.: "2 hóspedes · 32m²" */
  meta: string;
  description: string;
  /** Diária a partir de (R$) */
  price: number;
  art: ArtVariant;
}

export interface PousadaAmenity {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PousadaData {
  rooms: PousadaRoom[];
  amenities: PousadaAmenity[];
}

/** Status badge styling */
function statusBadge(status: ReservationStatus) {
  switch (status) {
    case "confirmada":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    case "pendente":
      return "border-amber-400/30 bg-amber-500/10 text-amber-100";
    case "cancelada":
      return "border-rose-400/30 bg-rose-500/10 text-rose-100";
  }
}

/** Artes que fazem sentido para acomodações. */
const ROOM_ART: ArtVariant[] = ["beach", "beach-wide", "room", "room-warm"];

/* ============================================================
   Painel
   ============================================================ */

export function PousadaAdminPanel({
  data,
  onChange,
  onClose,
  onReset,
}: {
  data: PousadaData;
  onChange: (updater: (prev: PousadaData) => PousadaData) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<"acomodacoes" | "comodidades" | "reservas">("acomodacoes");
  const [roomDraft, setRoomDraft] = useState<PousadaRoom | null>(null);
  const [roomIsNew, setRoomIsNew] = useState(false);
  const [amenityDraft, setAmenityDraft] = useState<PousadaAmenity | null>(null);
  const [amenityIsNew, setAmenityIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all");
  const { show, node } = useAdminToast();

  const rooms = useMemo(
    () => [...data.rooms].sort((a, b) => a.price - b.price),
    [data.rooms],
  );

  // Reservas do localStorage (reaivas)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  useEffect(() => {
    setReservations(getReservations());
  }, []);
  // Escuta mudanças no storage (outras abas)
  useEffect(() => {
    const onStorage = () => setReservations(getReservations());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filteredReservations = useMemo(() => {
    let list = [...reservations].sort((a, b) => b.createdAt - a.createdAt);
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.guestName.toLowerCase().includes(q) ||
          r.guestEmail.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [reservations, statusFilter, search]);

  function openNewRoom() {
    setRoomDraft({
      id: nextId("r"),
      name: "",
      meta: "2 hóspedes · 30m²",
      description: "",
      price: 0,
      art: "room",
    });
    setRoomIsNew(true);
  }

  function saveRoom() {
    if (!roomDraft) return;
    if (!roomDraft.name.trim()) {
      show("Informe o nome da acomodação.");
      return;
    }
    const price = Math.round(roomDraft.price * 100) / 100;
    if (!Number.isFinite(price) || price < 0) {
      show("Informe uma diária válida.");
      return;
    }
    const saved: PousadaRoom = { ...roomDraft, name: roomDraft.name.trim(), price };
    onChange((prev) => ({
      ...prev,
      rooms: roomIsNew
        ? [...prev.rooms, saved]
        : prev.rooms.map((r) => (r.id === saved.id ? saved : r)),
    }));
    setRoomDraft(null);
    show(roomIsNew ? "Acomodação adicionada ao site." : "Alterações salvas na vitrine.");
  }

  function deleteRoom(id: string) {
    onChange((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
    show("Acomodação excluída.");
  }

  function openNewAmenity() {
    setAmenityDraft({ id: nextId("am"), icon: "✨", title: "", description: "" });
    setAmenityIsNew(true);
  }

  function saveAmenity() {
    if (!amenityDraft) return;
    if (!amenityDraft.title.trim()) {
      show("Informe o título da comodidade.");
      return;
    }
    const saved: PousadaAmenity = { ...amenityDraft, title: amenityDraft.title.trim() };
    onChange((prev) => ({
      ...prev,
      amenities: amenityIsNew
        ? [...prev.amenities, saved]
        : prev.amenities.map((a) => (a.id === saved.id ? saved : a)),
    }));
    setAmenityDraft(null);
    show(amenityIsNew ? "Comodidade adicionada." : "Alterações salvas na vitrine.");
  }

  function deleteAmenity(id: string) {
    onChange((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a.id !== id) }));
    show("Comodidade excluída.");
  }

  return (
    <AdminOverlay
      title="Pousada Arandis — gerenciamento"
      subtitle="acomodações, comodidades e reservas do site"
      tone="cyan"
      onClose={onClose}
      onReset={() => {
        onReset();
        show("Dados originais restaurados.");
      }}
    >
      {node}

      {/* Abas */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1" role="tablist" aria-label="Seções do painel">
        {(
          [
            ["acomodacoes", "Acomodações"],
            ["comodidades", "Comodidades"],
            ["reservas", "Reservas"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-9 flex-1 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
              tab === t ? "bg-white/10 text-white" : "text-nx-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "acomodacoes" ? (
        <AdminSection
          title={`Acomodações (${data.rooms.length})`}
          action={
            <button
              type="button"
              onClick={openNewRoom}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-300 to-cyan-500 px-4 text-xs font-semibold text-[#04101a] transition hover:from-cyan-200 hover:to-cyan-400"
            >
              + Nova acomodação
            </button>
          }
        >
          {rooms.length === 0 ? (
            <AdminEmpty message="Nenhuma acomodação. Cadastre a primeira para exibi-la no site." />
          ) : (
            <ul className="space-y-2">
              {rooms.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="relative h-12 w-12 flex-none overflow-hidden rounded-lg" aria-hidden>
                    <RoomThumb art={r.art} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.name}</span>
                    <span className="nx-mono block text-[11px] uppercase tracking-widest text-nx-dim">
                      {r.meta} · {currencyBRL(r.price)} / diária
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRoomDraft({ ...r });
                        setRoomIsNew(false);
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteRoom(r.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      ) : (
        <AdminSection
          title={`Comodidades (${data.amenities.length})`}
          action={
            <button
              type="button"
              onClick={openNewAmenity}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-300 to-cyan-500 px-4 text-xs font-semibold text-[#04101a] transition hover:from-cyan-200 hover:to-cyan-400"
            >
              + Nova comodidade
            </button>
          }
        >
          {data.amenities.length === 0 ? (
            <AdminEmpty message="Nenhuma comodidade cadastrada." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.amenities.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="text-xl" aria-hidden>
                    {a.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{a.title}</span>
                    <span className="block truncate text-xs text-nx-muted">{a.description}</span>
                  </span>
                  <span className="flex flex-none items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAmenityDraft({ ...a });
                        setAmenityIsNew(false);
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteAmenity(a.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      ) : tab === "reservas" ? (
        <AdminSection title={`Reservas (${filteredReservations.length})`}>
          <div className="mb-4 flex flex-wrap gap-3">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar por código, hóspede, e-mail, chalé..."
              label="Buscar reservas"
            />
            <div className="flex items-center gap-2">
              <span className="nx-mono text-[11px] uppercase tracking-widest text-nx-dim">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | ReservationStatus)}
                className="h-9 rounded-lg border border-white/10 bg-nx-bg/70 px-3 text-sm text-nx-text focus:border-cyan-300/50 focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="pendente">Pendentes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
          </div>
          {filteredReservations.length === 0 ? (
            <AdminEmpty message="Nenhuma reserva encontrada." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-widest text-nx-dim">
                    <th className="pb-2 pr-4">Código</th>
                    <th className="pb-2 pr-4">Hóspede</th>
                    <th className="pb-2 pr-4">Chalé</th>
                    <th className="pb-2 pr-4">Período</th>
                    <th className="pb-2 pr-4">Hóspedes</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Criada em</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 nx-mono font-medium">{r.code}</td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.guestName}</div>
                        <div className="nx-mono text-[11px] text-nx-dim">{r.guestEmail}</div>
                      </td>
                      <td className="py-3 pr-4">{r.roomName}</td>
                      <td className="py-3 pr-4 nx-mono">{r.checkin} → {r.checkout}</td>
                      <td className="py-3 pr-4">{r.guests}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-widest ${statusBadge(r.status)}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 nx-mono text-[11px] text-nx-dim">
                        {new Date(r.createdAt).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSection>
      ) : (
        <AdminSection
          title={`Comodidades (${data.amenities.length})`}
          action={
            <button
              type="button"
              onClick={openNewAmenity}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-300 to-cyan-500 px-4 text-xs font-semibold text-[#04101a] transition hover:from-cyan-200 hover:to-cyan-400"
            >
              + Nova comodidade
            </button>
          }
        >
          {data.amenities.length === 0 ? (
            <AdminEmpty message="Nenhuma comodidade cadastrada." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.amenities.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="text-xl" aria-hidden>
                    {a.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{a.title}</span>
                    <span className="block truncate text-xs text-nx-muted">{a.description}</span>
                  </span>
                  <span className="flex flex-none items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAmenityDraft({ ...a });
                        setAmenityIsNew(false);
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteAmenity(a.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      )}

      {roomDraft && (
        <AdminEditorModal
          title={roomIsNew ? "Nova acomodação" : `Editar — ${roomDraft.name}`}
          onClose={() => setRoomDraft(null)}
          onSave={saveRoom}
        >
          <AdminField label="Nome">
            <input
              value={roomDraft.name}
              onChange={(e) => setRoomDraft({ ...roomDraft, name: e.target.value })}
              placeholder="Ex.: Chalé Jardim"
              className={adminInputCls}
            />
          </AdminField>
          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Capacidade / tamanho" hint="Ex.: 2 hóspedes · 32m²">
              <input
                value={roomDraft.meta}
                onChange={(e) => setRoomDraft({ ...roomDraft, meta: e.target.value })}
                className={adminInputCls}
              />
            </AdminField>
            <AdminField label="Diária a partir de (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(roomDraft.price) ? roomDraft.price : 0}
                onChange={(e) => setRoomDraft({ ...roomDraft, price: Number(e.target.value) })}
                className={adminInputCls}
              />
            </AdminField>
          </div>
          <AdminField label="Descrição">
            <AdminTextarea
              value={roomDraft.description}
              onChange={(e) => setRoomDraft({ ...roomDraft, description: e.target.value })}
              placeholder="Camas, varanda, vista, diferenciais..."
            />
          </AdminField>
          <AdminField label="Imagem" hint="Ilustração exibida no card da acomodação.">
            <ArtPicker
              value={ROOM_ART.includes(roomDraft.art) ? roomDraft.art : "room"}
              onChange={(art) => setRoomDraft({ ...roomDraft, art })}
              variants={ROOM_ART}
            />
          </AdminField>
        </AdminEditorModal>
      )}

      {amenityDraft && (
        <AdminEditorModal
          title={amenityIsNew ? "Nova comodidade" : `Editar — ${amenityDraft.title}`}
          onClose={() => setAmenityDraft(null)}
          onSave={saveAmenity}
        >
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <AdminField label="Ícone">
              <input
                value={amenityDraft.icon}
                onChange={(e) => setAmenityDraft({ ...amenityDraft, icon: e.target.value.slice(0, 4) })}
                className={`${adminInputCls} text-center text-lg`}
                aria-label="Ícone (emoji)"
              />
            </AdminField>
            <AdminField label="Título">
              <input
                value={amenityDraft.title}
                onChange={(e) => setAmenityDraft({ ...amenityDraft, title: e.target.value })}
                placeholder="Ex.: Piscina com deck"
                className={adminInputCls}
              />
            </AdminField>
          </div>
          <AdminField label="Descrição">
            <AdminTextarea
              value={amenityDraft.description}
              onChange={(e) => setAmenityDraft({ ...amenityDraft, description: e.target.value })}
              placeholder="Detalhes da comodidade..."
            />
          </AdminField>
        </AdminEditorModal>
      )}
    </AdminOverlay>
  );
}

/* Miniatura da arte nas listas do painel. */
function RoomThumb({ art }: { art: ArtVariant }) {
  return <DemoArt variant={art} />;
}
