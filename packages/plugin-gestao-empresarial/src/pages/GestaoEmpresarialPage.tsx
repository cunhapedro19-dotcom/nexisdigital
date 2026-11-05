"use client";

import { useMemo } from "react";
import type { Sale, FinancialEntry, InventoryProduct, BusinessCustomer } from "../types";
import {
  formatCurrency,
  formatPercent,
  calculateDashboardMetrics,
  buildCashFlow,
  getTopProducts,
  getStockStatus,
} from "../utils/helpers";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { clsx } from "clsx";

// =========================================================
// Mock Data
// =========================================================

const MOCK_SALES: Sale[] = [
  {
    id: "sale-1", tenantId: "demo", saleNumber: "VD-1042",
    customerId: "c1",
    items: [
      { productId: "p1", productName: "Notebook Dell Inspiron 15", quantity: 2, unitPrice: 289900, discount: 0, total: 579800 },
      { productId: "p5", productName: "Mouse Logitech MX Master 3S", quantity: 2, unitPrice: 49900, discount: 0, total: 99800 },
    ],
    subtotal: 679600, discount: 20000, total: 659600, cost: 420000,
    paymentMethod: "credit_card", installments: 3, status: "completed",
    soldAt: new Date("2026-11-01T14:30:00"),
    createdAt: new Date("2026-11-01T14:30:00"),
    updatedAt: new Date("2026-11-01T14:30:00"),
  },
  {
    id: "sale-2", tenantId: "demo", saleNumber: "VD-1041",
    customerId: "c2",
    items: [
      { productId: "p2", productName: "Monitor LG 27\" 4K", quantity: 4, unitPrice: 189900, discount: 10000, total: 749600 },
    ],
    subtotal: 759600, discount: 10000, total: 749600, cost: 560000,
    paymentMethod: "pix", installments: 1, status: "completed",
    soldAt: new Date("2026-11-01T09:15:00"),
    createdAt: new Date("2026-11-01T09:15:00"),
    updatedAt: new Date("2026-11-01T09:15:00"),
  },
  {
    id: "sale-3", tenantId: "demo", saleNumber: "VD-1040",
    customerId: "c3",
    items: [
      { productId: "p3", productName: "Cadeira Ergonômica Pro", quantity: 3, unitPrice: 129900, discount: 0, total: 389700 },
      { productId: "p6", productName: "Teclado Mecânico Keychron K3", quantity: 3, unitPrice: 59900, discount: 0, total: 179700 },
    ],
    subtotal: 569400, discount: 0, total: 569400, cost: 330000,
    paymentMethod: "boleto", installments: 2, status: "completed",
    soldAt: new Date("2026-10-31T16:00:00"),
    createdAt: new Date("2026-10-31T16:00:00"),
    updatedAt: new Date("2026-10-31T16:00:00"),
  },
  {
    id: "sale-4", tenantId: "demo", saleNumber: "VD-1039",
    customerId: "c1",
    items: [
      { productId: "p4", productName: "Hub USB-C 7 em 1", quantity: 10, unitPrice: 15900, discount: 0, total: 159000 },
    ],
    subtotal: 159000, discount: 0, total: 159000, cost: 80000,
    paymentMethod: "pix", installments: 1, status: "completed",
    soldAt: new Date("2026-10-30T11:20:00"),
    createdAt: new Date("2026-10-30T11:20:00"),
    updatedAt: new Date("2026-10-30T11:20:00"),
  },
  {
    id: "sale-5", tenantId: "demo", saleNumber: "VD-1038",
    customerId: "c4",
    items: [
      { productId: "p1", productName: "Notebook Dell Inspiron 15", quantity: 1, unitPrice: 289900, discount: 0, total: 289900 },
    ],
    subtotal: 289900, discount: 0, total: 289900, cost: 210000,
    paymentMethod: "transfer", installments: 1, status: "completed",
    soldAt: new Date("2026-10-29T15:45:00"),
    createdAt: new Date("2026-10-29T15:45:00"),
    updatedAt: new Date("2026-10-29T15:45:00"),
  },
];

