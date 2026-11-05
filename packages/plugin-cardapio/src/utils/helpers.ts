"use client";

/**
 * Utilitários de formatação e helpers para o plugin Cardápio
 */

export function formatCurrency(value: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value / 100);
}

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatPreparationTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    PREPARING: "Em preparo",
    READY: "Pronto",
    OUT_FOR_DELIVERY: "Saiu para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };
  return labels[status] || status;
}

export function getOrderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DINE_IN: "No local",
    TAKEAWAY: "Retirada",
    DELIVERY: "Entrega",
  };
  return labels[type] || type;
}

export function getSpicyLabel(level: string): string {
  const labels: Record<string, string> = {
    none: "",
    mild: "🌶️ Levemente picante",
    medium: "🌶️🌶️ Picante",
    hot: "🌶️🌶️🌶️ Muito picante",
    "extra-hot": "🌶️🌶️🌶️🌶️ Extremamente picante",
  };
  return labels[level] || "";
}

export function isRestaurantOpen(openingHours: Array<{ day: number; open: string; close: string; isOpen: boolean }>): boolean {
  const now = new Date();
  const today = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = openingHours.find(h => h.day === today);
  if (!todayHours || !todayHours.isOpen) return false;

  const [openH, openM] = todayHours.open.split(":").map(Number);
  const [closeH, closeM] = todayHours.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
  // Fecha após meia-noite
  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

export function getNextOpeningTime(openingHours: Array<{ day: number; open: string; close: string; isOpen: boolean }>): string {
  const now = new Date();
  const today = now.getDay();

  for (let i = 0; i < 7; i++) {
    const day = (today + i) % 7;
    const hours = openingHours.find(h => h.day === day);
    if (hours && hours.isOpen) {
      const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const dayName = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : days[day];
      return `${dayName} às ${hours.open}`;
    }
  }
  return "Consulte nossos horários";
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `#${dateStr}-${random}`;
}

export function estimateWaitTime(items: Array<{ preparationTime: number; quantity: number }>): number {
  if (items.length === 0) return 0;
  const maxTime = Math.max(...items.map(i => i.preparationTime));
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const queueFactor = Math.min(totalItems * 2, 20); // máximo 20min extras por fila
  return maxTime + queueFactor;
}
