"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, X, Calendar, Users, Loader2 } from "lucide-react";
import { formatDateKey, parseDateKey, getWeekDays, formatDateBR, isToday, isPast } from "../utils/date-helpers";
import type { Room, Availability, Booking } from "../types";
import { isDateAvailable, getAvailableRooms } from "../utils/pricing";

interface AvailabilityCalendarProps {
  rooms: Room[];
  availabilities: Availability[];
  bookings: Booking[];
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  adults?: number;
  children?: number;
  onSelectRange: (checkIn: string, checkOut: string) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export function AvailabilityCalendar({
  rooms,
  availabilities,
  bookings,
  selectedCheckIn,
  selectedCheckOut,
  adults = 1,
  children = 0,
  onSelectRange,
  minDate = new Date(),
  maxDate,
  disabled = false,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = selectedCheckIn ? parseDateKey(selectedCheckIn) : new Date();
    return { month: base.getMonth() + 1, year: base.getFullYear() };
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Calcular quartos disponíveis para cada data
  const availableRoomsByDate = useMemo(() => {
    const map = new Map<string, number>();

    // Próximos 60 dias
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 60);

    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    for (const date of dates) {
      const key = formatDateKey(date);
      const available = getAvailableRooms(rooms, date, date, availabilities, bookings, adults, children);
      map.set(key, available.length);
    }

    return map;
  }, [rooms, availabilities, bookings, adults, children]);

  const weekDays = useMemo(() => getWeekDays(currentMonth.year, currentMonth.month), [currentMonth]);
  const today = formatDateKey(new Date());

  const isSelected = (date: Date) => {
    const key = formatDateKey(date);
    if (!selectedCheckIn || !selectedCheckOut) return false;
    return key >= selectedCheckIn && key <= selectedCheckOut;
  };

  const isStart = (date: Date) => {
    if (!selectedCheckIn) return false;
    return formatDateKey(date) === selectedCheckIn;
  };

  const isEnd = (date: Date) => {
    if (!selectedCheckOut) return false;
    return formatDateKey(date) === selectedCheckOut;
  };

  const isInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const key = formatDateKey(date);
    return key > selectedCheckIn && key < selectedCheckOut;
  };

  const isAvailable = (date: Date) => {
    const key = formatDateKey(date);
    const count = availableRoomsByDate.get(key) || 0;
    return count > 0;
  };

  const isDisabledDate = (date: Date) => {
    if (disabled) return true;
    const key = formatDateKey(date);
    const minKey = formatDateKey(minDate);
    if (key < minKey) return true;
    if (maxDate && key > formatDateKey(maxDate)) return true;
    return !isAvailable(date);
  };