const MOCK_ENTRIES: FinancialEntry[] = [
  { id: "f1", tenantId: "demo", type: "receivable", description: "VD-1042 — Tecnologia Paulo (cartão 3x)", category: "Vendas", amount: 659600, dueDate: new Date("2026-11-28"), paidAt: null, status: "pending", saleId: "sale-1", createdAt: new Date("2026-11-01"), updatedAt: new Date("2026-11-01") },
  { id: "f2", tenantId: "demo", type: "receivable", description: "VD-1041 — Escritório Lima (PIX)", category: "Vendas", amount: 749600, dueDate: new Date("2026-11-01"), paidAt: new Date("2026-11-01"), status: "paid", paymentMethod: "pix", saleId: "sale-2", createdAt: new Date("2026-11-01"), updatedAt: new Date("2026-11-01") },
  { id: "f3", tenantId: "demo", type: "receivable", description: "VD-1040 — Clínica Bem Viver (boleto 2x)", category: "Vendas", amount: 569400, dueDate: new Date("2026-11-15"), paidAt: null, status: "pending", saleId: "sale-3", createdAt: new Date("2026-10-31"), updatedAt: new Date("2026-10-31") },
  { id: "f4", tenantId: "demo", type: "payable", description: "Aluguel do escritório", category: "Despesas Fixas", amount: 350000, dueDate: new Date("2026-11-05"), paidAt: null, status: "pending", supplierName: "Imobiliária Central", createdAt: new Date("2026-11-01"), updatedAt: new Date("2026-11-01") },
  { id: "f5", tenantId: "demo", type: "payable", description: "Reposição de estoque — Dell", category: "Fornecedores", amount: 890000, dueDate: new Date("2026-10-28"), paidAt: null, status: "pending", supplierName: "Distribuidora Dell BR", createdAt: new Date("2026-10-20"), updatedAt: new Date("2026-10-20") },
  { id: "f6", tenantId: "demo", type: "payable", description: "Energia elétrica", category: "Despesas Fixas", amount: 48500, dueDate: new Date("2026-10-25"), paidAt: new Date("2026-10-24"), status: "paid", paymentMethod: "boleto", supplierName: "Enel", createdAt: new Date("2026-10-15"), updatedAt: new Date("2026-10-24") },
  { id: "f7", tenantId: "demo", type: "payable", description: "Internet dedicada", category: "Despesas Fixas", amount: 29900, dueDate: new Date("2026-10-10"), paidAt: new Date("2026-10-09"), status: "paid", paymentMethod: "pix", supplierName: "Vivo Empresas", createdAt: new Date("2026-10-05"), updatedAt: new Date("2026-10-09") },
  { id: "f8", tenantId: "demo", type: "receivable", description: "VD-1038 — Autopeças Rocha", category: "Vendas", amount: 289900, dueDate: new Date("2026-10-28"), paidAt: new Date("2026-10-28"), status: "paid", paymentMethod: "transfer", saleId: "sale-5", createdAt: new Date("2026-10-29"), updatedAt: new Date("2026-10-28") },
];

