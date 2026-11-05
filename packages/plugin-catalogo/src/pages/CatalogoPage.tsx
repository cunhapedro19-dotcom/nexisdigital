"use client";

import { useState, useMemo } from "react";
import type { Product, CatalogSettings } from "../types";
import { ProductCard } from "../components/ProductCard";
import { QuoteDrawer } from "../components/QuoteDrawer";
import { ProductDetailsModal } from "../components/ProductDetailsModal";
import { useQuoteCart } from "../hooks/use-quote-cart";
import { formatCurrency } from "../utils/helpers";
import { Search, X, FileText, Phone, Mail, MapPin, FileDown } from "lucide-react";
import { clsx } from "clsx";

// =========================================================
// Mock Data
// =========================================================

const MOCK_SETTINGS: CatalogSettings = {
  companyName: "Ferreira & Lima Distribuidora",
  description: "Há 15 anos distribuindo materiais de construção e ferramentas com preço justo e entrega rápida para obras em toda a região metropolitana.",
  contactEmail: "vendas@ferreiralima.com.br",
  contactPhone: "(11) 3344-5566",
  whatsapp: "551133445566",
  address: "Av. Industrial, 1200 — Galpão 3, São Paulo/SP",
  currency: "BRL",
  showPrices: true,
  quoteMode: "optional",
  quoteResponseHours: 24,
  minQuoteValue: 50000,
  branches: [
    { id: "b1", name: "Matriz — São Paulo", address: "Av. Industrial, 1200", phone: "(11) 3344-5566" },
    { id: "b2", name: "Filial — Campinas", address: "Rod. Dom Pedro I, km 92", phone: "(19) 3232-4455" },
  ],
  socialLinks: { instagram: "https://instagram.com/ferreiralima" },
  primaryColor: "#06b6d4",
};

