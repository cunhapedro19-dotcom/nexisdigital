import type { Sale, FinancialEntry, InventoryProduct, CashFlowPoint, DashboardMetrics } from "../types";

/**
 * @nexis/plugin-gestao-empresarial — Utilitários
 */

// =========================================================
// Formatação
// =========================================================

export function formatCurrency(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

export function formatDocument(doc: string): string {
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return doc;
}

export function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? digits.replace(/(\d{5})(\d{3})/, "$1-$2") : cep;
}

// =========================================================
// Labels e badges
// =========================================================

export function getSaleStatusLabel(status: Sale["status"]): string {
  const labels: Record<Sale["status"], string> = {
    draft: "Rascunho",
    completed: "Concluída",
    canceled: "Cancelada",
    returned: "Devolvida",
  };
  return labels[status];
}

export function getSaleStatusBadge(status: Sale["status"]): string {
  const badges: Record<Sale["status"], string> = {
    draft: "badge-outline",
    completed: "badge-success",
    canceled: "badge-danger",
    returned: "badge-warning",
  };
  return badges[status];
}

export function getEntryStatusLabel(status: FinancialEntry["status"]): string {
  const labels: Record<FinancialEntry["status"], string> = {
    pending: "Pendente",
    paid: "Pago",
    overdue: "Vencido",
    canceled: "Cancelado",
  };
  return labels[status];
}

export function getEntryStatusBadge(status: FinancialEntry["status"]): string {
  const badges: Record<FinancialEntry["status"], string> = {
    pending: "badge-warning",
    paid: "badge-success",
    overdue: "badge-danger",
    canceled: "badge-outline",
  };
  return badges[status];
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pix: "PIX",
    cash: "Dinheiro",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    boleto: "Boleto",
    transfer: "Transferência",
  };
  return labels[method] || method;
}

// =========================================================
// Regras de negócio
// =========================================================

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(digits[10]);
}

export function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  const calc = (length: number): number => {
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += Number(digits[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13]);
}

export function isOverdue(entry: FinancialEntry): boolean {
  return entry.status === "pending" && new Date(entry.dueDate) < new Date();
}

export function getDaysUntilDue(dueDate: Date | string): number {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function getStockStatus(product: InventoryProduct): { label: string; level: "ok" | "low" | "out" } {
  if (product.stock === 0) return { label: "Sem estoque", level: "out" };
  if (product.stock <= product.minStock) return { label: "Estoque baixo", level: "low" };
  return { label: "OK", level: "ok" };
}

export function calculateMargin(costPrice: number, salePrice: number): number {
  if (salePrice === 0) return 0;
  return ((salePrice - costPrice) / salePrice) * 100;
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Constrói série de fluxo de caixa diário a partir dos lançamentos pagos
 */
export function buildCashFlow(entries: FinancialEntry[], days = 30): CashFlowPoint[] {
  const points: CashFlowPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const dayEntries = entries.filter(e => {
      if (!e.paidAt) return false;
      const paidDate = new Date(e.paidAt);
      paidDate.setHours(0, 0, 0, 0);
      return paidDate.getTime() === date.getTime();
    });

    const inflow = dayEntries.filter(e => e.type === "receivable" && e.status === "paid").reduce((s, e) => s + e.amount, 0);
    const outflow = dayEntries.filter(e => e.type === "payable" && e.status === "paid").reduce((s, e) => s + e.amount, 0);
    const balance = inflow - outflow;

    points.push({ date: dateStr, inflow, outflow, balance });
  }

  return points;
}

/**
 * Calcula métricas do dashboard
 */
export function calculateDashboardMetrics(
  sales: Sale[],
  entries: FinancialEntry[],
  products: InventoryProduct[],
  monthlyGoal: number
): DashboardMetrics {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthSales = sales.filter(s => {
    const d = new Date(s.soldAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.status === "completed";
  });

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthSales = sales.filter(s => {
    const d = new Date(s.soldAt);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && s.status === "completed";
  });

  const revenueMonth = monthSales.reduce((s, sale) => s + sale.total, 0);
  const revenuePrevMonth = prevMonthSales.reduce((s, sale) => s + sale.total, 0);

  const receivablePending = entries
    .filter(e => e.type === "receivable" && e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);

  const payablePending = entries
    .filter(e => e.type === "payable" && e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);

  const received = entries.filter(e => e.type === "receivable" && e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const paid = entries.filter(e => e.type === "payable" && e.status === "paid").reduce((s, e) => s + e.amount, 0);

  return {
    revenueMonth,
    revenuePrevMonth,
    revenueGrowth: calculateGrowth(revenueMonth, revenuePrevMonth),
    salesCount: monthSales.length,
    averageTicket: monthSales.length > 0 ? Math.round(revenueMonth / monthSales.length) : 0,
    receivablePending,
    payablePending,
    cashBalance: received - paid,
    lowStockCount: products.filter(p => p.isActive && p.stock <= p.minStock).length,
    goalProgress: monthlyGoal > 0 ? Math.round((revenueMonth / monthlyGoal) * 100) : 0,
  };
}

/**
 * Top produtos por receita
 */
export function getTopProducts(sales: Sale[], limit = 5): TopProductSimple[] {
  const map = new Map<string, TopProductSimple>();

  for (const sale of sales.filter(s => s.status === "completed")) {
    for (const item of sale.items) {
      const existing = map.get(item.productId) || {
        productId: item.productId,
        productName: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.total;
      map.set(item.productId, existing);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export interface TopProductSimple {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}
