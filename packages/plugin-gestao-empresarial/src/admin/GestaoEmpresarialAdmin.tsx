"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Download,
  Check,
  X,
} from "lucide-react";
import {
  AdminPageLayout,
  AdminSection,
  AdminTable,
  AdminTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminSwitch,
  AdminField,
  AdminEditorModal,
  useAdminToast,
} from "@nexis/ui/admin";
import {
  formatCurrency,
  formatDate,
  formatDocument,
  getSaleStatusLabel,
  getSaleStatusBadge,
  getEntryStatusLabel,
  getEntryStatusBadge,
  getPaymentMethodLabel,
  getStockStatus,
  calculateMargin,
  calculateDashboardMetrics,
} from "../utils/helpers";
import { clsx } from "clsx";

// =========================================================
// Mock data (mesmos da página pública)
// =========================================================

const MOCK_SALES = [
  { id: "sale-1", saleNumber: "VD-1042", customer: "Tech Paulo", date: "2026-11-01", total: 659600, cost: 420000, method: "credit_card", installments: 3, status: "completed", items: 2 },
  { id: "sale-2", saleNumber: "VD-1041", customer: "Esc. Lima", date: "2026-11-01", total: 749600, cost: 560000, method: "pix", installments: 1, status: "completed", items: 1 },
  { id: "sale-3", saleNumber: "VD-1040", customer: "Clínica Bem Viver", date: "2026-10-31", total: 569400, cost: 330000, method: "boleto", installments: 2, status: "completed", items: 2 },
  { id: "sale-4", saleNumber: "VD-1039", customer: "Tech Paulo", date: "2026-10-30", total: 159000, cost: 80000, method: "pix", installments: 1, status: "completed", items: 1 },
  { id: "sale-5", saleNumber: "VD-1038", customer: "Autopeças Rocha", date: "2026-10-29", total: 289900, cost: 210000, method: "transfer", installments: 1, status: "completed", items: 1 },
];

const MOCK_CUSTOMERS = [
  { id: "c1", type: "company", name: "Tecnologia Paulo LTDA", tradeName: "Tech Paulo", document: "12345678000190", email: "compras@techpaulo.com.br", phone: "(11) 3322-1010", creditLimit: 1000000, paymentTermDays: 30, isActive: true },
  { id: "c2", type: "company", name: "Escritório Lima ME", tradeName: "Esc. Lima", document: "98765432000155", email: "financeiro@escritoriolima.com", phone: "(11) 4433-2020", creditLimit: 500000, paymentTermDays: 15, isActive: true },
  { id: "c3", type: "company", name: "Clínica Bem Viver", tradeName: "", document: "11223344000122", email: "adm@bemviver.com.br", phone: "(11) 5566-3030", creditLimit: 800000, paymentTermDays: 30, isActive: true },
  { id: "c4", type: "company", name: "Autopeças Rocha LTDA", tradeName: "Rocha Autopeças", document: "55667788000133", email: "rocha@autopecas.com.br", phone: "(11) 6677-4040", creditLimit: 300000, paymentTermDays: 20, isActive: true },
];

const MOCK_PRODUCTS = [
  { id: "p1", sku: "NB-DELL-I15", name: "Notebook Dell Inspiron 15", category: "Informática", costPrice: 210000, salePrice: 289900, stock: 4, minStock: 3, unit: "un", isActive: true },
  { id: "p2", sku: "MON-LG-27", name: 'Monitor LG 27" 4K', category: "Informática", costPrice: 140000, salePrice: 189900, stock: 9, minStock: 4, unit: "un", isActive: true },
  { id: "p3", sku: "CAD-ERGO-PRO", name: "Cadeira Ergonômica Pro", category: "Mobiliário", costPrice: 85000, salePrice: 129900, stock: 2, minStock: 5, unit: "un", isActive: true },
  { id: "p4", sku: "HUB-USBC-7", name: "Hub USB-C 7 em 1", category: "Acessórios", costPrice: 8000, salePrice: 15900, stock: 42, minStock: 10, unit: "un", isActive: true },
  { id: "p5", sku: "MOU-MX-3S", name: "Mouse Logitech MX Master 3S", category: "Acessórios", costPrice: 32000, salePrice: 49900, stock: 0, minStock: 5, unit: "un", isActive: true },
  { id: "p6", sku: "TEC-KC-K3", name: "Teclado Mecânico Keychron K3", category: "Acessórios", costPrice: 38000, salePrice: 59900, stock: 11, minStock: 5, unit: "un", isActive: true },
];

