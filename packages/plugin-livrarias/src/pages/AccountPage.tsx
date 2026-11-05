"use client";

import { User, Package, Heart, Settings, CreditCard, LogOut, Bell, BookOpen, Star } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { useState } from "react";
import { clsx } from "clsx";

const TABS = [
  { id: "orders", label: "Meus Pedidos", icon: Package },
  { id: "wishlist", label: "Lista de Desejos", icon: Heart },
  { id: "profile", label: "Perfil", icon: User },
  { id: "addresses", label: "Endereços", icon: Package },
  { id: "payment", label: "Pagamentos", icon: CreditCard },
  { id: "settings", label: "Configurações", icon: Settings },
];

const MOCK_ORDERS = [
  { id: "NXS-2024-001234", date: new Date("2024-01-15"), status: "DELIVERED", total: 14990, items: 2 },
  { id: "NXS-2024-001123", date: new Date("2024-01-10"), status: "SHIPPED", total: 8990, items: 1 },
  { id: "NXS-2024-001001", date: new Date("2024-01-05"), status: "CANCELLED", total: 5490, items: 1 },
];

const MOCK_WISHLIST = [
  { id: "1", title: "1984", author: "George Orwell", price: 4990, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop" },
  { id: "2", title: "Sapiens", author: "Yuval Noah Harari", price: 5990, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop" },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");

  const renderTabContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <div className="space-y-4">
            {MOCK_ORDERS.map(order => (
              <div key={order.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-mono font-medium text-[var(--text-primary)]">{order.id}</span>
                    <span className="text-sm text-[var(--text-muted)]">{order.date.toLocaleDateString("pt-BR")}</span>
                    <span className={clsx(
                      "badge px-2 py-1",
                      order.status === "DELIVERED" && "badge-success",
                      order.status === "SHIPPED" && "badge-info",
                      order.status === "CANCELLED" && "badge-danger",
                      order.status === "PROCESSING" && "badge-warning",
                      order.status === "PENDING" && "badge-warning",
                    )}>
                      {order.status === "DELIVERED" && "Entregue"}
                      {order.status === "SHIPPED" && "Enviado"}
                      {order.status === "PROCESSING" && "Processando"}
                      {order.status === "PENDING" && "Pendente"}
                      {order.status === "CANCELLED" && "Cancelado"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{order.items} item{order.items !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[var(--brand-cyan)] text-lg">{formatCurrency(order.total)}</span>
                  <button className="btn btn-ghost btn-sm">Ver detalhes</button>
                </div>
              </div>
            ))}
            {MOCK_ORDERS.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Nenhum pedido encontrado</h3>
                <p className="text-[var(--text-muted)] mb-4">Você ainda não fez nenhum pedido</p>
                <a href="/" className="btn btn-primary">Começar a comprar</a>
              </div>
            )}
          </div>
        );

      case "wishlist":
        return (
          <div>
            {MOCK_WISHLIST.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_WISHLIST.map(item => (
                  <div key={item.id} className="card group">
                    <div className="aspect-[2/3] bg-[var(--bg-secondary)] relative overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <button className="absolute top-2 right-2 btn btn-ghost p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remover da lista">
                        <Star className="w-4 h-4 fill-[var(--text-danger)] text-[var(--text-danger)]" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[var(--text-primary)] line-clamp-1 mb-1">{item.title}</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-2">{item.author}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--brand-cyan)]">{formatCurrency(item.price)}</span>
                        <button className="btn btn-primary btn-sm">Adicionar ao carrinho</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Sua lista está vazia</h3>
                <p className="text-[var(--text-muted)] mb-4">Adicione livros que você gostaria de ler depois</p>
                <a href="/" className="btn btn-primary">Explorar livros</a>
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <form className="max-w-xl space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[var(--brand-cyan)]/10 flex items-center justify-center text-3xl">👤</div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">João Silva</h3>
                <p className="text-sm text-[var(--text-muted)]">joao@email.com</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome</label>
                <input id="firstName" type="text" defaultValue="João" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Sobrenome</label>
                <input id="lastName" type="text" defaultValue="Silva" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">E-mail</label>
              <input id="email" type="email" defaultValue="joao@email.com" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Telefone</label>
              <input id="phone" type="tel" defaultValue="(11) 99999-9999" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CPF</label>
              <input id="cpf" type="text" defaultValue="000.000.000-00" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">Salvar alterações</button>
              <button type="button" className="btn btn-outline">Cancelar</button>
            </div>
          </form>
        );

      case "addresses":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[var(--text-primary)]">Endereços Cadastrados</h3>
              <button className="btn btn-primary btn-sm">Adicionar endereço</button>
            </div>

            <div className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[var(--text-primary)]">João Silva</span>
                    <span className="badge badge-success">Principal</span>
                  </div>
                  <address className="text-[var(--text-secondary)] not-italic text-sm">
                    <p>Rua das Flores, 123 - Apto 45</p>
                    <p>Jardim Paulista, São Paulo - SP</p>
                    <p>CEP: 01234-567</p>
                  </address>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm">Editar</button>
                  <button className="btn btn-ghost btn-sm text-[var(--text-danger)]">Excluir</button>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-muted)] text-center">Você pode cadastrar até 5 endereços</p>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[var(--text-primary)]">Métodos de Pagamento</h3>
              <button className="btn btn-primary btn-sm">Adicionar cartão</button>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-[var(--brand-cyan)]" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Cartão Visa final 1234</p>
                    <p className="text-sm text-[var(--text-muted)]">Expira 12/2026</p>
                  </div>
                </div>
                <span className="badge badge-success">Principal</span>
              </div>
            </div>

            <p className="text-sm text-[var(--text-muted)] text-center">Seus dados de cartão são armazenados com segurança</p>
          </div>
        );

      case "settings":
        return (
          <div className="max-w-xl space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Notificações</h3>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">E-mails promocionais</p>
                  <p className="text-sm text-[var(--text-muted)]">Receba ofertas e novidades</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Atualizações de pedido</p>
                  <p className="text-sm text-[var(--text-muted)]">Status de envio e entrega</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Recomendações personalizadas</p>
                  <p className="text-sm text-[var(--text-muted)]">Baseado no seu histórico</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]" />
              </label>
            </div>

            <div className="card p-6 space-y-4 border-[var(--text-danger)]/20">
              <h3 className="font-semibold text-[var(--text-danger)]">Zona de Perigo</h3>
              <p className="text-sm text-[var(--text-secondary)]">Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</p>
              <button className="btn btn-danger">Excluir minha conta</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Minha Conta</h1>
          <p className="text-[var(--text-secondary)] mt-1">Gerencie seus pedidos, dados pessoais e preferências</p>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="card p-2 space-y-1" aria-label="Menu da conta">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-[var(--brand-cyan)] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-4 card p-4 text-center">
              <LogOut className="w-10 h-10 mx-auto mb-2 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)] mb-2">Sair da conta</p>
              <button className="btn btn-outline btn-sm">Sair</button>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}