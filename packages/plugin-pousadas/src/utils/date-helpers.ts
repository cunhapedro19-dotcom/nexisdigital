"use client";

import { format, parseISO, isValid, addDays, differenceInDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Helpers de data para o plugin Pousadas
 */

export function formatDateBR(date: Date | string, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Data inválida";
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Data inválida";
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatDateKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function parseDateKey(key: string): Date {
  return parseISO(key);
}

export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = startOfDay(start);
  const endDay = startOfDay(end);

  while (current <= endDay) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function getNightsBetween(checkIn: Date, checkOut: Date): number {
  return differenceInDays(startOfDay(checkOut), startOfDay(checkIn));
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  const today = startOfDay(new Date());
  return startOfDay(d).getTime() === today.getTime();
}

export function isPast(date: Date): boolean {
  return endOfDay(date).getTime() < new Date().getTime();
}

export function isFuture(date: Date): boolean {
  return startOfDay(date).getTime() > endOfDay(new Date()).getTime();
}

export function addDaysToDate(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return addDays(d, days);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return diffDays === 1 ? "Amanhã" : `Em ${diffDays} dias`;
  }
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} dias atrás`;
  }
  if (diffHours > 0) {
    return `Em ${diffHours}h`;
  }
  if (diffMinutes > 0) {
    return `Em ${diffMinutes}min`;
  }
  return "Agora";
}

export function getMonthYear(date: Date): { month: number; year: number } {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

export function getWeekDays(year: number, month: number): Date[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = firstDay.getDay(); // 0 = domingo

  const days: Date[] = [];

  // Dias do mês anterior para preencher a primeira semana
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(prevYear, prevMonth - 1, prevDaysInMonth - i));
  }

  // Dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month - 1, i));
  }

  // Dias do próximo mês para completar a grade (6 semanas = 42 dias)
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const remaining = 42 - days.length;

  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(nextYear, nextMonth - 1, i));
  }

  return days;
}