const MOCK_ENTRIES = [
  { id: "f1", type: "receivable", description: "VD-1042 — Tech Paulo (cartão 3x)", category: "Vendas", amount: 659600, dueDate: "2026-11-28", paidAt: null, status: "pending", method: null },
  { id: "f2", type: "receivable", description: "VD-1041 — Esc. Lima (PIX)", category: "Vendas", amount: 749600, dueDate: "2026-11-01", paidAt: "2026-11-01", status: "paid", method: "pix" },
  { id: "f3", type: "receivable", description: "VD-1040 — Clínica Bem Viver (boleto 2x)", category: "Vendas", amount: 569400, dueDate: "2026-11-15", paidAt: null, status: "pending", method: null },
  { id: "f4", type: "payable", description: "Aluguel do escritório", category: "Despesas Fixas", amount: 350000, dueDate: "2026-11-05", paidAt: null, status: "pending", method: null },
  { id: "f5", type: "payable", description: "Reposição de estoque — Dell", category: "Fornecedores", amount: 890000, dueDate: "2026-10-28", paidAt: null, status: "pending", method: null },
  { id: "f6", type: "payable", description: "Energia elétrica", category: "Despesas Fixas", amount: 48500, dueDate: "2026-10-25", paidAt: "2026-10-24", status: "paid", method: "boleto" },
];

const MONTHLY_GOAL = 300000000;

// =========================================================
// Layout
// =========================================================

export default function GestaoEmpresarialAdmin() {
  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-6 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="sales"><ShoppingCart className="w-4 h-4 mr-2" />Vendas</TabsTrigger>
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" />Produtos</TabsTrigger>
          <TabsTrigger value="customers"><Users className="w-4 h-4 mr-2" />Clientes</TabsTrigger>
          <TabsTrigger value="finance"><Wallet className="w-4 h-4 mr-2" />Financeiro</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6"><DashboardTab /></TabsContent>
        <TabsContent value="sales" className="p-6"><SalesTab /></TabsContent>
        <TabsContent value="products" className="p-6"><ProductsTab /></TabsContent>
        <TabsContent value="customers" className="p-6"><CustomersTab /></TabsContent>
        <TabsContent value="finance" className="p-6"><FinanceTab /></TabsContent>
        <TabsContent value="settings" className="p-6"><SettingsTab /></TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}

// =========================================================
// Dashboard
// =========================================================

