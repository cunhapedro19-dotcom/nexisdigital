"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Table2,
  Settings,
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  TrendingUp,
  AlertCircle,
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
import { formatCurrency, formatPreparationTime, getOrderStatusLabel } from "../utils/helpers";
import { clsx } from "clsx";

// =========================================================
// Mock data — substituído por API em produção
// =========================================================

const MOCK_MENU_ITEMS = [
  { id: "item-1", name: "Smash Bacon Duplo", category: "pratos-principais", price: 3290, promo: 2790, prep: 18, status: "AVAILABLE", featured: true, orders: 342 },
  { id: "item-2", name: "Chicken Crispy", category: "pratos-principais", price: 2890, promo: null, prep: 15, status: "AVAILABLE", featured: false, orders: 215 },
  { id: "item-3", name: "Veggie Portobello", category: "pratos-principais", price: 3090, promo: null, prep: 16, status: "AVAILABLE", featured: true, orders: 98 },
  { id: "item-4", name: "Batata Rústica c/ Cheddar", category: "entradas", price: 2490, promo: null, prep: 12, status: "AVAILABLE", featured: false, orders: 187 },
  { id: "item-5", name: "Onion Rings", category: "entradas", price: 1690, promo: null, prep: 10, status: "UNAVAILABLE", featured: false, orders: 76 },
  { id: "item-6", name: "Milkshake Ovomaltine", category: "bebidas", price: 2290, promo: null, prep: 8, status: "AVAILABLE", featured: false, orders: 264 },
  { id: "item-7", name: "Refrigerante Lata", category: "bebidas", price: 690, promo: null, prep: 2, status: "AVAILABLE", featured: false, orders: 512 },
  { id: "item-8", name: "Brownie c/ Sorvete", category: "sobremesas", price: 1890, promo: null, prep: 7, status: "AVAILABLE", featured: false, orders: 143 },
];

const CATEGORY_LABELS: Record<string, string> = {
  entradas: "Entradas",
  "pratos-principais": "Hambúrgueres",
  sobremesas: "Sobremesas",
  bebidas: "Bebidas",
  combos: "Combos",
};

const MOCK_ORDERS = [
  { id: "1", number: "#KX7P2", customer: "Ana Lima", type: "DELIVERY", status: "PREPARING", total: 8770, items: 3, time: "há 12 min" },
  { id: "2", number: "#KX7P1", customer: "Mesa 05", type: "DINE_IN", status: "READY", total: 5480, items: 2, time: "há 25 min" },
  { id: "3", number: "#KX7O9", customer: "Carlos Souza", type: "TAKEAWAY", status: "DELIVERED", total: 3290, items: 1, time: "há 41 min" },
  { id: "4", number: "#KX7O8", customer: "Mesa 02", type: "DINE_IN", status: "SERVED", total: 11980, items: 5, time: "há 52 min" },
  { id: "5", number: "#KX7O7", customer: "Juliana Rocha", type: "DELIVERY", status: "PENDING", total: 6370, items: 2, time: "há 4 min" },
];

const MOCK_TABLES = [
  { id: "1", number: "01", seats: 2, status: "AVAILABLE", currentOrder: null as string | null },
  { id: "2", number: "02", seats: 4, status: "OCCUPIED", currentOrder: "#KX7O8" },
  { id: "3", number: "03", seats: 2, status: "AVAILABLE", currentOrder: null },
  { id: "4", number: "04", seats: 6, status: "RESERVED", currentOrder: null },
  { id: "5", number: "05", seats: 4, status: "OCCUPIED", currentOrder: "#KX7P1" },
  { id: "6", number: "06", seats: 8, status: "AVAILABLE", currentOrder: null },
];

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-warning",
  CONFIRMED: "badge-info",
  PREPARING: "badge-info",
  READY: "badge-success",
  DELIVERED: "badge-success",
  SERVED: "badge-success",
  CANCELLED: "badge-danger",
};

// =========================================================
// Layout principal
// =========================================================

export default function CardapioAdmin() {
  const { toast } = useAdminToast();

  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-5 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="menu"><UtensilsCrossed className="w-4 h-4 mr-2" />Itens do Menu</TabsTrigger>
          <TabsTrigger value="orders"><ClipboardList className="w-4 h-4 mr-2" />Pedidos</TabsTrigger>
          <TabsTrigger value="tables"><Table2 className="w-4 h-4 mr-2" />Mesas</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="menu" className="p-6">
          <MenuTab />
        </TabsContent>
        <TabsContent value="orders" className="p-6">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="tables" className="p-6">
          <TablesTab />
        </TabsContent>
        <TabsContent value="settings" className="p-6">
          <SettingsTab />
        </TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}

