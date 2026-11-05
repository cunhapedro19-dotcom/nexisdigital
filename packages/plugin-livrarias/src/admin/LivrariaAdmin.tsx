"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Book,
  Package,
  Users,
  Tag,
  Settings,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminPageLayout, AdminSection, AdminTable, AdminTabs, TabsList, TabsTrigger, TabsContent, AdminButton, AdminInput, AdminSelect, AdminOverlay, AdminEditorModal, AdminEditorModalField } from "@nexis/ui/admin";
import { formatCurrency } from "../utils/formatters";
import { useAdminToast } from "@nexis/ui/admin";
import { clsx } from "clsx";

// Mock data
const MOCK_BOOKS = [
  { id: "1", title: "Dom Casmurro", author: "Machado de Assis", category: "fiction", format: "paperback", price: 4490, stock: 50, status: "active" },
  { id: "2", title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", category: "fantasy", format: "paperback", price: 6990, stock: 30, status: "active" },
  { id: "3", title: "Hábitos Atômicos", author: "James Clear", category: "self-help", format: "paperback", price: 5490, stock: 100, status: "active" },
  { id: "4", title: "1984", author: "George Orwell", category: "fiction", format: "paperback", price: 4990, stock: 25, status: "active" },
  { id: "5", title: "O Pequeno Príncipe", author: "Saint-Exupéry", category: "children", format: "hardcover", price: 8990, stock: 15, status: "active" },
];

const MOCK_ORDERS = [
  { id: "NXS-001", customer: "João Silva", date: "2024-01-15", status: "DELIVERED", total: 14990, items: 2 },
  { id: "NXS-002", customer: "Maria Santos", date: "2024-01-14", status: "SHIPPED", total: 8990, items: 1 },
  { id: "NXS-003", customer: "Pedro Costa", date: "2024-01-13", status: "PROCESSING", total: 5490, items: 1 },
];

const MOCK_CUSTOMERS = [
  { id: "1", name: "João Silva", email: "joao@email.com", orders: 5, totalSpent: 25000, status: "active" },
  { id: "2", name: "Maria Santos", email: "maria@email.com", orders: 3, totalSpent: 18000, status: "active" },
  { id: "3", name: "Pedro Costa", email: "pedro@email.com", orders: 1, totalSpent: 5490, status: "active" },
];

const MOCK_CATEGORIES = [
  { id: "1", name: "Ficção", slug: "fiction", count: 45, status: "active" },
  { id: "2", name: "Fantasia", slug: "fantasy", count: 32, status: "active" },
  { id: "3", name: "Autoajuda", slug: "self-help", count: 28, status: "active" },
  { id: "4", name: "Infantil", slug: "children", count: 15, status: "active" },
];

export default function LivrariaAdmin() {
  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-6 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="books"><Book className="w-4 h-4 mr-2" />Livros</TabsTrigger>
          <TabsTrigger value="orders"><Package className="w-4 h-4 mr-2" />Pedidos</TabsTrigger>
          <TabsTrigger value="customers"><Users className="w-4 h-4 mr-2" />Clientes</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-2" />Categorias</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="books" className="p-6">
          <BooksTab />
        </TabsContent>
        <TabsContent value="orders" className="p-6">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="customers" className="p-6">
          <CustomersTab />
        </TabsContent>
        <TabsContent value="categories" className="p-6">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="settings" className="p-6">
          <SettingsTab />
        </TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}

function DashboardTab() {
  const stats = [
    { label: "Total de Livros", value: "1.234", icon: Book, color: "text-[var(--brand-cyan)]" },
    { label: "Pedidos Hoje", value: "12", icon: Package, color: "text-[var(--text-success)]" },
    { label: "Receita do Mês", value: "R$ 45.670", icon: "💰", color: "text-[var(--brand-amber)]" },
    { label: "Clientes Ativos", value: "892", icon: Users, color: "text-[var(--text-primary)]" },
    { label: "Taxa Conversão", value: "3.2%", icon: "📊", color: "text-[var(--text-warning)]" },
    { label: "Ticket Médio", value: "R$ 127", icon: "🎯", color: "text-[var(--text-primary)]" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <AdminSection key={i} className="card p-4 text-center">
            <div className="text-3xl mb-1">{typeof stat.icon === "string" ? stat.icon : <stat.icon className="w-8 h-8 mx-auto mb-2" />} </div>
            <p className="text-2xl font-bold" style={{ color: `var(${stat.color.replace("text-", "")})` }}>{stat.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
          </AdminSection>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminSection title="Pedidos Recentes" icon={Package} className="card">
          <AdminTable
            columns={[
              { key: "id", header: "Pedido", width: "w-32" },
              { key: "customer", header: "Cliente" },
              { key: "date", header: "Data", width: "w-32" },
              { key: "status", header: "Status", width: "w-32", render: (o: any) => (
                <span className={clsx(
                  "badge px-2 py-1",
                  o.status === "DELIVERED" && "badge-success",
                  o.status === "SHIPPED" && "badge-info",
                  o.status === "PROCESSING" && "badge-warning",
                )}>{o.status}</span>
              )} },
              { key: "total", header: "Total", width: "w-32", render: (o: any) => formatCurrency(o.total) },
            ]}
            data={MOCK_ORDERS}
            keyExtractor={o => o.id}
          />
        </AdminSection>

        <AdminSection title="Livros com Estoque Baixo" icon={Book} className="card">
          <AdminTable
            columns={[
              { key: "title", header: "Livro" },
              { key: "stock", header: "Estoque", width: "w-24" },
              { key: "status", header: "Status", width: "w-24", render: () => <span className="badge badge-warning">Baixo</span> },
            ]}
            data={MOCK_BOOKS.filter(b => b.stock < 30)}
            keyExtractor={b => b.id}
          />
        </AdminSection>
      </div>
    </div>
  );
}

function BooksTab() {
  const [search, setSearch] = useState("");
  const toast = useAdminToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Livros</h2>
        <AdminButton variant="primary" onClick={() => toast.success("Novo livro (demo)")}><Plus className="w-4 h-4 mr-2" />Novo Livro</AdminButton>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "title", header: "Título", render: (b: any) => <span className="font-medium">{b.title}</span> },
            { key: "author", header: "Autor" },
            { key: "category", header: "Categoria", width: "w-32" },
            { key: "format", header: "Formato", width: "w-24" },
            { key: "price", header: "Preço", width: "w-24", render: (b: any) => formatCurrency(b.price) },
            { key: "stock", header: "Estoque", width: "w-24" },
            { key: "status", header: "Status", width: "w-24", render: (b: any) => (
              <span className={clsx("badge", b.status === "active" ? "badge-success" : "badge-default")}>{b.status}</span>
            )},
            { key: "actions", header: "Ações", width: "w-40", render: () => (
              <div className="flex items-center justify-end gap-1">
                <AdminButton variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></AdminButton>
              </div>
            )},
          ]}
          data={MOCK_BOOKS}
          keyExtractor={b => b.id}
        />
      </AdminSection>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Pedidos</h2>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "id", header: "Pedido", width: "w-32" },
            { key: "customer", header: "Cliente" },
            { key: "date", header: "Data", width: "w-32" },
            { key: "status", header: "Status", width: "w-32", render: (o: any) => (
              <span className={clsx(
                "badge px-2 py-1",
                o.status === "DELIVERED" && "badge-success",
                o.status === "SHIPPED" && "badge-info",
                o.status === "PROCESSING" && "badge-warning",
                o.status === "PENDING" && "badge-warning",
                o.status === "CANCELLED" && "badge-danger",
              )}>{o.status}</span>
            )} },
            { key: "items", header: "Itens", width: "w-20", render: (o: any) => `${o.items} item${o.items !== 1 ? "s" : ""}` },
            { key: "total", header: "Total", width: "w-32", render: (o: any) => formatCurrency(o.total) },
            { key: "actions", header: "Ações", width: "w-32", render: () => (
              <AdminButton variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></AdminButton>
            )},
          ]}
          data={MOCK_ORDERS}
          keyExtractor={o => o.id}
        />
      </AdminSection>
    </div>
  );
}

function CustomersTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Clientes</h2>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Nome" },
            { key: "email", header: "E-mail" },
            { key: "orders", header: "Pedidos", width: "w-24" },
            { key: "totalSpent", header: "Total Gasto", width: "w-32", render: (c: any) => formatCurrency(c.totalSpent) },
            { key: "status", header: "Status", width: "w-24", render: () => <span className="badge badge-success">Ativo</span> },
          ]}
          data={MOCK_CUSTOMERS}
          keyExtractor={c => c.id}
        />
      </AdminSection>
    </div>
  );
}

function CategoriesTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Categorias</h2>
        <AdminButton variant="primary"><Plus className="w-4 h-4 mr-2" />Nova Categoria</AdminButton>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Nome" },
            { key: "slug", header: "Slug", width: "w-32" },
            { key: "count", header: "Livros", width: "w-24", render: (c: any) => c.count },
            { key: "status", header: "Status", width: "w-24", render: () => <span className="badge badge-success">Ativa</span> },
          ]}
          data={MOCK_CATEGORIES}
          keyExtractor={c => c.id}
        />
      </AdminSection>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Configurações da Livraria</h2>

      <AdminSection title="Configurações Gerais" icon={Settings} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AdminInput label="Nome da Loja" placeholder="Livraria Nexis" defaultValue="Livraria Nexis" />
          <AdminInput label="E-mail de Contato" type="email" placeholder="contato@livrarianexis.com" defaultValue="contato@livrarianexis.com" />
        </div>
        <AdminInput label="Telefone" placeholder="(11) 99999-9999" defaultValue="(11) 99999-9999" />
        <AdminInput label="Descrição" type="textarea" rows={3} placeholder="Descrição da loja..." defaultValue="Sua livraria online com os melhores títulos" />

        <AdminSelect
          label="Moeda"
          value="BRL"
          options={[
            { value: "BRL", label: "Real Brasileiro (BRL)" },
            { value: "USD", label: "Dólar Americano (USD)" },
            { value: "EUR", label: "Euro (EUR)" },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AdminSelect
            label="Fuso Horário"
            value="America/Sao_Paulo"
            options={[
              { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
              { value: "America/Manaus", label: "Manaus (UTC-4)" },
              { value: "America/Fortaleza", label: "Fortaleza (UTC-3)" },
            ]}
          />
          <AdminSelect
            label="Idioma"
            value="pt-BR"
            options={[
              { value: "pt-BR", label: "Português (Brasil)" },
              { value: "en-US", label: "English (US)" },
              { value: "es-ES", label: "Español" },
            ]}
          />
        </div>

        <AdminButton variant="primary">Salvar Configurações</AdminButton>
      </AdminSection>
    </div>
  );
}