function DashboardTab() {
  const metrics = useMemo(
    () =>
      calculateDashboardMetrics(
        MOCK_SALES.map(s => ({ ...s, soldAt: new Date(s.date), createdAt: new Date(s.date), updatedAt: new Date(s.date) })),
        MOCK_ENTRIES.map(e => ({ ...e, dueDate: new Date(e.dueDate), paidAt: e.paidAt ? new Date(e.paidAt) : null, createdAt: new Date(e.dueDate), updatedAt: new Date(e.dueDate) })),
        MOCK_PRODUCTS.map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() })),
        MONTHLY_GOAL
      ),
    []
  );

  const lowStock = MOCK_PRODUCTS.filter(p => p.stock <= p.minStock);

  const stats = [
    { label: "Receita do Mês", value: formatCurrency(metrics.revenueMonth), icon: "💰", color: "var(--brand-cyan)" },
    { label: "Vendas no Mês", value: String(metrics.salesCount), icon: "🛒", color: "var(--text-success)" },
    { label: "Ticket Médio", value: formatCurrency(metrics.averageTicket), icon: "🎯", color: "var(--brand-amber)" },
    { label: "A Receber", value: formatCurrency(metrics.receivablePending), icon: "📥", color: "var(--text-primary)" },
    { label: "A Pagar", value: formatCurrency(metrics.payablePending), icon: "📤", color: "var(--text-danger)" },
    { label: "Estoque Crítico", value: String(metrics.lowStockCount), icon: "⚠️", color: "var(--text-warning)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard — TechDistribuida</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <AdminSection key={i} className="card p-4 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
          </AdminSection>
        ))}
      </div>

      {/* Meta */}
      <AdminSection title="Progresso da Meta Mensal" className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--brand-amber)] to-[var(--brand-cyan)] rounded-full"
                style={{ width: `${Math.min(100, metrics.goalProgress)}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-[var(--brand-amber)]">{metrics.goalProgress}%</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          {formatCurrency(metrics.revenueMonth)} de {formatCurrency(MONTHLY_GOAL)}
        </p>
      </AdminSection>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminSection title="Estoque Crítico" className="card">
          {lowStock.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">Nenhum produto abaixo do mínimo ✅</p>
          ) : (
            <AdminTable
              columns={[
                { key: "name", header: "Produto" },
                { key: "sku", header: "SKU", render: (p: any) => <span className="font-mono text-xs">{p.sku}</span> },
                { key: "stock", header: "Atual", width: "w-16", render: (p: any) => (
                  <span className={clsx("font-medium", p.stock === 0 ? "text-[var(--text-danger)]" : "text-[var(--text-warning)]")}>{p.stock}</span>
                )},
                { key: "minStock", header: "Mín.", width: "w-16", render: (p: any) => <span className="text-[var(--text-muted)]">{p.minStock}</span> },
              ]}
              data={lowStock}
              emptyMessage="Nada crítico"
            />
          )}
        </AdminSection>

        <AdminSection title="Últimas Vendas" className="card">
          <AdminTable
            columns={[
              { key: "saleNumber", header: "Nº", width: "w-24", render: (s: any) => <span className="font-mono text-xs">{s.saleNumber}</span> },
              { key: "customer", header: "Cliente" },
              { key: "total", header: "Total", width: "w-28", render: (s: any) => formatCurrency(s.total) },
              { key: "status", header: "Status", width: "w-28", render: (s: any) => (
                <span className={clsx("badge px-2 py-1", getSaleStatusBadge(s.status))}>{getSaleStatusLabel(s.status)}</span>
              )},
            ]}
            data={MOCK_SALES.slice(0, 4)}
            emptyMessage="Nenhuma venda"
          />
        </AdminSection>
      </div>
    </div>
  );
}

// =========================================================
// Vendas
// =========================================================

function SalesTab() {
  const { toast } = useAdminToast();
  const [sales, setSales] = useState(MOCK_SALES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return sales.filter(s => {
      const matchSearch = !search ||
        s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customer.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sales, search, statusFilter]);

  const totalFiltered = filtered.reduce((s, sale) => s + sale.total, 0);
  const totalProfit = filtered.reduce((s, sale) => s + (sale.total - sale.cost), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Vendas</h2>
        <AdminButton icon={Plus} onClick={() => toast({ title: "PDV (frente de caixa): em produção abre o módulo de nova venda", variant: "success" })}>
          Nova Venda
        </AdminButton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-52">
          <AdminInput placeholder="Buscar por número ou cliente..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
        </div>
        <div className="w-44">
          <AdminSelect
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todos os status" },
              { value: "completed", label: "Concluídas" },
              { value: "canceled", label: "Canceladas" },
            ]}
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="grid sm:grid-cols-3 gap-4">
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Vendas filtradas</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{filtered.length}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Receita</p>
          <p className="text-xl font-bold text-[var(--brand-cyan)]">{formatCurrency(totalFiltered)}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Lucro bruto</p>
          <p className="text-xl font-bold text-[var(--text-success)]">{formatCurrency(totalProfit)}</p>
        </AdminSection>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "saleNumber", header: "Nº", width: "w-24", render: (s: any) => <span className="font-mono text-xs">{s.saleNumber}</span> },
            { key: "customer", header: "Cliente" },
            { key: "date", header: "Data", width: "w-24", render: (s: any) => formatDate(s.date) },
            { key: "items", header: "Itens", width: "w-16" },
            { key: "total", header: "Total", width: "w-28", render: (s: any) => formatCurrency(s.total) },
            { key: "profit", header: "Lucro", width: "w-28", render: (s: any) => (
              <span className="text-[var(--text-success)]">{formatCurrency(s.total - s.cost)}</span>
            )},
            { key: "method", header: "Pagamento", width: "w-32", render: (s: any) => (
              <span className="text-xs">{getPaymentMethodLabel(s.method)} {s.installments > 1 && `(${s.installments}x)`}</span>
            )},
            { key: "status", header: "Status", width: "w-28", render: (s: any) => (
              <span className={clsx("badge px-2 py-1", getSaleStatusBadge(s.status))}>{getSaleStatusLabel(s.status)}</span>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhuma venda encontrada"
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Produtos
// =========================================================

function ProductsTab() {
  const { toast } = useAdminToast();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_PRODUCTS)[0] | null>(null);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleSave = (data: Record<string, any>) => {
    const normalized = {
      ...data,
      costPrice: Number(data.costPrice),
      salePrice: Number(data.salePrice),
      stock: Number(data.stock),
      minStock: Number(data.minStock),
    };
    if (editing) {
      setProducts(prev => prev.map(p => (p.id === editing.id ? { ...p, ...normalized } : p)));
      toast({ title: "Produto atualizado", variant: "success" });
    } else {
      setProducts(prev => [{ ...normalized, id: `p-${Date.now()}` }, ...prev]);
      toast({ title: "Produto criado", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Produtos</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Novo Produto
        </AdminButton>
      </div>

      <div className="flex-1 min-w-52 max-w-md">
        <AdminInput placeholder="Buscar por nome, SKU ou categoria..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Produto", render: (p: any) => (
              <div>
                <p className="font-medium text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)] font-mono">{p.sku} • {p.category}</p>
              </div>
            )},
            { key: "costPrice", header: "Custo", width: "w-24", render: (p: any) => formatCurrency(p.costPrice) },
            { key: "salePrice", header: "Venda", width: "w-24", render: (p: any) => formatCurrency(p.salePrice) },
            { key: "margin", header: "Margem", width: "w-20", render: (p: any) => (
              <span className={calculateMargin(p.costPrice, p.salePrice) >= 30 ? "text-[var(--text-success)]" : "text-[var(--text-warning)]"}>
                {calculateMargin(p.costPrice, p.salePrice).toFixed(0)}%
              </span>
            )},
            { key: "stock", header: "Estoque", width: "w-24", render: (p: any) => {
              const status = getStockStatus(p);
              return (
                <span className={clsx("font-medium", status.level === "out" ? "text-[var(--text-danger)]" : status.level === "low" ? "text-[var(--text-warning)]" : "text-[var(--text-secondary)]")}>
                  {p.stock} {p.unit}
                </span>
              );
            }},
            { key: "actions", header: "", width: "w-24", render: (p: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${p.name}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setProducts(prev => prev.filter(x => x.id !== p.id)); toast({ title: "Produto removido" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${p.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum produto encontrado"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Produto" : "Novo Produto"}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true, defaultValue: editing?.name },
          { name: "sku", label: "SKU", type: "text", required: true, defaultValue: editing?.sku },
          { name: "category", label: "Categoria", type: "text", required: true, defaultValue: editing?.category ?? "Geral" },
          { name: "costPrice", label: "Preço de custo (centavos)", type: "number", required: true, defaultValue: editing?.costPrice },
          { name: "salePrice", label: "Preço de venda (centavos)", type: "number", required: true, defaultValue: editing?.salePrice },
          { name: "stock", label: "Estoque atual", type: "number", defaultValue: editing?.stock ?? 0 },
          { name: "minStock", label: "Estoque mínimo", type: "number", defaultValue: editing?.minStock ?? 5 },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Clientes
// =========================================================

function CustomersTab() {
  const { toast } = useAdminToast();
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_CUSTOMERS)[0] | null>(null);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.tradeName?.toLowerCase().includes(q) ||
      c.document.includes(q.replace(/\D/g, ""))
    );
  }, [customers, search]);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setCustomers(prev => prev.map(c => (c.id === editing.id ? { ...c, ...data } : c)));
      toast({ title: "Cliente atualizado", variant: "success" });
    } else {
      setCustomers(prev => [...prev, { ...data, id: `c-${Date.now()}`, isActive: true }]);
      toast({ title: "Cliente criado", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Clientes</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Novo Cliente
        </AdminButton>
      </div>

      <div className="max-w-md">
        <AdminInput placeholder="Buscar por nome ou CNPJ/CPF..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Cliente", render: (c: any) => (
              <div>
                <p className="font-medium text-[var(--text-primary)]">{c.tradeName || c.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{c.name !== c.tradeName && c.tradeName ? c.name : formatDocument(c.document)}</p>
              </div>
            )},
            { key: "document", header: "CNPJ/CPF", width: "w-40", render: (c: any) => formatDocument(c.document) },
            { key: "email", header: "Email", render: (c: any) => <span className="text-xs">{c.email}</span> },
            { key: "creditLimit", header: "Limite", width: "w-28", render: (c: any) => formatCurrency(c.creditLimit) },
            { key: "paymentTermDays", header: "Prazo", width: "w-20", render: (c: any) => `${c.paymentTermDays}d` },
            { key: "actions", header: "", width: "w-24", render: (c: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${c.name}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setCustomers(prev => prev.filter(x => x.id !== c.id)); toast({ title: "Cliente removido" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${c.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum cliente encontrado"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Cliente" : "Novo Cliente"}
        fields={[
          { name: "name", label: "Razão Social / Nome", type: "text", required: true, defaultValue: editing?.name },
          { name: "tradeName", label: "Nome Fantasia", type: "text", defaultValue: editing?.tradeName ?? "" },
          { name: "document", label: "CNPJ ou CPF (somente números)", type: "text", required: true, defaultValue: editing?.document },
          { name: "email", label: "Email", type: "email", required: true, defaultValue: editing?.email },
          { name: "phone", label: "Telefone", type: "tel", defaultValue: editing?.phone ?? "" },
          { name: "creditLimit", label: "Limite de crédito (centavos)", type: "number", defaultValue: editing?.creditLimit ?? 0 },
          { name: "paymentTermDays", label: "Prazo de pagamento (dias)", type: "number", defaultValue: editing?.paymentTermDays ?? 30 },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Financeiro
// =========================================================

function FinanceTab() {
  const { toast } = useAdminToast();
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchType = typeFilter === "all" || e.type === typeFilter;
      const isOverdueNow = e.status === "pending" && new Date(e.dueDate) < new Date();
      const matchStatus = statusFilter === "all" || e.status === statusFilter || (statusFilter === "overdue" && isOverdueNow);
      return matchType && matchStatus;
    });
  }, [entries, typeFilter, statusFilter]);

  const totals = useMemo(() => {
    const receivable = filtered.filter(e => e.type === "receivable").reduce((s, e) => s + e.amount, 0);
    const payable = filtered.filter(e => e.type === "payable").reduce((s, e) => s + e.amount, 0);
    return { receivable, payable, balance: receivable - payable };
  }, [filtered]);

  const markAsPaid = (id: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, status: "paid" as const, paidAt: new Date().toISOString().slice(0, 10) } : e))
    );
    toast({ title: "Lançamento marcado como pago", variant: "success" });
  };

  const handleSave = (data: Record<string, any>) => {
    setEntries(prev => [
      {
        ...data,
        amount: Number(data.amount),
        dueDate: data.dueDate,
        id: `f-${Date.now()}`,
        status: "pending",
        paidAt: null,
      },
      ...prev,
    ]);
    toast({ title: "Lançamento criado", variant: "success" });
    setEditorOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Financeiro</h2>
        <AdminButton onClick={() => setEditorOpen(true)} icon={Plus}>
          Novo Lançamento
        </AdminButton>
      </div>

      {/* Saldo */}
      <div className="grid sm:grid-cols-3 gap-4">
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">A Receber (filtro)</p>
          <p className="text-xl font-bold text-[var(--text-success)]">{formatCurrency(totals.receivable)}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">A Pagar (filtro)</p>
          <p className="text-xl font-bold text-[var(--text-danger)]">{formatCurrency(totals.payable)}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Saldo</p>
          <p className={clsx("text-xl font-bold", totals.balance >= 0 ? "text-[var(--brand-cyan)]" : "text-[var(--text-danger)]")}>
            {formatCurrency(totals.balance)}
          </p>
        </AdminSection>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <AdminSelect
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "Receber e Pagar" },
              { value: "receivable", label: "A Receber" },
              { value: "payable", label: "A Pagar" },
            ]}
          />
        </div>
        <div className="w-44">
          <AdminSelect
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todos os status" },
              { value: "pending", label: "Pendentes" },
              { value: "overdue", label: "Vencidos" },
              { value: "paid", label: "Pagos" },
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "type", header: "Tipo", width: "w-24", render: (e: any) => (
              <span className={clsx("badge text-xs", e.type === "receivable" ? "badge-success" : "badge-danger")}>
                {e.type === "receivable" ? "Receber" : "Pagar"}
              </span>
            )},
            { key: "description", header: "Descrição" },
            { key: "category", header: "Categoria", width: "w-36", render: (e: any) => <span className="text-xs">{e.category}</span> },
            { key: "amount", header: "Valor", width: "w-28", render: (e: any) => formatCurrency(e.amount) },
            { key: "dueDate", header: "Vencimento", width: "w-28", render: (e: any) => {
              const overdue = e.status === "pending" && new Date(e.dueDate) < new Date();
              return <span className={overdue ? "text-[var(--text-danger)] font-medium" : ""}>{formatDate(e.dueDate)}</span>;
            }},
            { key: "status", header: "Status", width: "w-28", render: (e: any) => (
              <span className={clsx("badge px-2 py-1", getEntryStatusBadge(e.status))}>{getEntryStatusLabel(e.status)}</span>
            )},
            { key: "actions", header: "", width: "w-20", render: (e: any) => (
              e.status === "pending" ? (
                <button onClick={() => markAsPaid(e.id)} className="btn btn-ghost p-1.5 text-[var(--text-success)]" aria-label="Marcar como pago" title="Marcar como pago">
                  <Check className="w-4 h-4" />
                </button>
              ) : null
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum lançamento encontrado"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title="Novo Lançamento"
        fields={[
          { name: "type", label: "Tipo", type: "select", required: true,
            options: [
              { value: "receivable", label: "A Receber" },
              { value: "payable", label: "A Pagar" },
            ]},
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "category", label: "Categoria", type: "text", required: true, defaultValue: "Vendas" },
          { name: "amount", label: "Valor (centavos)", type: "number", required: true },
          { name: "dueDate", label: "Vencimento", type: "date", required: true },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Configurações
// =========================================================

function SettingsTab() {
  const { toast } = useAdminToast();
  const [config, setConfig] = useState({
    companyName: "TechDistribuida LTDA",
    tradeName: "TechDistribuida",
    cnpj: "12345678000190",
    taxRegime: "simples",
    defaultPaymentTerms: 30,
    lowStockAlert: true,
    monthlyGoal: 300000000,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h2>

      <AdminSection title="Dados da Empresa" className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="Razão Social">
            <AdminInput value={config.companyName} onChange={(e: any) => setConfig(prev => ({ ...prev, companyName: e.target.value }))} />
          </AdminField>
          <AdminField label="Nome Fantasia">
            <AdminInput value={config.tradeName} onChange={(e: any) => setConfig(prev => ({ ...prev, tradeName: e.target.value }))} />
          </AdminField>
          <AdminField label="CNPJ">
            <AdminInput value={config.cnpj} onChange={(e: any) => setConfig(prev => ({ ...prev, cnpj: e.target.value }))} />
          </AdminField>
          <AdminField label="Regime Tributário">
            <AdminSelect
              value={config.taxRegime}
              onChange={(e: any) => setConfig(prev => ({ ...prev, taxRegime: e.target.value }))}
              options={[
                { value: "simples", label: "Simples Nacional" },
                { value: "presumido", label: "Lucro Presumido" },
                { value: "real", label: "Lucro Real" },
              ]}
            />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="Operação" className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="Prazo padrão de pagamento (dias)">
            <AdminInput
              type="number"
              value={String(config.defaultPaymentTerms)}
              onChange={(e: any) => setConfig(prev => ({ ...prev, defaultPaymentTerms: Number(e.target.value) }))}
            />
          </AdminField>
          <AdminField label="Meta mensal de vendas (centavos)">
            <AdminInput
              type="number"
              value={String(config.monthlyGoal)}
              onChange={(e: any) => setConfig(prev => ({ ...prev, monthlyGoal: Number(e.target.value) }))}
            />
          </AdminField>
        </div>
        <div className="flex items-center justify-between py-2.5 border-t border-[var(--border-muted)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Alerta de estoque baixo</p>
            <p className="text-xs text-[var(--text-muted)]">Notifica quando produto atinge o mínimo</p>
          </div>
          <AdminSwitch
            value={config.lowStockAlert ? "on" : "off"}
            onChange={(v: string) => setConfig(prev => ({ ...prev, lowStockAlert: v === "on" }))}
          />
        </div>
      </AdminSection>

      <div className="flex justify-end">
        <AdminButton onClick={() => toast({ title: "Configurações salvas", variant: "success" })} variant="primary">
          Salvar Configurações
        </AdminButton>
      </div>
    </div>
  );
}
