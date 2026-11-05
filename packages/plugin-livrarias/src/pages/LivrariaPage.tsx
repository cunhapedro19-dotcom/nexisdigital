"use client";

import { useState, useEffect, useMemo } from "react";
import { Book, BookFilters, LivrariaSettings } from "../types";
import { BookGrid } from "../components/BookGrid";
import { CartDrawer } from "../components/CartDrawer";
import { useCart } from "../hooks/use-cart";
import { useLocalStorage } from "../hooks/use-local-storage";
import { Search, Filter, Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { clsx } from "clsx";

// Mock data para demonstração
const MOCK_BOOKS: Book[] = [
  {
    id: "book-1",
    tenantId: "demo",
    isbn: "978-85-359-1234-5",
    title: "Dom Casmurro",
    subtitle: "Edição Comentada",
    author: "Machado de Assis",
    publisher: "Penguin Companhia",
    publishedDate: new Date("2020-01-15"),
    category: "fiction",
    format: "paperback",
    language: "pt-BR",
    pages: 256,
    description: "Obra-prima do realismo brasileiro, Dom Casmurro narra a história de Bentinho e sua obsessão por Capitu. Esta edição comentada traz notas e análises que enriquecem a leitura.",
    shortDescription: "Clássico da literatura brasileira em edição especial comentada.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    galleryImages: [],
    price: 4490,
    compareAtPrice: 5990,
    costPrice: 2200,
    sku: "DOM-CAS-001",
    barcode: "9788535912345",
    tags: ["clássico", "literatura brasileira", "realismo"],
    isActive: true,
    isFeatured: true,
    isNewRelease: false,
    isBestseller: true,
    stockQuantity: 50,
    reservedQuantity: 3,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: true,
    seoTitle: "Dom Casmurro - Machado de Assis | Edição Comentada",
    seoDescription: "Compre Dom Casmurro de Machado de Assis com edição comentada. Frete grátis acima de R$ 99.",
    seoKeywords: ["machado de assis", "dom casmurro", "literatura brasileira", "clássico"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "book-2",
    tenantId: "demo",
    isbn: "978-85-01-12345-6",
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    author: "J.R.R. Tolkien",
    publisher: "HarperCollins",
    publishedDate: new Date("2019-03-20"),
    category: "fantasy",
    format: "paperback",
    language: "pt-BR",
    pages: 576,
    description: "Primeiro volume da trilogia épica que definiu o gênero fantasy. Frodo Bolseiro herda o Um Anel e deve viajar para destruí-lo na Montanha da Perdição.",
    shortDescription: "Início da jornada épica pela Terra Média.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa7400247e8?w=400&h=600&fit=crop",
    galleryImages: [],
    price: 6990,
    costPrice: 3500,
    sku: "LOTR-001",
    barcode: "9788501123456",
    tags: ["fantasia", "épico", "trilogia"],
    isActive: true,
    isFeatured: true,
    isNewRelease: false,
    isBestseller: true,
    stockQuantity: 30,
    reservedQuantity: 5,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: true,
    seoTitle: "A Sociedade do Anel - J.R.R. Tolkien",
    seoDescription: "Primeiro livro de O Senhor dos Anéis. Edição em português com mapa da Terra Média.",
    seoKeywords: ["tolkien", "senhor dos anéis", "fantasia", "terra média"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "book-3",
    tenantId: "demo",
    isbn: "978-85-431-1234-5",
    title: "Hábitos Atômicos",
    author: "James Clear",
    publisher: "Alta Books",
    publishedDate: new Date("2019-09-10"),
    category: "self-help",
    format: "paperback",
    language: "pt-BR",
    pages: 320,
    description: "Guia prático para criar bons hábitos e quebrar os ruins. Pequenas mudanças, resultados extraordinários.",
    shortDescription: "Bestseller internacional sobre formação de hábitos.",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    galleryImages: [],
    price: 5490,
    compareAtPrice: 6990,
    costPrice: 2800,
    sku: "HAB-ATO-001",
    barcode: "9788543112345",
    tags: ["produtividade", "hábitos", "desenvolvimento pessoal"],
    isActive: true,
    isFeatured: false,
    isNewRelease: false,
    isBestseller: true,
    stockQuantity: 100,
    reservedQuantity: 10,
    lowStockThreshold: 10,
    trackInventory: true,
    allowBackorder: true,
    seoTitle: "Hábitos Atômicos - James Clear",
    seoDescription: "Aprenda a criar bons hábitos com o bestseller de James Clear. Entrega rápida para todo Brasil.",
    seoKeywords: ["hábitos atômicos", "james clear", "produtividade", "autoajuda"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "book-4",
    tenantId: "demo",
    isbn: "978-85-359-5432-1",
    title: "1984",
    author: "George Orwell",
    publisher: "Companhia das Letras",
    publishedDate: new Date("2021-05-15"),
    category: "fiction",
    format: "paperback",
    language: "pt-BR",
    pages: 328,
    description: "Romance distópico que retrata um estado totalitário de vigilância extrema. Clássico indispensável da literatura do século XX.",
    shortDescription: "Distopia clássica sobre vigilância e controle social.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
    galleryImages: [],
    price: 4990,
    costPrice: 2500,
    sku: "1984-ORW-001",
    barcode: "9788535954321",
    tags: ["distopia", "ficção científica", "clássico"],
    isActive: true,
    isFeatured: false,
    isNewRelease: false,
    isBestseller: false,
    stockQuantity: 25,
    reservedQuantity: 2,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: true,
    seoTitle: "1984 - George Orwell",
    seoDescription: "Edição definitiva de 1984 de George Orwell. Tradução de Alexandre Hubner.",
    seoKeywords: ["1984", "george orwell", "distopia", "ficção científica"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "book-5",
    tenantId: "demo",
    isbn: "978-85-01-98765-4",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    publisher: "Agir",
    publishedDate: new Date("2022-01-20"),
    category: "children",
    format: "hardcover",
    language: "pt-BR",
    pages: 96,
    description: "Edição de luxo do clássico universal. Ilustrações originais do autor, capa dura com acabamento premium.",
    shortDescription: "Edição de luxo do clássico infantil atemporal.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    galleryImages: [],
    price: 8990,
    costPrice: 4500,
    sku: "PEQ-PRI-001",
    barcode: "9788501987654",
    tags: ["infantil", "clássico", "filosofia"],
    isActive: true,
    isFeatured: true,
    isNewRelease: true,
    isBestseller: false,
    stockQuantity: 15,
    reservedQuantity: 1,
    lowStockThreshold: 3,
    trackInventory: true,
    allowBackorder: false,
    seoTitle: "O Pequeno Príncipe - Edição de Luxo",
    seoDescription: "Edição especial de O Pequeno Príncipe com capa dura e ilustrações originais.",
    seoKeywords: ["pequeno príncipe", "saint-exupéry", "infantil", "clássico"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: "book-6",
    tenantId: "demo",
    isbn: "978-85-431-9876-5",
    title: "Sapiens: Uma Breve História da Humanidade",
    author: "Yuval Noah Harari",
    publisher: "Companhia das Letras",
    publishedDate: new Date("2017-09-01"),
    category: "history",
    format: "paperback",
    language: "pt-BR",
    pages: 496,
    description: "Como nossa espécie conquistou o planeta? Da Idade da Pedra à revolução tecnológica, uma narrativa fascinante.",
    shortDescription: "Best-seller mundial sobre a história da humanidade.",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    galleryImages: [],
    price: 5990,
    compareAtPrice: 7490,
    costPrice: 3000,
    sku: "SAP-HAR-001",
    barcode: "9788543198765",
    tags: ["história", "antropologia", "ciência"],
    isActive: true,
    isFeatured: false,
    isNewRelease: false,
    isBestseller: true,
    stockQuantity: 40,
    reservedQuantity: 4,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: true,
    seoTitle: "Sapiens - Yuval Noah Harari",
    seoDescription: "Sapiens: Uma Breve História da Humanidade. Best-seller internacional traduzido para 50+ idiomas.",
    seoKeywords: ["sapiens", "yuval noah harari", "história", "antropologia"],
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
];

const MOCK_SETTINGS: LivrariaSettings = {
  storeName: "Livraria Nexis",
  storeDescription: "Sua livraria online com os melhores títulos",
  contactEmail: "contato@livrarianexis.com.br",
  contactPhone: "(11) 99999-9999",
  currency: "BRL",
  timezone: "America/Sao_Paulo",
  language: "pt-BR",
  allowGuestCheckout: true,
  requirePhone: true,
  requireCpf: false,
  minOrderAmount: 0,
  freeShippingThreshold: 9900,
  acceptedPaymentMethods: ["credit_card", "debit_card", "pix", "boleto"],
  trackInventory: true,
  allowBackorder: true,
  lowStockThreshold: 5,
  reserveStockOnCart: true,
  cartReservationMinutes: 15,
  shippingMethods: [
    { id: "sedex", name: "Sedex", description: "Entrega expressa", type: "calculated", cost: 2500, estimatedDaysMin: 1, estimatedDaysMax: 3, isActive: true, sortOrder: 1 },
    { id: "pac", name: "PAC", description: "Entrega econômica", type: "calculated", cost: 1500, estimatedDaysMin: 3, estimatedDaysMax: 10, isActive: true, sortOrder: 2 },
    { id: "pickup", name: "Retirar na loja", description: "Grátis", type: "pickup", cost: 0, estimatedDaysMin: 0, estimatedDaysMax: 0, isActive: true, sortOrder: 3 },
  ],
  taxIncluded: true,
  taxRate: 0,
  loyaltyEnabled: true,
  pointsPerReal: 5,
  pointsRedemptionRate: 10,
  reviewsEnabled: true,
  reviewsRequireApproval: true,
  reviewsOnlyVerifiedPurchases: true,
  defaultSeoTitle: "Livraria Nexis - Livros com os melhores preços",
  defaultSeoDescription: "Compre livros online na Livraria Nexis. Best-sellers, lançamentos e clássicos com frete grátis acima de R$ 99.",
};

export default function LivrariaPage() {
  const [filters, setFilters] = useState<BookFilters>({
    sortBy: "relevance",
    page: 1,
    limit: 12,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const booksMap = useMemo(() => new Map(MOCK_BOOKS.map(b => [b.id, b])), []);
  const { cart, addItem, getItemCount, isEmpty, isLoading: cartLoading } = useCart("demo", MOCK_SETTINGS, booksMap);
  const itemCount = getItemCount();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const filteredBooks = useMemo(() => {
    let result = [...MOCK_BOOKS];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.isbn.includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(b => b.category === selectedCategory);
    }

    if (filters.format) {
      result = result.filter(b => b.format === filters.format);
    }

    if (priceRange[0] > 0 || priceRange[1] < 10000) {
      result = result.filter(b => b.price >= priceRange[0] * 100 && b.price <= priceRange[1] * 100);
    }

    // Sort
    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "bestselling":
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      default:
        // relevance - featured first, then bestsellers
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategory, filters.format, priceRange, filters.sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(MOCK_BOOKS.map(b => b.category));
    return Array.from(cats).sort();
  }, []);

  const handleAddToCart = (book: Book, format: string) => {
    addItem(book, 1, format as any);
    setCartDrawerOpen(true);
  };

  const handleSortChange = (sortBy: BookFilters["sortBy"]) => {
    setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="text-xl font-bold text-[var(--brand-cyan)]" aria-label="Livraria Nexis - Início">
                📚 Livraria Nexis
              </a>
              <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
                <a href="#lancamentos" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-cyan)] transition-colors">Lançamentos</a>
                <a href="#mais-vendidos" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-cyan)] transition-colors">Mais Vendidos</a>
                <a href="#categorias" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-cyan)] transition-colors">Categorias</a>
                <a href="#ofertas" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-cyan)] transition-colors">Ofertas</a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="search"
                  placeholder="Buscar livros, autores, ISBN..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)] transition-all"
                  aria-label="Buscar livros"
                />
              </div>

              {/* Mobile search button */}
              <button className="md:hidden btn btn-ghost p-2" aria-label="Buscar">
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative btn btn-ghost p-2"
                aria-label={`Carrinho com ${itemCount} itens`}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--text-danger)] text-white text-xs font-bold flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button className="md:hidden btn btn-ghost p-2" aria-label="Menu" onClick={() => setShowMobileFilters(true)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-4 border-b border-[var(--border-default)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="search"
                placeholder="Buscar livros, autores, ISBN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                aria-label="Buscar livros"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-[var(--bg-primary)] border-l border-[var(--border-default)] shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Filtros</h2>
              <button onClick={() => setShowMobileFilters(false)} className="btn btn-ghost p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Categoria</label>
                <select
                  value={selectedCategory || "all"}
                  onChange={e => setSelectedCategory(e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                >
                  <option value="all">Todas</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Ordenar por</label>
                <select
                  value={filters.sortBy || "relevance"}
                  onChange={e => handleSortChange(e.target.value as BookFilters["sortBy"])}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                >
                  <option value="relevance">Relevância</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                  <option value="newest">Mais recentes</option>
                  <option value="bestselling">Mais vendidos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Faixa de preço</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                    placeholder="Mín"
                  />
                  <span className="text-[var(--text-muted)]">até</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                    placeholder="Máx"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Banner */}
        <section className="mb-12 relative rounded-2xl overflow-hidden bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-amber)] p-8 sm:p-12">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Descubra seu próximo livro favorito
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Best-sellers, lançamentos e clássicos com entrega rápida para todo o Brasil.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#lancamentos" className="btn bg-white text-[var(--brand-cyan)] hover:bg-white/90 px-6 py-3">
                Ver Lançamentos
              </a>
              <a href="#mais-vendidos" className="btn btn-ghost bg-transparent border-white text-white hover:bg-white/10 px-6 py-3">
                Mais Vendidos
              </a>
            </div>
          </div>
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
                  <circle cx="10" cy="10" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
        </section>

        {/* Featured Categories */}
        <section id="categorias" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Categorias</h2>
            <a href="#" className="text-sm text-[var(--brand-cyan)] hover:underline">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(cat => (
              <a
                key={cat}
                href={`#categoria-${cat}`}
                className="card p-6 text-center hover:border-[var(--brand-cyan)]/50 transition-all group"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-[var(--brand-cyan)]/10 flex items-center justify-center group-hover:bg-[var(--brand-cyan)]/20 transition-colors">
                  <span className="text-3xl">{getCategoryIcon(cat)}</span>
                </div>
                <h3 className="font-medium text-[var(--text-primary)]">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
              </a>
            ))}
          </div>
        </section>

        {/* Featured Books */}
        <section id="lancamentos" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Lançamentos & Destaques</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-[var(--text-muted)]">Ordenar:</label>
              <select
                id="sort-select"
                value={filters.sortBy || "relevance"}
                onChange={e => handleSortChange(e.target.value as BookFilters["sortBy"])}
                className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              >
                <option value="relevance">Relevância</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="newest">Mais recentes</option>
                <option value="bestselling">Mais vendidos</option>
              </select>
            </div>
          </div>
          <BookGrid
            books={filteredBooks.filter(b => b.isFeatured || b.isNewRelease)}
            onAddToCart={handleAddToCart}
            variant="featured"
            emptyMessage="Nenhum livro em destaque no momento"
          />
        </section>

        {/* Bestsellers */}
        <section id="mais-vendidos" className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Mais Vendidos</h2>
          <BookGrid
            books={filteredBooks.filter(b => b.isBestseller)}
            onAddToCart={handleAddToCart}
            emptyMessage="Nenhum best-seller no momento"
          />
        </section>

        {/* All Books */}
        <section id="todos" className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Todos os Livros</h2>
          <BookGrid
            books={filteredBooks}
            onAddToCart={handleAddToCart}
            pagination={{
              page: filters.page || 1,
              totalPages: Math.ceil(filteredBooks.length / (filters.limit || 12)),
              onPageChange: page => setFilters(prev => ({ ...prev, page })),
            }}
            emptyMessage={searchQuery ? `Nenhum resultado para "${searchQuery}"` : "Nenhum livro cadastrado"}
          />
        </section>

        {/* Newsletter */}
        <section className="card p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Não perca nenhuma novidade</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Receba lançamentos, ofertas exclusivas e recomendações personalizadas no seu e-mail.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Seu e-mail"
              className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
              required
            />
            <button type="submit" className="btn btn-primary px-6 py-3 whitespace-nowrap">
              Inscrever-se
            </button>
          </form>
          <p className="text-xs text-[var(--text-muted)] mt-3">Ao se inscrever, você concorda com nossa <a href="#" className="underline hover:text-[var(--brand-cyan)]">Política de Privacidade</a>.</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-default)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-[var(--text-primary)] mb-4">Livraria Nexis</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">Sua livraria online com os melhores títulos, preços justos e entrega rápida.</p>
              <div className="flex gap-4">
                <a href="#" className="text-[var(--text-muted)] hover:text-[var(--brand-cyan)]" aria-label="Instagram"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.44-.645 1.44-1.44-.645-1.44-1.441-1.44z"/></svg></a>
                <a href="#" className="text-[var(--text-muted)] hover:text-[var(--brand-cyan)]" aria-label="Facebook"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                <a href="#" className="text-[var(--text-muted)] hover:text-[var(--brand-cyan)]" aria-label="Twitter"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg></a>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-4">Ajuda</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Prazos de Entrega</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Trocas e Devoluções</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Formas de Pagamento</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Fale Conosco</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-4">Institucional</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Trabalhe Conosco</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-[var(--brand-cyan)]">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>📧 contato@livrarianexis.com.br</li>
                <li>📞 (11) 99999-9999</li>
                <li>📍 São Paulo, SP</li>
                <li>⏰ Seg-Sex: 9h às 18h</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border-default)] text-center text-sm text-[var(--text-muted)]">
            <p>&copy; 2024 Livraria Nexis. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        books={booksMap}
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={(id, qty) => {}}
        onRemoveItem={(id) => {}}
        onCheckout={() => {}}
        subtotal={cart.subtotal}
        total={cart.total}
        discount={cart.discount}
        itemCount={itemCount}
      />
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    fiction: "📖",
    "non-fiction": "📚",
    children: "🧸",
    "young-adult": "✨",
    mystery: "🔍",
    romance: "💕",
    "sci-fi": "🚀",
    fantasy: "🏰",
    biography: "👤",
    history: "🏛️",
    "self-help": "💡",
    business: "💼",
    technical: "⚙️",
    art: "🎨",
    cooking: "🍳",
    travel: "✈️",
    other: "📦",
  };
  return icons[category] || "📦";
}