const MOCK_PRODUCTS: InventoryProduct[] = [
  { id: "p1", tenantId: "demo", sku: "NB-DELL-I15", name: "Notebook Dell Inspiron 15", category: "Informática", costPrice: 210000, salePrice: 289900, stock: 4, minStock: 3, unit: "un", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "p2", tenantId: "demo", sku: "MON-LG-27", name: 'Monitor LG 27" 4K', category: "Informática", costPrice: 140000, salePrice: 189900, stock: 9, minStock: 4, unit: "un", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "p3", tenantId: "demo", sku: "CAD-ERGO-PRO", name: "Cadeira Ergonômica Pro", category: "Mobiliário", costPrice: 85000, salePrice: 129900, stock: 2, minStock: 5, unit: "un", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "p4", tenantId: "demo", sku: "HUB-USBC-7", name: "Hub USB-C 7 em 1", category: "Acessórios", costPrice: 8000, salePrice: 15900, stock: 42, minStock: 10, unit: "un", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "p5", tenantId: "demo", sku: "MOU-MX-3S", name: "Mouse Logitech MX Master 3S", category: "Acessórios", costPrice: 32000, salePrice: 49900, stock: 0, minStock: 5, unit: "un", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "p6", tenantId: "demo", sku: "TEC-KC-K3", name: "Teclado Mecânico Keychron K3", category: "Acessórios", costPrice: 38000, salePrice: 59900, stock: 11, minStock: 5, unit: "un", isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const MOCK_CUSTOMERS: BusinessCustomer[] = [
  { id: "c1", tenantId: "demo", type: "company", name: "Tecnologia Paulo LTDA", tradeName: "Tech Paulo", document: "12345678000190", email: "compras@techpaulo.com.br", phone: "(11) 3322-1010", creditLimit: 1000000, paymentTermDays: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "c2", tenantId: "demo", type: "company", name: "Escritório Lima ME", tradeName: "Esc. Lima", document: "98765432000155", email: "financeiro@escritoriolima.com", phone: "(11) 4433-2020", creditLimit: 500000, paymentTermDays: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "c3", tenantId: "demo", type: "company", name: "Clínica Bem Viver", document: "11223344000122", email: "adm@bemviver.com.br", phone: "(11) 5566-3030", creditLimit: 800000, paymentTermDays: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: "c4", tenantId: "demo", type: "company", name: "Autopeças Rocha LTDA", document: "55667788000133", email: "rocha@autopecas.com.br", phone: "(11) 6677-4040", creditLimit: 300000, paymentTermDays: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const MONTHLY_GOAL = 300000000; // R$ 3.000.000 em centavos

// =========================================================
// Dashboard
// =========================================================

export default function GestaoEmpresarialPage() {
  const metrics = useMemo(
    () => calculateDashboardMetrics(MOCK_SALES, MOCK_ENTRIES, MOCK_PRODUCTS, MONTHLY_GOAL),
    []
  );

  const cashFlow = useMemo(() => buildCashFlow(MOCK_ENTRIES, 14), []);
  const topProducts = useMemo(() => getTopProducts(MOCK_SALES, 5), []);
  const lowStock = useMemo(() => MOCK_PRODUCTS.filter(p => p.isActive && p.stock <= p.minStock), []);

  const recentSales = useMemo(
    () => [...MOCK_SALES].sort((a, b) => b.soldAt.getTime() - a.soldAt.getTime()).slice(0, 5),
    []
  );

  const upcomingBills = useMemo(
    () =>
      MOCK_ENTRIES
        .filter(e => e.status === "pending")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5),
    []
  );

  const maxFlow = Math.max(...cashFlow.map(p => Math.max(p.inflow, p.outflow)), 1);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] leading-tight">TechDistribuida ERP</p>
                <p className="text-xs text-[var(--text-muted)]">Novembro 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="badge badge-success flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--text-success)]" aria-hidden="true" />
                Dados atualizados
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ============ Métricas principais ============ */}
        <section aria-label="Métricas principais">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Receita */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-muted)]">Receita do Mês</p>
                <DollarSign className="w-4 h-4 text-[var(--brand-cyan)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(metrics.revenueMonth)}</p>
              <p className={clsx("text-xs mt-1 flex items-center gap-1", metrics.revenueGrowth >= 0 ? "text-[var(--text-success)]" : "text-[var(--text-danger)]")}>
                {metrics.revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(metrics.revenueGrowth)} vs. mês anterior
              </p>
            </div>

            {/* Ticket médio */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-muted)]">Ticket Médio</p>
                <ShoppingBag className="w-4 h-4 text-[var(--brand-amber)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(metrics.averageTicket)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{metrics.salesCount} vendas no mês</p>
            </div>

            {/* A receber */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-muted)]">A Receber</p>
                <Wallet className="w-4 h-4 text-[var(--text-success)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(metrics.receivablePending)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{upcomingBills.filter(e => e.type === "receivable").length} títulos em aberto</p>
            </div>

            {/* A pagar */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-muted)]">A Pagar</p>
                <DollarSign className="w-4 h-4 text-[var(--text-danger)]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(metrics.payablePending)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{upcomingBills.filter(e => e.type === "payable").length} títulos em aberto</p>
            </div>
          </div>
        </section>

        {/* ============ Meta + Fluxo de caixa ============ */}
        <section className="grid lg:grid-cols-3 gap-6" aria-label="Meta e fluxo de caixa">
          {/* Meta do mês */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--brand-amber)]" aria-hidden="true" />
                Meta do Mês
              </h2>
              <span className="badge badge-warning">{metrics.goalProgress}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden mb-3" role="progressbar" aria-valuenow={metrics.goalProgress} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-gradient-to-r from-[var(--brand-amber)] to-[var(--brand-cyan)] rounded-full transition-all"
                style={{ width: `${Math.min(100, metrics.goalProgress)}%` }}
              />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatCurrency(metrics.revenueMonth)} de {formatCurrency(MONTHLY_GOAL)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Faltam {formatCurrency(Math.max(0, MONTHLY_GOAL - metrics.revenueMonth))} para bater a meta
            </p>
          </div>

          {/* Fluxo de caixa (14 dias) */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[var(--brand-cyan)]" aria-hidden="true" />
                Fluxo de Caixa (14 dias)
              </h2>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-[var(--text-success)]"><span className="w-2.5 h-2.5 rounded bg-[var(--text-success)]" /> Entradas</span>
                <span className="flex items-center gap-1 text-[var(--text-danger)]"><span className="w-2.5 h-2.5 rounded bg-[var(--text-danger)]" /> Saídas</span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-36" role="img" aria-label="Gráfico de fluxo de caixa dos últimos 14 dias">
              {cashFlow.map(point => (
                <div key={point.date} className="flex-1 flex flex-col justify-end items-center gap-0.5 group relative" title={`${new Date(point.date).toLocaleDateString("pt-BR")}: +${formatCurrency(point.inflow)} / -${formatCurrency(point.outflow)}`}>
                  <div
                    className="w-full bg-[var(--text-success)]/80 rounded-t-sm min-h-[2px]"
                    style={{ height: `${(point.inflow / maxFlow) * 100}%` }}
                  />
                  <div
                    className="w-full bg-[var(--text-danger)]/70 rounded-b-sm min-h-[2px]"
                    style={{ height: `${(point.outflow / maxFlow) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
              <span>14 dias atrás</span>
              <span>Hoje</span>
            </div>
          </div>
        </section>

        {/* ============ Últimas vendas + Próximos vencimentos ============ */}
        <section className="grid lg:grid-cols-2 gap-6" aria-label="Atividade recente">
          {/* Últimas vendas */}
          <div className="card p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Últimas Vendas</h2>
            <ul className="divide-y divide-[var(--border-default)]">
              {recentSales.map(sale => {
                const customer = MOCK_CUSTOMERS.find(c => c.id === sale.customerId);
                return (
                  <li key={sale.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        <span className="font-mono text-xs text-[var(--text-muted)] mr-2">{sale.saleNumber}</span>
                        {customer?.tradeName || customer?.name || "Cliente"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {sale.items.length} item(ns) • {sale.installments}x • {new Date(sale.soldAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--brand-cyan)] text-sm whitespace-nowrap">{formatCurrency(sale.total)}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Próximos vencimentos */}
          <div className="card p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Próximos Vencimentos</h2>
            <ul className="divide-y divide-[var(--border-default)]">
              {upcomingBills.map(entry => {
                const days = Math.ceil((new Date(entry.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <li key={entry.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                        <span className={clsx("badge text-xs", entry.type === "receivable" ? "badge-success" : "badge-danger")}>
                          {entry.type === "receivable" ? "Receber" : "Pagar"}
                        </span>
                        <span className="truncate">{entry.description}</span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Vence em {new Date(entry.dueDate).toLocaleDateString("pt-BR")}
                        {days < 0 && <span className="text-[var(--text-danger)] font-medium"> ({Math.abs(days)}d atrasado)</span>}
                        {days >= 0 && days <= 3 && <span className="text-[var(--text-warning)] font-medium"> (em {days}d)</span>}
                      </p>
                    </div>
                    <p className={clsx("font-semibold text-sm whitespace-nowrap", entry.type === "receivable" ? "text-[var(--text-success)]" : "text-[var(--text-danger)]")}>
                      {formatCurrency(entry.amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ============ Top produtos + Estoque crítico ============ */}
        <section className="grid lg:grid-cols-2 gap-6" aria-label="Produtos e estoque">
          <div className="card p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Produtos Mais Vendidos</h2>
            <ul className="divide-y divide-[var(--border-default)]">
              {topProducts.map((p, i) => (
                <li key={p.productId} className="py-3 flex items-center gap-3">
                  <span className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    i === 0 ? "bg-[var(--brand-amber)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.productName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.quantity} unidades vendidas</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--brand-cyan)]">{formatCurrency(p.revenue)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[var(--text-warning)]" aria-hidden="true" />
              Estoque Crítico ({lowStock.length})
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">Todos os produtos com estoque saudável ✅</p>
            ) : (
              <ul className="divide-y divide-[var(--border-default)]">
                {lowStock.map(product => {
                  const status = getStockStatus(product);
                  return (
                    <li key={product.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{product.name}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono">{product.sku}</p>
                      </div>
                      <span className={clsx(
                        "badge text-xs",
                        status.level === "out" ? "badge-danger" : "badge-warning"
                      )}>
                        {product.stock} un.
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ============ Footer ============ */}
        <footer className="text-center text-xs text-[var(--text-muted)] py-6 border-t border-[var(--border-default)]">
          Powered by Nexis Digital • Gestão Empresarial
        </footer>
      </main>
    </div>
  );
}
