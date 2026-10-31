"use client";

import { useMemo, useState } from "react";
import { checkAvailability, fmtDate, getAvailableDates, getReservations, type AvailabilityResult } from "./availability";
import { AdminTone } from "@/components/admin/AdminKit";

interface RoomAvailabilityProps {
  roomId: string;
  roomName: string;
  accent?: AdminTone;
}

export function RoomAvailability({ roomId, roomName, accent = "cyan" }: RoomAvailabilityProps) {
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const availableDates = useMemo(() => getAvailableDates(roomId, 120), [roomId]);
  const minDate = new Date().toISOString().slice(0, 10);
  const maxDate = availableDates[availableDates.length - 1] ?? minDate;

  function handleCheckinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCheckin(val);
    if (val && (!checkout || checkout <= val)) {
      // sugere checkout = checkin + 1 dia
      const d = new Date(val + "T00:00:00");
      d.setDate(d.getDate() + 1);
      setCheckout(d.toISOString().slice(0, 10));
    }
    if (val && checkout) setResult(checkAvailability(roomId, val, checkout));
  }

  function handleCheckoutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCheckout(val);
    if (checkin && val) setResult(checkAvailability(roomId, checkin, val));
  }

  const accentMap: Record<AdminTone, string> = {
    violet: "violet",
    amber: "amber",
    cyan: "cyan",
    orange: "orange",
    zinc: "zinc",
  };
  const ac = accentMap[accent];

  return (
    <div className="nx-edge-light rounded-2xl bg-white/[0.02] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h4 className="font-display text-lg font-medium">{roomName}</h4>
        <span className={`nx-mono text-[11px] uppercase tracking-widest ${ac}-200/70`}>disponibilidade</span>
      </div>

      {/* Seletor de datas */}
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="block">
          <span className="nx-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100/60">Check-in</span>
          <input
            type="date"
            value={checkin}
            onChange={handleCheckinChange}
            min={minDate}
            max={maxDate}
            className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#04101a]/80 px-3.5 text-sm focus:border-cyan-300/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="nx-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100/60">Check-out</span>
          <input
            type="date"
            value={checkout}
            onChange={handleCheckoutChange}
            min={minDate}
            max={maxDate}
            className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#04101a]/80 px-3.5 text-sm focus:border-cyan-300/50 focus:outline-none"
          />
        </label>
      </div>

      {/* Resultado */}
      {result && (
        <div
          className={`rounded-xl p-4 text-sm ${
            result.available
              ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border border-rose-400/30 bg-rose-500/10 text-rose-100"
          }`}
        >
          {result.available ? (
            <>
              <p className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                Disponível para {result.nights} noite{result.nights !== 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs text-cyan-100/70">
                {fmtDate(checkin)} a {fmtDate(checkout)}
              </p>
            </>
          ) : (
            <>
              <p className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
                Indisponível
              </p>
              <p className="mt-1 text-xs text-cyan-100/70">
                {result.blockedDays.length} dia{result.blockedDays.length !== 1 ? "s" : ""} ocupado{result.blockedDays.length !== 1 ? "s" : ""}:
                {" "}
                {result.blockedDays.slice(0, 5).map(fmtDate).join(", ")}
                {result.blockedDays.length > 5 && ` +${result.blockedDays.length - 5} mais`}
              </p>
              {result.reason === "visitor" && (
                <p className="mt-2 text-[11px] text-amber-300">
                  Inclui sua(s) reserva(s) pendente(s)/confirmada(s).
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Mini-calendário (próximos 42 dias) */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-cyan-100/80 hover:bg-white/[0.08]"
      >
        {showCalendar ? "Ocultar calendário" : "Ver calendário"} {"→"}
      </button>

      {showCalendar && (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3" role="region" aria-label={`Calendário de disponibilidade — ${roomName}`}>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-cyan-100/50 mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
              <span key={d} className="nx-mono uppercase tracking-widest">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const today = new Date(minDate + "T00:00:00");
              const start = new Date(today);
              start.setDate(start.getDate() - start.getDay()); // domingo da semana
              const cells: JSX.Element[] = [];
              for (let i = 0; i < 42; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const ds = d.toISOString().slice(0, 10);
                const isPast = d < new Date(minDate + "T00:00:00");
                const isFuture = d > new Date(maxDate + "T00:00:00");
                const available = availableDates.includes(ds);
                const isToday = ds === minDate;
                cells.push(
                  <button
                    key={ds}
                    type="button"
                    disabled={isPast || isFuture || !available}
                    onClick={() => {
                      if (available) {
                        setCheckin(ds);
                        const next = new Date(ds + "T00:00:00");
                        next.setDate(next.getDate() + 1);
                        setCheckout(next.toISOString().slice(0, 10));
                        setResult(checkAvailability(roomId, ds, next.toISOString().slice(0, 10)));
                        setShowCalendar(false);
                      }
                    }}
                    className={`h-8 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
                      isPast || isFuture
                        ? "text-nx-dim cursor-not-allowed"
                        : available
                        ? "text-cyan-100 hover:bg-cyan-400/10"
                        : "text-rose-300/50 cursor-not-allowed bg-rose-400/10"
                    } ${isToday ? "ring-1 ring-cyan-300/50" : ""}`}
                    aria-label={`${fmtDate(ds)} ${available ? "disponível" : "indisponível"}`}
                    aria-pressed={checkin === ds}
                  >
                    {ds.split("-")[2]}
                  </button>,
                );
              }
              return cells;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Painel consolidado: mostra disponibilidade de todos os chalés
   ============================================================ */

interface AvailabilityPanelProps {
  rooms: Array<{ id: string; name: string }>;
  accent?: AdminTone;
}

export function AvailabilityPanel({ rooms, accent = "cyan" }: AvailabilityPanelProps) {
  return (
    <section className="relative border-b border-white/10 py-20 sm:py-28" id="disponibilidade">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <span className="nx-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">disponibilidade</span>
        <h2 className="nx-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
          Consulte disponibilidade em tempo real
        </h2>
        <p className="mt-2 max-w-xl text-sm text-cyan-100/70">
          Escolha as datas e veja quais chalés estão livres. A ocupação inclui
          reservas simuladas + suas próprias solicitações (salvas localmente).
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {rooms.map((r) => (
            <RoomAvailability key={r.id} roomId={r.id} roomName={r.name} accent={accent} />
          ))}
        </div>
      </div>
    </section>
  );
}