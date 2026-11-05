"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  FileText,
  FolderTree,
  Settings,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Download,
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
  AdminEditorModalField,
  useAdminToast,
} from "@nexis/ui/admin";
import {
  formatCurrency,
  getProductStatusLabel,
  getQuoteStatusLabel,
} from "../utils/helpers";
import { clsx } from "clsx";

// =========================================================
// Mock data
// =========================================================

const MOCK_PRODUCTS = [
  { id: "p1", sku: "FER-PARA-001", name: "Parafusadeira de Impacto 20V", category: "ferramentas", brand: "ForceTool", price: 54900, stock: 34, status: "active", views: 1240, quotes: 86 },
  { id: "p2", sku: "ELE-CAB-25", name: "Cabo Flexível 2.5mm² 100m", category: "eletrica", brand: "CobreMax", price: 18900, stock: 120, status: "active", views: 890, quotes: 143 },
  { id: "p3", sku: "HID-TUB-100", name: "Tubo PVC Soldável 100mm", category: "hidraulica", brand: "Amanco", price: 6900, stock: 240, status: "active", views: 445, quotes: 98 },
  { id: "p4", sku: "CON-CIM-50", name: "Cimento CP-II-Z 50kg", category: "construcao", brand: "Votoran", price: 3450, stock: 480, status: "active", views: 2100, quotes: 320 },
  { id: "p5", sku: "EPI-CAP-AB", name: "Capacete de Segurança", category: "epi", brand: "3M", price: 2890, stock: 8, status: "active", views: 670, quotes: 54 },
  { id: "p6", sku: "FER-MAK-002", name: "Serra Circular Makita", category: "ferramentas", brand: "Makita", price: 89900, stock: 0, status: "out_of_stock", views: 980, quotes: 41 },
];

const MOCK_CATEGORIES = [
  { id: "c1", name: "Ferramentas", slug: "ferramentas", icon: "🔧", count: 42 },
  { id: "c2", name: "Elétrica", slug: "eletrica", icon: "⚡", count: 38 },
  { id: "c3", name: "Hidráulica", slug: "hidraulica", icon: "🚰", count: 27 },
  { id: "c4", name: "Construção", slug: "construcao", icon: "🧱", count: 64 },
  { id: "c5", name: "EPI", slug: "epi", icon: "⛑️", count: 19 },
];

