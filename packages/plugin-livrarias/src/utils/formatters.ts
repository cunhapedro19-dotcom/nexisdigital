"use client";

/**
 * Utilitários de formatação para o plugin Livrarias
 */

export function formatCurrency(value: number, currency: string = "BRL", locale: string = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number, locale: string = "pt-BR"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(date: Date | string, locale: string = "pt-BR", options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, options || { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(date: Date | string, locale: string = "pt-BR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string, locale: string = "pt-BR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return formatDate(d, locale);
}

export function formatISBN(isbn: string): string {
  const cleaned = isbn.replace(/[-\s]/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 12)}-${cleaned.slice(12)}`;
  }
  return isbn;
}

export function formatSKU(sku: string): string {
  return sku.toUpperCase().replace(/[^A-Z0-9]/g, "");
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

export function truncate(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function maskCreditCard(card: string): string {
  const cleaned = card.replace(/\D/g, "");
  if (cleaned.length < 4) return card;
  const last4 = cleaned.slice(-4);
  const masked = "*".repeat(cleaned.length - 4);
  return `${masked} ${last4}`;
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function calculateLoyaltyPoints(amount: number, rate: number): number {
  return Math.floor((amount / 100) * rate);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}