  const handleDateClick = (date: Date) => {
    if (isDisabledDate(date)) return;

    const key = formatDateKey(date);

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Nova seleção
      onSelectRange(key, key);
    } else if (key < selectedCheckIn) {
      // Selecionou data anterior ao check-in
      onSelectRange(key, selectedCheckOut ?? selectedCheckIn);
    } else {
      // Selecionou check-out
      onSelectRange(selectedCheckIn, key);
    }
  };

  const handleMouseEnter = (date: Date) => {
    if (disabled || !selectedCheckIn || selectedCheckOut) return;
    if (isDisabledDate(date)) return;
    setHoverDate(formatDateKey(date));
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const goPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 1) return { month: 12, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 12) return { month: 1, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const monthName = new Date(currentMonth.year, currentMonth.month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="availability-calendar bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <button
          onClick={goPrevMonth}
          disabled={disabled}
          className="btn btn-ghost p-1.5 hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium text-[var(--text-primary)] capitalize">{monthName}</h3>
        <button
          onClick={goNextMonth}
          disabled={disabled}
          className="btn btn-ghost p-1.5 hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 px-4 py-2 text-xs font-medium text-[var(--text-muted)] border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
          <div key={day} className="text-center py-1">{day}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {weekDays.map((date, index) => {
          const key = formatDateKey(date);
          const isCurrentMonth = date.getMonth() === currentMonth.month - 1;
          const available = isAvailable(date);
          const count = availableRoomsByDate.get(key) || 0;
          const disabledDate = isDisabledDate(date);
          const selected = isSelected(date);
          const start = isStart(date);
          const end = isEnd(date);
          const inRange = isInRange(date);
          const isHovered = hoverDate === key;

          return (
            <button
              key={key}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              onMouseLeave={handleMouseLeave}
              disabled={disabledDate || !isCurrentMonth}
              className={`
                relative aspect-square flex flex-col items-center justify-center
                text-sm transition-all duration-150
                rounded-md
                ${!isCurrentMonth ? "opacity-30 text-[var(--text-muted)]" : ""}
                ${disabledDate ? "cursor-not-allowed text-[var(--text-muted)]" : "cursor-pointer"}
                ${selected && !start && !end ? "bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)]" : ""}
                ${inRange ? "bg-[var(--brand-cyan)]/5" : ""}
                ${start && !end ? "bg-[var(--brand-cyan)] text-white rounded-l-md" : ""}
                ${end && !start ? "bg-[var(--brand-cyan)] text-white rounded-r-md" : ""}
                ${start && end ? "bg-[var(--brand-cyan)] text-white rounded-full" : ""}
                ${isToday(key) && !selected && !disabledDate ? "ring-2 ring-[var(--brand-cyan)]" : ""}
                ${isHovered && !selected && !disabledDate ? "bg-[var(--brand-cyan)]/10" : ""}
                hover:not(:disabled):not(.bg-var(--brand-cyan)):bg-[var(--bg-tertiary)]
              `}
              aria-label={`${formatDateBR(date)}${available ? ` - ${count} quarto${count !== 1 ? "s" : ""} disponível${count !== 1 ? "eis" : ""}` : " - Indisponível"}`}
              aria-selected={selected}
              aria-disabled={disabledDate}
            >
              <span className="font-medium">{date.getDate()}</span>
              {isCurrentMonth && available && count > 0 && !disabledDate && (
                <span className="text-xs text-[var(--text-success)] font-medium">{count}</span>
              )}
              {isCurrentMonth && !available && !disabledDate && (
                <X className="w-3 h-3 text-[var(--text-danger)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-[var(--border-default)] bg-[var(--bg-primary)]" />
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[var(--brand-cyan)]/10 border border-[var(--brand-cyan)]" />
            <span>Selecionado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-[var(--border-default)] bg-[var(--bg-tertiary)] opacity-50" />
            <span>Indisponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded ring-2 ring-[var(--brand-cyan)] bg-[var(--bg-primary)]" />
            <span>Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Componente simples de seletor de datas para uso em formulários */
export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  minDate = new Date(),
  placeholder = "Selecione as datas",
  className = "",
  disabled = false,
}: {
  checkIn?: string;
  checkOut?: string;
  onChange: (checkIn: string | undefined, checkOut: string | undefined) => void;
  minDate?: Date;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState<string | undefined>(checkIn);
  const [tempCheckOut, setTempCheckOut] = useState<string | undefined>(checkOut);

  const handleApply = () => {
    onChange(tempCheckIn, tempCheckOut);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempCheckIn(undefined);
    setTempCheckOut(undefined);
    onChange(undefined, undefined);
    setIsOpen(false);
  };

  const displayValue = checkIn && checkOut
    ? `${formatDateBR(checkIn)} - ${formatDateBR(checkOut)}`
    : checkIn
    ? `${formatDateBR(checkIn)} - ...`
    : placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2.5 text-left bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg hover:border-[var(--brand-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <div className="flex items-center justify-between">
          <span className={checkIn ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
            {displayValue}
          </span>
          <Calendar className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed z-50 inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Selecionar datas</h3>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost p-1" aria-label="Fechar">×</button>
          </div>

          <AvailabilityCalendar
            rooms={[]}
            availabilities={[]}
            bookings={[]}
            selectedCheckIn={tempCheckIn}
            selectedCheckOut={tempCheckOut}
            adults={1}
            children={0}
            onSelectRange={(ci, co) => {
              setTempCheckIn(ci);
              setTempCheckOut(co);
            }}
            minDate={minDate}
          />

          <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border-default)]">
            <button onClick={handleClear} className="btn btn-ghost flex-1" disabled={!tempCheckIn && !tempCheckOut}>
              Limpar
            </button>
            <button onClick={handleApply} className="btn btn-primary flex-1" disabled={!tempCheckIn || !tempCheckOut}>
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}