const MOCK_QUOTES = [
  { id: "q1", number: "QT26-40213", customer: "Construtora Alvorada", email: "compras@alvorada.com.br", items: 5, total: 189400, status: "new", time: "há 2h" },
  { id: "q2", number: "QT26-40212", customer: "Eletricista ME", email: "joao@eletrica.com", items: 3, total: 56700, status: "quoted", time: "há 1d" },
  { id: "q3", number: "QT26-40208", customer: "Marcenaria Silva", email: "silva@marcenaria.com", items: 8, total: 312500, status: "won", time: "há 3d" },
  { id: "q4", number: "QT26-40205", customer: "Prefeitura Municipal", email: "lic@prefeitura.gov.br", items: 12, total: 892000, status: "sent", time: "há 5d" },
  { id: "q5", number: "QT26-40199", customer: "Rafael Autopeças", email: "rafael@autopecas.com", items: 2, total: 9780, status: "lost", time: "há 1s" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-outline",
  active: "badge-success",
  discontinued: "badge-danger",
  out_of_stock: "badge-warning",
  new: "badge-info",
  sent: "badge-outline",
  quoted: "badge-warning",
  won: "badge-success",
  lost: "badge-danger",
  expired: "badge-outline",
};

// =========================================================
// Layout
// =========================================================

export default function CatalogoAdmin() {
  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-5 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" />Produtos</TabsTrigger>
          <TabsTrigger value="quotes"><FileText className="w-4 h-4 mr-2" />Orçamentos</TabsTrigger>
          <TabsTrigger value="categories"><FolderTree className="w-4 h-4 mr-2" />Categorias</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6"><DashboardTab /></TabsContent>
        <TabsContent value="products" className="p-6"><ProductsTab /></TabsContent>
        <TabsContent value="quotes" className="p-6"><QuotesTab /></TabsContent>
        <TabsContent value="categories" className="p-6"><CategoriesTab /></TabsContent>
        <TabsContent value="settings" className="p-6"><SettingsTab /></TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}

// =========================================================
// Dashboard
// =========================================================

function DashboardTab() {
  const totalQuotesValue = MOCK_QUOTES.reduce((s, q) => s + q.total, 0);
  const wonQuotes = MOCK_QUOTES.filter(q => q.status === "won").length;
  const conversionRate = Math.round((wonQuotes / MOCK_QUOTES.length) * 100);
  const topProducts = [...MOCK_PRODUCTS].sort((a, b) => b.quotes - a.quotes).slice(0, 5);

  const stats = [
    { label: "Produtos Ativos", value: String(MOCK_PRODUCTS.filter(p => p.status === "active").length), icon: "📦", color: "var(--brand-cyan)" },
    { label: "Orçamentos no Mês", value: String(MOCK_QUOTES.length), icon: "📨", color: "var(--text-success)" },
    { label: "Valor em Orçamentos", value: formatCurrency(totalQuotesValue), icon: "💰", color: "var(--brand-amber)" },
    { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: "🎯", color: "var(--text-primary)" },
    { label: "Downloads de PDF", value: "342", icon: "📥", color: "var(--text-secondary)" },
    { label: "Estoque Crítico", value: "2", icon: "⚠️", color: "var(--text-warning)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard — Ferreira & Lima</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <AdminSection key={i} className="card p-4 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
          </AdminSection>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminSection title="Orçamentos Recentes" icon={FileText} className="card">
          <AdminTable
            columns={[
              { key: "number", header: "Nº", width: "w-28", render: (q: any) => <span className="font-mono text-xs">{q.number}</span> },
              { key: "customer", header: "Cliente" },
              { key: "total", header: "Valor", width: "w-28", render: (q: any) => formatCurrency(q.total) },
              { key: "status", header: "Status", width: "w-28", render: (q: any) => (
                <span className={clsx("badge px-2 py-1", STATUS_BADGE[q.status])}>{getQuoteStatusLabel(q.status)}</span>
              )},
            ]}
            data={MOCK_QUOTES.slice(0, 4)}
            emptyMessage="Nenhum orçamento ainda"
          />
        </AdminSection>

        <AdminSection title="Produtos Mais Orçados" icon={TrendingUp} className="card">
          <ul className="divide-y divide-[var(--border-default)]">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 ? "bg-[var(--brand-amber)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--brand-cyan)]">{p.quotes}</p>
                  <p className="text-xs text-[var(--text-muted)]">orçamentos</p>
                </div>
              </li>
            ))}
          </ul>
        </AdminSection>
      </div>
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_PRODUCTS)[0] | null>(null);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setProducts(prev => prev.map(p => (p.id === editing.id ? { ...p, ...data } : p)));
      toast({ title: "Produto atualizado", description: data.name, variant: "success" });
    } else {
      setProducts(prev => [{ ...data, id: `p-${Date.now()}`, views: 0, quotes: 0 }, ...prev]);
      toast({ title: "Produto criado", description: data.name, variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Produto removido", variant: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Produtos</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Novo Produto
        </AdminButton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-52">
          <AdminInput placeholder="Buscar por nome, SKU ou marca..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
        </div>
        <div className="w-48">
          <AdminSelect
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
            options={[
              { value: "all", label: "Todas as categorias" },
              ...MOCK_CATEGORIES.map(c => ({ value: c.slug, label: c.name })),
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Produto", render: (p: any) => (
              <div>
                <p className="font-medium text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)] font-mono">{p.sku} • {p.brand}</p>
              </div>
            )},
            { key: "category", header: "Categoria", width: "w-32", render: (p: any) => MOCK_CATEGORIES.find(c => c.slug === p.category)?.name || p.category },
            { key: "price", header: "Preço", width: "w-24", render: (p: any) => formatCurrency(p.price) },
            { key: "stock", header: "Estoque", width: "w-20", render: (p: any) => (
              <span className={clsx(
                p.stock === 0 ? "text-[var(--text-danger)] font-medium" : p.stock <= 10 ? "text-[var(--text-warning)]" : "text-[var(--text-secondary)]"
              )}>
                {p.stock}
              </span>
            )},
            { key: "views", header: "Visitas", width: "w-20" },
            { key: "status", header: "Status", width: "w-32", render: (p: any) => (
              <span className={clsx("badge px-2 py-1", STATUS_BADGE[p.status])}>{getProductStatusLabel(p.status)}</span>
            )},
            { key: "actions", header: "", width: "w-24", render: (p: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(p); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${p.name}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${p.name}`}>
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
          { name: "brand", label: "Marca", type: "text", defaultValue: editing?.brand },
          { name: "category", label: "Categoria", type: "select", required: true, defaultValue: editing?.category ?? "ferramentas",
            options: MOCK_CATEGORIES.map(c => ({ value: c.slug, label: c.name })) },
          { name: "price", label: "Preço (centavos)", type: "number", required: true, defaultValue: editing?.price },
          { name: "stock", label: "Estoque", type: "number", defaultValue: editing?.stock ?? 0 },
          { name: "status", label: "Status", type: "select", defaultValue: editing?.status ?? "active",
            options: [
              { value: "draft", label: "Rascunho" },
              { value: "active", label: "Ativo" },
              { value: "out_of_stock", label: "Sem estoque" },
              { value: "discontinued", label: "Descontinuado" },
            ]},
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Orçamentos
// =========================================================

function QuotesTab() {
  const { toast } = useAdminToast();
  const [quotes, setQuotes] = useState(MOCK_QUOTES);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return quotes.filter(q => statusFilter === "all" || q.status === statusFilter);
  }, [quotes, statusFilter]);

  const updateStatus = (id: string, status: string) => {
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, status } : q)));
    toast({ title: "Status atualizado", variant: "success" });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Orçamentos</h2>

      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <AdminSelect
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todos os status" },
              { value: "new", label: "Novos" },
              { value: "sent", label: "Enviados" },
              { value: "quoted", label: "Orçados" },
              { value: "won", label: "Ganhos" },
              { value: "lost", label: "Perdidos" },
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "number", header: "Nº", width: "w-28", render: (q: any) => <span className="font-mono text-xs">{q.number}</span> },
            { key: "customer", header: "Cliente", render: (q: any) => (
              <div>
                <p className="font-medium text-[var(--text-primary)]">{q.customer}</p>
                <p className="text-xs text-[var(--text-muted)]">{q.email}</p>
              </div>
            )},
            { key: "items", header: "Itens", width: "w-16" },
            { key: "total", header: "Valor", width: "w-28", render: (q: any) => formatCurrency(q.total) },
            { key: "time", header: "Recebido", width: "w-24", render: (q: any) => <span className="text-xs text-[var(--text-muted)]">{q.time}</span> },
            { key: "status", header: "Status", width: "w-32", render: (q: any) => (
              <select
                value={q.status}
                onChange={e => updateStatus(q.id, e.target.value)}
                className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded px-2 py-1 text-[var(--text-primary)]"
                aria-label={`Status de ${q.number}`}
              >
                <option value="new">Novo</option>
                <option value="sent">Enviado</option>
                <option value="quoted">Orçado</option>
                <option value="won">Ganho</option>
                <option value="lost">Perdido</option>
              </select>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum orçamento encontrado"
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Categorias
// =========================================================

function CategoriesTab() {
  const { toast } = useAdminToast();
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_CATEGORIES)[0] | null>(null);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setCategories(prev => prev.map(c => (c.id === editing.id ? { ...c, ...data } : c)));
      toast({ title: "Categoria atualizada", variant: "success" });
    } else {
      setCategories(prev => [...prev, { ...data, id: `c-${Date.now()}` }]);
      toast({ title: "Categoria criada", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Categorias</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Nova Categoria
        </AdminButton>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "icon", header: "", width: "w-14", render: (c: any) => <span className="text-xl">{c.icon}</span> },
            { key: "name", header: "Nome" },
            { key: "slug", header: "Slug", render: (c: any) => <span className="font-mono text-xs text-[var(--text-muted)]">{c.slug}</span> },
            { key: "count", header: "Produtos", width: "w-24" },
            { key: "actions", header: "", width: "w-24", render: (c: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${c.name}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setCategories(prev => prev.filter(x => x.id !== c.id)); toast({ title: "Categoria removida" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${c.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={categories}
          emptyMessage="Nenhuma categoria"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Categoria" : "Nova Categoria"}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true, defaultValue: editing?.name },
          { name: "slug", label: "Slug (URL)", type: "text", required: true, defaultValue: editing?.slug },
          { name: "icon", label: "Emoji/Ícone", type: "text", defaultValue: editing?.icon ?? "📦" },
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
    companyName: "Ferreira & Lima Distribuidora",
    contactEmail: "vendas@ferreiralima.com.br",
    contactPhone: "(11) 3344-5566",
    showPrices: true,
    quoteMode: "optional",
    quoteResponseHours: 24,
    minQuoteValue: 50000,
  });

  const switchStyle = (key: keyof typeof config, label: string, description?: string) => (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-muted)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
      </div>
      <AdminSwitch
        value={config[key] ? "on" : "off"}
        onChange={(v: string) => setConfig(prev => ({ ...prev, [key]: v === "on" }))}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h2>

      <AdminSection title="Identidade" icon={Settings} className="card p-5 space-y-4">
        <AdminField label="Nome da empresa">
          <AdminInput value={config.companyName} onChange={(e: any) => setConfig(prev => ({ ...prev, companyName: e.target.value }))} />
        </AdminField>
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="Email de vendas">
            <AdminInput value={config.contactEmail} onChange={(e: any) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))} />
          </AdminField>
          <AdminField label="Telefone">
            <AdminInput value={config.contactPhone} onChange={(e: any) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="Preços e Orçamentos" icon={FileText} className="card p-5 space-y-4">
        {switchStyle("showPrices", "Exibir preços no catálogo", "Desative para catálogo apenas sob consulta")}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <AdminField label="Modo de orçamento">
            <AdminSelect
              value={config.quoteMode}
              onChange={(e: any) => setConfig(prev => ({ ...prev, quoteMode: e.target.value }))}
              options={[
                { value: "disabled", label: "Desativado" },
                { value: "optional", label: "Opcional" },
                { value: "required", label: "Somente orçamento" },
              ]}
            />
          </AdminField>
          <AdminField label="Prazo de resposta (horas)">
            <AdminInput type="number" value={String(config.quoteResponseHours)} onChange={(e: any) => setConfig(prev => ({ ...prev, quoteResponseHours: Number(e.target.value) }))} />
          </AdminField>
          <AdminField label="Valor mínimo p/ orçamento (centavos)">
            <AdminInput type="number" value={String(config.minQuoteValue)} onChange={(e: any) => setConfig(prev => ({ ...prev, minQuoteValue: Number(e.target.value) }))} />
          </AdminField>
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