// =========================================================
// Dashboard
// =========================================================

function DashboardTab() {
  const activeOrders = MOCK_ORDERS.filter(o => !["DELIVERED", "SERVED", "CANCELLED"].includes(o.status)).length;
  const revenueToday = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
  const topItems = [...MOCK_MENU_ITEMS].sort((a, b) => b.orders - a.orders).slice(0, 5);

  const stats = [
    { label: "Pedidos Hoje", value: "47", icon: "🧾", color: "var(--brand-cyan)" },
    { label: "Receita do Dia", value: formatCurrency(revenueToday), icon: "💰", color: "var(--brand-amber)" },
    { label: "Pedidos Ativos", value: String(activeOrders), icon: "⏱️", color: "var(--text-success)" },
    { label: "Ticket Médio", value: formatCurrency(Math.round(revenueToday / MOCK_ORDERS.length)), icon: "🎯", color: "var(--text-primary)" },
    { label: "Itens no Menu", value: String(MOCK_MENU_ITEMS.length), icon: "📋", color: "var(--text-secondary)" },
    { label: "Mesas Ocupadas", value: "2/6", icon: "🪑", color: "var(--text-warning)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard — Burger House Nexis</h2>

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
        <AdminSection title="Pedidos Recentes" icon={ClipboardList} className="card">
          <AdminTable
            columns={[
              { key: "number", header: "Pedido", width: "w-24" },
              { key: "customer", header: "Cliente" },
              { key: "type", header: "Tipo", width: "w-28", render: (o: any) => (
                <span className="text-xs">{o.type === "DELIVERY" ? "🛵 Entrega" : o.type === "TAKEAWAY" ? "🛍️ Retirada" : "🍽️ Salão"}</span>
              )},
              { key: "status", header: "Status", width: "w-32", render: (o: any) => (
                <span className={clsx("badge px-2 py-1", ORDER_STATUS_BADGE[o.status])}>
                  {getOrderStatusLabel(o.status)}
                </span>
              )},
              { key: "total", header: "Total", width: "w-28", render: (o: any) => formatCurrency(o.total) },
            ]}
            data={MOCK_ORDERS.slice(0, 4)}
            emptyMessage="Nenhum pedido ainda"
          />
        </AdminSection>

        <AdminSection title="Itens Mais Vendidos" icon={TrendingUp} className="card">
          <ul className="divide-y divide-[var(--border-default)]">
            {topItems.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <span className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  i === 0 ? "bg-[var(--brand-amber)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{CATEGORY_LABELS[item.category] || item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--brand-cyan)]">{item.orders}</p>
                  <p className="text-xs text-[var(--text-muted)]">vendas</p>
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
// Itens do Menu
// =========================================================

function MenuTab() {
  const { toast } = useAdminToast();
  const [items, setItems] = useState(MOCK_MENU_ITEMS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_MENU_ITEMS)[0] | null>(null);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || i.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [items, search, categoryFilter]);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setItems(prev => prev.map(i => (i.id === editing.id ? { ...i, ...data } : i)));
      toast({ title: "Item atualizado", description: data.name, variant: "success" });
    } else {
      const newItem = { ...data, id: `item-${Date.now()}`, orders: 0 };
      setItems(prev => [newItem, ...prev]);
      toast({ title: "Item criado", description: data.name, variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: "Item removido", variant: "success" });
  };

  const toggleAvailability = (id: string) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, status: i.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE" }
          : i
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Itens do Menu</h2>
        <AdminButton
          onClick={() => { setEditing(null); setEditorOpen(true); }}
          icon={Plus}
        >
          Novo Item
        </AdminButton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-52">
          <AdminInput
            placeholder="Buscar item..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <AdminSelect
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
            options={[
              { value: "all", label: "Todas as categorias" },
              ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Item" },
            { key: "category", header: "Categoria", width: "w-36", render: (i: any) => CATEGORY_LABELS[i.category] || i.category },
            { key: "price", header: "Preço", width: "w-28", render: (i: any) =>
              i.promo ? (
                <span>
                  <span className="text-xs text-[var(--text-muted)] line-through mr-1">{formatCurrency(i.price)}</span>
                  <span className="font-semibold text-[var(--text-danger)]">{formatCurrency(i.promo)}</span>
                </span>
              ) : formatCurrency(i.price)
            },
            { key: "prep", header: "Preparo", width: "w-24", render: (i: any) => formatPreparationTime(i.prep) },
            { key: "orders", header: "Vendas", width: "w-20" },
            { key: "status", header: "Status", width: "w-36", render: (i: any) => (
              <button
                onClick={() => toggleAvailability(i.id)}
                className={clsx("badge px-2 py-1 cursor-pointer", i.status === "AVAILABLE" ? "badge-success" : "badge-danger")}
                title="Clique para alternar"
              >
                {i.status === "AVAILABLE" ? "Disponível" : "Indisponível"}
              </button>
            )},
            { key: "actions", header: "", width: "w-24", render: (i: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(i); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${i.name}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(i.id)} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${i.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum item encontrado"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Item" : "Novo Item do Menu"}
        fields={[
          { name: "name", label: "Nome do Item", type: "text", required: true, defaultValue: editing?.name },
          { name: "category", label: "Categoria", type: "select", required: true, defaultValue: editing?.category ?? "pratos-principais",
            options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })) },
          { name: "price", label: "Preço (em centavos, ex: 3290)", type: "number", required: true, defaultValue: editing?.price },
          { name: "promo", label: "Preço promocional (centavos, opcional)", type: "number", defaultValue: editing?.promo ?? undefined },
          { name: "prep", label: "Tempo de preparo (min)", type: "number", defaultValue: editing?.prep ?? 15 },
          { name: "featured", label: "Destaque na home", type: "switch", defaultValue: editing?.featured ?? false },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Pedidos
// =========================================================

function OrdersTab() {
  const { toast } = useAdminToast();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !search ||
        o.number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const advanceStatus = (id: string) => {
    const flow: Record<string, string> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "DELIVERED",
    };
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: flow[o.status] || o.status } : o)));
    toast({ title: "Status atualizado", variant: "success" });
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: "CANCELLED" } : o)));
    toast({ title: "Pedido cancelado", variant: "warning" });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Pedidos</h2>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-52">
          <AdminInput
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <AdminSelect
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todos os status" },
              { value: "PENDING", label: "Pendente" },
              { value: "PREPARING", label: "Em preparo" },
              { value: "READY", label: "Pronto" },
              { value: "DELIVERED", label: "Entregue" },
              { value: "CANCELLED", label: "Cancelado" },
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "number", header: "Pedido", width: "w-24", render: (o: any) => <span className="font-mono text-sm">{o.number}</span> },
            { key: "customer", header: "Cliente" },
            { key: "type", header: "Tipo", width: "w-28", render: (o: any) => (
              <span className="text-xs">{o.type === "DELIVERY" ? "🛵 Entrega" : o.type === "TAKEAWAY" ? "🛍️ Retirada" : "🍽️ Salão"}</span>
            )},
            { key: "items", header: "Itens", width: "w-16" },
            { key: "total", header: "Total", width: "w-24", render: (o: any) => formatCurrency(o.total) },
            { key: "status", header: "Status", width: "w-32", render: (o: any) => (
              <span className={clsx("badge px-2 py-1", ORDER_STATUS_BADGE[o.status])}>
                {getOrderStatusLabel(o.status)}
              </span>
            )},
            { key: "actions", header: "", width: "w-40", render: (o: any) => (
              <div className="flex gap-1">
                {["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status) && (
                  <AdminButton variant="ghost" onClick={() => advanceStatus(o.id)} className="text-xs">
                    Avançar
                  </AdminButton>
                )}
                {!["DELIVERED", "SERVED", "CANCELLED"].includes(o.status) && (
                  <button onClick={() => cancelOrder(o.id)} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label="Cancelar pedido">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum pedido encontrado"
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Mesas
// =========================================================

function TablesTab() {
  const { toast } = useAdminToast();
  const [tables, setTables] = useState(MOCK_TABLES);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_TABLES)[0] | null>(null);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setTables(prev => prev.map(t => (t.id === editing.id ? { ...t, ...data } : t)));
      toast({ title: "Mesa atualizada", variant: "success" });
    } else {
      setTables(prev => [...prev, { ...data, id: `table-${Date.now()}`, currentOrder: null }]);
      toast({ title: "Mesa criada", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    toast({ title: "Mesa removida", variant: "success" });
  };

  const TABLE_STATUS_BADGE: Record<string, string> = {
    AVAILABLE: "badge-success",
    OCCUPIED: "badge-warning",
    RESERVED: "badge-info",
  };

  const TABLE_STATUS_LABEL: Record<string, string> = {
    AVAILABLE: "Livre",
    OCCUPIED: "Ocupada",
    RESERVED: "Reservada",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Mesas</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Nova Mesa
        </AdminButton>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map(table => (
          <AdminSection key={table.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                <Table2 className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <span className={clsx("badge px-2 py-0.5 text-xs", TABLE_STATUS_BADGE[table.status])}>
                {TABLE_STATUS_LABEL[table.status]}
              </span>
            </div>
            <p className="font-bold text-[var(--text-primary)]">Mesa {table.number}</p>
            <p className="text-xs text-[var(--text-muted)] mb-3">{table.seats} lugares</p>
            {table.currentOrder && (
              <p className="text-xs text-[var(--brand-cyan)] font-mono mb-3">Pedido {table.currentOrder}</p>
            )}
            <div className="flex gap-1">
              <button onClick={() => { setEditing(table); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar mesa ${table.number}`}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(table.id)} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir mesa ${table.number}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </AdminSection>
        ))}
      </div>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Mesa" : "Nova Mesa"}
        fields={[
          { name: "number", label: "Número da mesa", type: "text", required: true, defaultValue: editing?.number },
          { name: "seats", label: "Lugares", type: "number", required: true, defaultValue: editing?.seats ?? 4 },
          { name: "status", label: "Status", type: "select", defaultValue: editing?.status ?? "AVAILABLE",
            options: [
              { value: "AVAILABLE", label: "Livre" },
              { value: "OCCUPIED", label: "Ocupada" },
              { value: "RESERVED", label: "Reservada" },
            ]},
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
    restaurantName: "Burger House Nexis",
    contactPhone: "(11) 99999-8888",
    deliveryEnabled: true,
    deliveryFee: 790,
    deliveryRadiusKm: 8,
    minDeliveryOrder: 2500,
    averageDeliveryTime: 40,
    takeawayEnabled: true,
    dineInEnabled: true,
    showQrMenu: true,
    acceptsTips: true,
    serviceChargePercent: 0,
  });

  const handleSave = () => {
    toast({ title: "Configurações salvas", variant: "success" });
  };

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

      <AdminSection title="Identidade do Restaurante" icon={Settings} className="card p-5 space-y-4">
        <AdminField label="Nome do restaurante">
          <AdminInput
            value={config.restaurantName}
            onChange={(e: any) => setConfig(prev => ({ ...prev, restaurantName: e.target.value }))}
          />
        </AdminField>
        <AdminField label="Telefone de contato">
          <AdminInput
            value={config.contactPhone}
            onChange={(e: any) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
          />
        </AdminField>
      </AdminSection>

      <AdminSection title="Modalidades de Pedido" icon={ClipboardList} className="card p-5">
        {switchStyle("dineInEnabled", "Pedidos no salão", "Cliente pede pela mesa (QR code)")}
        {switchStyle("takeawayEnabled", "Retirada no balcão")}
        {switchStyle("deliveryEnabled", "Entrega (delivery)")}
      </AdminSection>

      {config.deliveryEnabled && (
        <AdminSection title="Entrega" icon={Clock} className="card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label="Taxa de entrega (centavos)">
              <AdminInput
                type="number"
                value={String(config.deliveryFee)}
                onChange={(e: any) => setConfig(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))}
              />
            </AdminField>
            <AdminField label="Raio de entrega (km)">
              <AdminInput
                type="number"
                value={String(config.deliveryRadiusKm)}
                onChange={(e: any) => setConfig(prev => ({ ...prev, deliveryRadiusKm: Number(e.target.value) }))}
              />
            </AdminField>
            <AdminField label="Pedido mínimo (centavos)">
              <AdminInput
                type="number"
                value={String(config.minDeliveryOrder)}
                onChange={(e: any) => setConfig(prev => ({ ...prev, minDeliveryOrder: Number(e.target.value) }))}
              />
            </AdminField>
            <AdminField label="Tempo médio de entrega (min)">
              <AdminInput
                type="number"
                value={String(config.averageDeliveryTime)}
                onChange={(e: any) => setConfig(prev => ({ ...prev, averageDeliveryTime: Number(e.target.value) }))}
              />
            </AdminField>
          </div>
        </AdminSection>
      )}

      <AdminSection title="Experiência" icon={UtensilsCrossed} className="card p-5">
        {switchStyle("showQrMenu", "Menu por QR Code", "Clientes escaneiam e veem o cardápio no celular")}
        {switchStyle("acceptsTips", "Aceitar gorjetas")}
      </AdminSection>

      <div className="flex justify-end">
        <AdminButton onClick={handleSave} variant="primary">
          Salvar Configurações
        </AdminButton>
      </div>
    </div>
  );
}