const MOCK_CATEGORIES = [
  { id: "c1", name: "Ferramentas", slug: "ferramentas", icon: "🔧", sortOrder: 1, productCount: 42 },
  { id: "c2", name: "Elétrica", slug: "eletrica", icon: "⚡", sortOrder: 2, productCount: 38 },
  { id: "c3", name: "Hidráulica", slug: "hidraulica", icon: "🚰", sortOrder: 3, productCount: 27 },
  { id: "c4", name: "Construção", slug: "construcao", icon: "🧱", sortOrder: 4, productCount: 64 },
  { id: "c5", name: "EPI", slug: "epi", icon: "⛑️", sortOrder: 5, productCount: 19 },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    tenantId: "demo",
    sku: "FER-PARA-001",
    name: "Parafusadeira/Furadeira de Impacto 20V",
    description: "Furadeira de impacto com bateria de lítio 20V, 2 velocidades, mandril de 13mm e LED integrado. Acompanha maleta, 2 baterias e carregador.",
    shortDescription: "Bateria 20V, 2 velocidades, maleta completa",
    category: "ferramentas",
    brand: "ForceTool",
    price: 54900,
    wholesalePrice: 47900,
    minOrderQty: 1,
    unit: "un",
    stock: 34,
    images: ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=450&fit=crop"],
    specifications: [
      { key: "Voltagem", value: "20V" },
      { key: "Mandril", value: "13mm" },
      { key: "Torque", value: "60 Nm" },
      { key: "Baterias", value: "2× 2.0Ah" },
      { key: "Peso", value: "1.4 kg" },
      { key: "Garantia", value: "12 meses" },
    ],
    tags: ["bateria", "20v", "profissional"],
    status: "active",
    isFeatured: true,
    viewCount: 1240,
    quoteCount: 86,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "p2",
    tenantId: "demo",
    sku: "ELE-CAB-25",
    name: "Cabo Flexível 2.5mm² 100m",
    description: "Cabo flexível de cobre 750V para instalações elétricas residenciais e comerciais. Cor preta, rolo com 100 metros, certificado INMETRO.",
    shortDescription: "Cobre 750V, rolo 100m, INMETRO",
    category: "eletrica",
    brand: "CobreMax",
    price: 18900,
    wholesalePrice: 15900,
    minOrderQty: 2,
    unit: "rolo",
    stock: 120,
    images: ["https://images.unsplash.com/photo-1607936854279-55e8a4c64888?w=600&h=450&fit=crop"],
    specifications: [
      { key: "Seção", value: "2.5mm²" },
      { key: "Isolamento", value: "PVC 750V" },
      { key: "Comprimento", value: "100m" },
      { key: "Material", value: "Cobre nu" },
    ],
    tags: ["cabo", "instalação"],
    status: "active",
    isFeatured: false,
    viewCount: 890,
    quoteCount: 143,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "p3",
    tenantId: "demo",
    sku: "HID-TUB-100",
    name: "Tubo PVC Soldável 100mm 6m",
    description: "Tubo de PVC soldável para esgoto sanitário, diâmetro 100mm, comprimento 6 metros, cor branca, com ponta e bolso.",
    shortDescription: "Esgoto 100mm, 6m, ponta e bolso",
    category: "hidraulica",
    brand: "Amanco",
    price: 6900,
    minOrderQty: 5,
    unit: "un",
    stock: 240,
    images: ["https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=450&fit=crop"],
    specifications: [
      { key: "Diâmetro", value: "100mm" },
      { key: "Comprimento", value: "6m" },
      { key: "Ligação", value: "Soldável" },
      { key: "Norma", value: "NBR 5643" },
    ],
    tags: ["pvc", "esgoto"],
    status: "active",
    isFeatured: false,
    viewCount: 445,
    quoteCount: 98,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "p4",
    tenantId: "demo",
    sku: "CON-CIM-50",
    name: "Cimento CP-II-Z 32 50kg",
    description: "Cimento composto pozolânico, saco de 50kg, para uso geral em alvenaria, reboco, contrapiso e concreto simples.",
    shortDescription: "Saco 50kg, uso geral",
    category: "construcao",
    brand: "Votoran",
    price: 3450,
    wholesalePrice: 2990,
    minOrderQty: 10,
    unit: "saco",
    stock: 480,
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=450&fit=crop"],
    specifications: [
      { key: "Tipo", value: "CP-II-Z-32" },
      { key: "Peso", value: "50kg" },
      { key: "Norma", value: "NBR 11578" },
    ],
    tags: ["cimento", "alvenaria"],
    status: "active",
    isFeatured: true,
    viewCount: 2100,
    quoteCount: 320,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "p5",
    tenantId: "demo",
    sku: "EPI-CAP-AB",
    name: "Capacete de Segurança com Jugular",
    description: "Capacete classe B para proteção da cabeça contra impactos. Aba frontal, jugular plástica, regulagem de circunferência 53-63cm.",
    shortDescription: "Classe B, aba frontal, regulável",
    category: "epi",
    brand: "3M",
    price: 2890,
    wholesalePrice: 2290,
    minOrderQty: 5,
    unit: "un",
    stock: 8,
    images: ["https://images.unsplash.com/photo-1578874691223-64558a3ca096?w=600&h=450&fit=crop"],
    specifications: [
      { key: "Classe", value: "B" },
      { key: "Norma", value: "NBR 8221" },
      { key: "CA", value: "Certificado" },
    ],
    tags: ["epi", "segurança"],
    status: "active",
    isFeatured: false,
    viewCount: 670,
    quoteCount: 54,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "p6",
    tenantId: "demo",
    sku: "FER-MAK-002",
    name: "Makita Serra Circular 7.1/4\" 1200W",
    description: "Serra circular profissional de 1200W com base de alumínio, corte a 45° e 90°, lâmina de 24 dentes inclusa.",
    shortDescription: "1200W, lâmina 24 dentes inclusa",
    category: "ferramentas",
    brand: "Makita",
    price: 89900,
    minOrderQty: 1,
    unit: "un",
    stock: 0,
    images: ["https://images.unsplash.com/photo-1553342385-111fd6bc6ab3?w=600&h=450&fit=crop"],
    specifications: [
      { key: "Potência", value: "1200W" },
      { key: "Lâmina", value: "7.1/4\"" },
      { key: "Rotação", value: "4.800 rpm" },
    ],
    tags: ["serra", "corte"],
    status: "out_of_stock",
    isFeatured: false,
    viewCount: 980,
    quoteCount: 41,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// =========================================================
// Página principal
// =========================================================

export default function CatalogoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<"name" | "price-asc" | "price-desc" | "newest" | "most-viewed">("name");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [sentQuoteNumber, setSentQuoteNumber] = useState<string | null>(null);

  const {
    items: cartItems,
    itemCount,
    summary,
    addProduct,
    updateQuantity,
    removeItem,
    clearCart,
    submitQuote,
    isLoading,
  } = useQuoteCart("demo", MOCK_PRODUCTS);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));
    return ["all", ...unique];
  }, []);

  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS.filter(p => p.status === "active" || p.status === "out_of_stock");

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "all") {
      result = result.filter(p => p.category === activeCategory);
    }

    switch (sort) {
      case "price-asc": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-desc": result = [...result].sort((a, b) => b.price - a.price); break;
      case "most-viewed": result = [...result].sort((a, b) => b.viewCount - a.viewCount); break;
      case "newest": result = [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
      default: result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, activeCategory, sort]);

  const handleAddToQuote = (product: Product, quantity?: number) => {
    const qty = quantity ?? (product.minOrderQty || 1);
    if (product.stock === 0) return;
    addProduct(product, qty);
    setDrawerOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const result = await submitQuote({
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || "") || undefined,
      company: String(fd.get("company") || "") || undefined,
    }, String(fd.get("notes") || "") || undefined);
    if (result) {
      setSentQuoteNumber(result.quoteNumber);
      setQuoteFormOpen(false);
    }
  };

  // ==========================================
  // Tela de orçamento enviado
  // ==========================================
  if (sentQuoteNumber) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--text-success)]/10 flex items-center justify-center">
            <span className="text-5xl">📨</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Orçamento Solicitado!</h1>
          <p className="text-[var(--text-secondary)] mb-1">
            Sua solicitação <span className="font-mono font-medium">{sentQuoteNumber}</span> foi registrada.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Nossa equipe responde em até {MOCK_SETTINGS.quoteResponseHours}h úteis no seu email.
          </p>
          <button onClick={() => setSentQuoteNumber(null)} className="btn btn-primary">
            Continuar navegando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
                <span className="text-xl">🏗️</span>
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] leading-tight">{MOCK_SETTINGS.companyName}</p>
                <p className="text-xs text-[var(--text-muted)]">Catálogo B2B • {MOCK_PRODUCTS.filter(p => p.status === "active").length} produtos</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={`tel:${MOCK_SETTINGS.contactPhone}`} className="btn btn-ghost p-2 hidden sm:flex" aria-label="Ligar">
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setDrawerOpen(true)}
                className="btn btn-primary relative"
                aria-label={`Abrir cotação com ${itemCount} itens`}
              >
                <FileText className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Cotação</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--text-danger)] text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Hero ============ */}
      <section className="relative bg-gradient-to-br from-[#083344] via-[#155e75] to-[#0e7490] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{MOCK_SETTINGS.companyName}</h1>
            <p className="text-white/80 mb-6">{MOCK_SETTINGS.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <FileDown className="w-4 h-4" /> Catálogo completo em PDF
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                ⚡ Orçamento em {MOCK_SETTINGS.quoteResponseHours}h
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                🏢 {MOCK_SETTINGS.branches.length} filiais
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Formulário de cotação ============ */}
      {quoteFormOpen && (
        <section className="max-w-3xl mx-auto px-4 py-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Solicitar Orçamento</h2>
              <button onClick={() => setQuoteFormOpen(false)} className="btn btn-ghost text-sm">← Voltar</button>
            </div>

            {/* Resumo dos itens */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-5">
              <ul className="space-y-1.5 text-sm mb-3">
                {cartItems.map(item => {
                  const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <li key={item.productId} className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">{item.quantity}× {product.name}</span>
                      <span className="font-medium">{formatCurrency(product.price * item.quantity)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-between font-bold pt-3 border-t border-[var(--border-default)]">
                <span>Estimativa</span>
                <span className="text-[var(--brand-cyan)]">{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="q-name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome *</label>
                  <input id="q-name" name="name" required className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="Seu nome" />
                </div>
                <div>
                  <label htmlFor="q-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email *</label>
                  <input id="q-email" name="email" type="email" required className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="voce@empresa.com" />
                </div>
                <div>
                  <label htmlFor="q-phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Telefone</label>
                  <input id="q-phone" name="phone" type="tel" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label htmlFor="q-company" className="block text-sm font medium text-[var(--text-primary)] mb-1">Empresa</label>
                  <input id="q-company" name="company" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="Nome da empresa" />
                </div>
              </div>
              <div>
                <label htmlFor="q-notes" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Observações</label>
                <textarea id="q-notes" name="notes" rows={3} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none resize-none" placeholder="Prazo desejado, condições de entrega, etc." />
              </div>
              <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3">
                {isLoading ? "Enviando..." : "Enviar solicitação"}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ============ Catálogo ============ */}
      {!quoteFormOpen && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Categorias */}
          <nav className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4" aria-label="Categorias">
            {categories.map(cat => {
              const catData = MOCK_CATEGORIES.find(c => c.slug === cat);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                    activeCategory === cat
                      ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                      : "bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                  )}
                >
                  {cat === "all" ? "Tudo" : `${catData?.icon || ""} ${catData?.name || cat}`}
                </button>
              );
            })}
          </nav>

          {/* Busca + ordenação */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, SKU ou marca..."
                className="w-full pl-12 pr-10 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none"
                aria-label="Buscar produtos"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Limpar busca">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none"
              aria-label="Ordenar produtos"
            >
              <option value="name">Nome (A-Z)</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="most-viewed">Mais vistos</option>
              <option value="newest">Novidades</option>
            </select>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Nada encontrado</h3>
              <p className="text-[var(--text-muted)]">Tente outra busca ou categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  settings={MOCK_SETTINGS}
                  onAddToQuote={p => handleAddToQuote(p)}
                  onShowDetails={setDetailsProduct}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* ============ Footer ============ */}
      <footer className="border-t border-[var(--border-default)] py-10 mt-8">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-bold text-[var(--text-primary)] mb-2">🏗️ {MOCK_SETTINGS.companyName}</p>
            <p className="text-[var(--text-muted)]">{MOCK_SETTINGS.description}</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)] mb-2">Contato</p>
            <p className="text-[var(--text-muted)] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {MOCK_SETTINGS.contactEmail}</p>
            <p className="text-[var(--text-muted)] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {MOCK_SETTINGS.contactPhone}</p>
            <p className="text-[var(--text-muted)] flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {MOCK_SETTINGS.address}</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)] mb-2">Filiais</p>
            {MOCK_SETTINGS.branches.map(b => (
              <p key={b.id} className="text-[var(--text-muted)]">• {b.name}</p>
            ))}
          </div>
        </div>
        <div className="text-center text-xs text-[var(--text-muted)] mt-8">
          Powered by Nexis Digital
        </div>
      </footer>

      {/* ============ Drawer + Modal ============ */}
      <QuoteDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={cartItems}
        products={MOCK_PRODUCTS}
        itemCount={itemCount}
        total={summary.total}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onCheckout={() => {
          setDrawerOpen(false);
          setQuoteFormOpen(true);
        }}
      />

      <ProductDetailsModal
        product={detailsProduct}
        onClose={() => setDetailsProduct(null)}
        onAddToQuote={handleAddToQuote}
      />
    </div>
  );
}