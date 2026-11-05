"use client";

import { useState, useMemo } from "react";
import type { MenuItem, RestaurantConfig, MenuCategory, MenuOrder } from "../types";
import { MenuCard } from "../components/MenuCard";
import { CartSidebar } from "../components/CartSidebar";
import { ItemDetailsModal } from "../components/ItemDetailsModal";
import { useOrder } from "../hooks/use-order";
import { formatCurrency, isRestaurantOpen, getNextOpeningTime } from "../utils/helpers";
import { ShoppingBag, Clock, MapPin, Phone, Search, X, CircleDot } from "lucide-react";
import { clsx } from "clsx";

// =========================================================
// Mock Data — substituído por API em produção
// =========================================================

const MOCK_CONFIG: RestaurantConfig = {
  restaurantName: "Burger House Nexis",
  tagline: "Hambúrgueres artesanais feitos na brasa",
  description: "Os melhores hambúrgueres artesanais da cidade, com ingredientes frescos e selecionados.",
  contactPhone: "(11) 99999-8888",
  contactWhatsApp: "5511999998888",
  address: {
    street: "Rua das Chamas",
    number: "456",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-789",
  },
  openingHours: [
    { day: 0, open: "18:00", close: "23:00", isOpen: true },
    { day: 1, open: "18:00", close: "23:00", isOpen: false },
    { day: 2, open: "18:00", close: "23:00", isOpen: true },
    { day: 3, open: "18:00", close: "23:00", isOpen: true },
    { day: 4, open: "18:00", close: "23:30", isOpen: true },
    { day: 5, open: "18:00", close: "00:00", isOpen: true },
    { day: 6, open: "12:00", close: "00:00", isOpen: true },
  ],
  deliveryEnabled: true,
  deliveryFee: 790,
  deliveryRadiusKm: 8,
  minDeliveryOrder: 2500,
  averageDeliveryTime: 40,
  takeawayEnabled: true,
  dineInEnabled: true,
  showQrMenu: true,
  paymentMethods: ["pix", "credit_card", "debit_card", "cash"],
  acceptsTips: true,
  socialLinks: { instagram: "https://instagram.com/burgerhouse" },
  primaryColor: "#f59e0b",
  currency: "BRL",
  serviceChargePercent: 0,
};

const MOCK_ITEMS: MenuItem[] = [
  {
    id: "item-1",
    tenantId: "demo",
    name: "Smash Bacon Duplo",
    description: "Dois hambúrgueres smash de 90g, queijo cheddar derretido duplo, bacon crocante, cebola caramelizada e maionese da casa no pão brioche tostado.",
    shortDescription: "2 smash 90g, cheddar duplo, bacon e cebola caramelizada",
    category: "pratos-principais",
    subcategory: "hambúrgueres",
    price: 3290,
    promotionalPrice: 2790,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Carne bovina 160g (2x 80g)", "Cheddar", "Bacon", "Cebola caramelizada", "Maionese da casa", "Pão brioche"],
    allergens: ["Gluten (pão)", "Lactose (queijo)", "Ovos (maionese)"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: false,
    spicyLevel: "none",
    servings: 1,
    preparationTime: 18,
    calories: 850,
    status: "AVAILABLE",
    isFeatured: true,
    isBestseller: true,
    sortOrder: 1,
    complementaryItems: [],
    modifiers: [
      {
        id: "mod-ponto",
        name: "Ponto da carne",
        type: "single",
        required: true,
        options: [
          { id: "opt-malpassado", name: "Mal passado", additionalPrice: 0, isDefault: false, isActive: true },
          { id: "opt-aoponto", name: "Ao ponto", additionalPrice: 0, isDefault: true, isActive: true },
          { id: "opt-bempassado", name: "Bem passado", additionalPrice: 0, isDefault: false, isActive: true },
        ],
      },
      {
        id: "mod-extras",
        name: "Adicionais",
        type: "multiple",
        required: false,
        maxSelections: 4,
        options: [
          { id: "opt-bacon2", name: "Bacon extra", additionalPrice: 600, isDefault: false, isActive: true },
          { id: "opt-cheddar2", name: "Cheddar extra", additionalPrice: 400, isDefault: false, isActive: true },
          { id: "opt-ovo", name: "Ovo frito", additionalPrice: 350, isDefault: false, isActive: true },
          { id: "opt-picles", name: "Picles", additionalPrice: 200, isDefault: false, isActive: true },
        ],
      },
    ],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-2",
    tenantId: "demo",
    name: "Chicken Crispy",
    description: "Frango empanado crocante estilo southern, alface americana, tomate, maionese de ervas e picles no pão de batata.",
    shortDescription: "Frango empanado crocante com maionese de ervas",
    category: "pratos-principais",
    subcategory: "hambúrgueres",
    price: 2890,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Frango 150g empanado", "Alface", "Tomate", "Maionese de ervas", "Picles", "Pão de batata"],
    allergens: ["Gluten (pão/empanado)", "Ovos (maionese)"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: true,
    spicyLevel: "mild",
    servings: 1,
    preparationTime: 15,
    calories: 690,
    status: "AVAILABLE",
    isFeatured: false,
    isBestseller: true,
    sortOrder: 2,
    complementaryItems: [],
    modifiers: [
      {
        id: "mod-molho-frango",
        name: "Molho",
        type: "single",
        required: false,
        options: [
          { id: "opt-barbecue", name: "Barbecue", additionalPrice: 0, isDefault: true, isActive: true },
          { id: "opt-honey", name: "Mel e mostarda", additionalPrice: 0, isDefault: false, isActive: true },
          { id: "opt-buffalo", name: "Buffalo picante", additionalPrice: 200, isDefault: false, isActive: true },
        ],
      },
    ],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-3",
    tenantId: "demo",
    name: "Veggie Portobello",
    description: "Hambúrguer de grão-de-bico com portobello grelhado, queijo vegano, rúcula e maionese de castanhas no pão integral.",
    shortDescription: "Opção vegetariana com portobello grelhado",
    category: "pratos-principais",
    subcategory: "hambúrgueres",
    price: 3090,
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Burger de grão-de-bico", "Portobello", "Queijo vegano", "Rúcula", "Maionese de castanhas", "Pão integral"],
    allergens: ["Gluten (pão)", "Castanhas"],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isLactoseFree: true,
    spicyLevel: "none",
    servings: 1,
    preparationTime: 16,
    calories: 540,
    status: "AVAILABLE",
    isFeatured: true,
    isBestseller: false,
    sortOrder: 3,
    complementaryItems: [],
    modifiers: [],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-4",
    tenantId: "demo",
    name: "Batata Rústica com Cheddar e Bacon",
    description: "Porção generosa de batatas rústicas crocantes cobertas com cheddar cremoso e bacon em cubos. Serve 2 pessoas.",
    shortDescription: "Batata rústica, cheddar cremoso e bacon",
    category: "entradas",
    price: 2490,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Batata rústica", "Cheddar cremoso", "Bacon", "Cebolinha"],
    allergens: ["Lactose", "Gluten"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: false,
    spicyLevel: "none",
    servings: 2,
    preparationTime: 12,
    calories: 720,
    status: "AVAILABLE",
    isFeatured: false,
    isBestseller: true,
    sortOrder: 10,
    complementaryItems: [],
    modifiers: [],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-5",
    tenantId: "demo",
    name: "Onion Rings",
    description: "Anéis de cebola empanados na cerveja, crocantes por fora e macios por dentro. Acompanha molho barbecue.",
    shortDescription: "Anéis de cebola crocantes com barbecue",
    category: "entradas",
    price: 1690,
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Cebola", "Massa de cerveja", "Molho barbecue"],
    allergens: ["Gluten"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: true,
    spicyLevel: "none",
    servings: 1,
    preparationTime: 10,
    calories: 380,
    status: "AVAILABLE",
    isFeatured: false,
    isBestseller: false,
    sortOrder: 11,
    complementaryItems: [],
    modifiers: [],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-6",
    tenantId: "demo",
    name: "Milkshake Ovomaltine 500ml",
    description: "Milkshake cremoso de baunilha com calda de ovomaltine e chantilly.",
    shortDescription: "Baunilha com ovomaltine e chantilly",
    category: "bebidas",
    subcategory: "milkshakes",
    price: 2290,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Sorvete de baunilha", "Ovomaltine", "Leite", "Chantilly"],
    allergens: ["Lactose", "Gluten (ovomaltine)"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: false,
    spicyLevel: "none",
    servings: 1,
    preparationTime: 8,
    calories: 650,
    status: "AVAILABLE",
    isFeatured: false,
    isBestseller: true,
    sortOrder: 20,
    complementaryItems: [],
    modifiers: [],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-7",
    tenantId: "demo",
    name: "Refrigerante Lata 350ml",
    description: "Coca-Cola, Guaraná, Sprite ou Fanta Laranja.",
    shortDescription: "Coca, Guaraná, Sprite ou Fanta",
    category: "bebidas",
    subcategory: "refrigerantes",
    price: 690,
    galleryImages: [],
    ingredients: [],
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true,
    spicyLevel: "none",
    servings: 1,
    preparationTime: 2,
    status: "AVAILABLE",
    isFeatured: false,
    isBestseller: false,
    sortOrder: 21,
    complementaryItems: [],
    modifiers: [
      {
        id: "mod-sabor-refri",
        name: "Sabor",
        type: "single",
        required: true,
        options: [
          { id: "opt-coca", name: "Coca-Cola", additionalPrice: 0, isDefault: true, isActive: true },
          { id: "opt-guarana", name: "Guaraná", additionalPrice: 0, isDefault: false, isActive: true },
          { id: "opt-sprite", name: "Sprite", additionalPrice: 0, isDefault: false, isActive: true },
          { id: "opt-fanta", name: "Fanta Laranja", additionalPrice: 0, isDefault: false, isActive: true },
        ],
      },
    ],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-8",
    tenantId: "demo",
    name: "Brownie com Sorvete",
    description: "Brownie de chocolate meio amargo quente com bola de sorvete de creme e calda de chocolate.",
    shortDescription: "Brownie quente com sorvete de creme",
    category: "sobremesas",
    price: 1890,
    image: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600&h=450&fit=crop",
    galleryImages: [],
    ingredients: ["Chocolate meio amargo", "Sorvete de creme", "Calda de chocolate", "Nozes"],
    allergens: ["Lactose", "Ovos", "Gluten", "Nozes"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: false,
    spicyLevel: "none",
    servings: 1,
    preparationTime: 7,
    calories: 520,
    status: "AVAILABLE",
    isFeatured: false,
    isBestseller: false,
    sortOrder: 30,
    complementaryItems: [],
    modifiers: [],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  entradas: "Entradas",
  "pratos-principais": "Hambúrgueres",
  sobremesas: "Sobremesas",
  bebidas: "Bebidas",
  combos: "Combos",
  promocoes: "Promoções",
};

// =========================================================
// Página principal do Cardápio
// =========================================================

export default function CardapioPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<MenuItem | null>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [lastOrder, setLastOrder] = useState<MenuOrder | null>(null);

  const {
    items: cartItems,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    orderType,
    estimatedTime,
    setOrderType,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    submitOrder,
    isLoading,
  } = useOrder("demo", MOCK_CONFIG.deliveryFee);

  const isOpen = useMemo(() => isRestaurantOpen(MOCK_CONFIG.openingHours), []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(MOCK_ITEMS.map(i => i.category)));
    return ["all", ...unique];
  }, []);

  const filteredItems = useMemo(() => {
    let result = MOCK_ITEMS.filter(i => i.isActive);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.ingredients.some(ing => ing.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== "all") {
      result = result.filter(i => i.category === activeCategory);
    }

    return result.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [searchQuery, activeCategory]);

  const handleAddToCart = (item: MenuItem, quantity = 1, modifiers: Array<{ modifierId: string; optionId: string; name: string; additionalPrice: number }> = [], notes?: string) => {
    if (!isOpen) return;
    // Se tem modificadores obrigatórios e nenhum foi passado, abrir modal
    const hasRequiredModifiers = item.modifiers.some(m => m.required);
    if (hasRequiredModifiers && modifiers.length === 0 && quantity === 1 && !notes) {
      setDetailsItem(item);
      return;
    }
    addItem(item, quantity, modifiers, notes);
    setCartOpen(true);
  };

  const handleCheckout = async () => {
    if (checkoutMode) {
      const order = await submitOrder();
      if (order) {
        setLastOrder(order);
        setCartOpen(false);
        setCheckoutMode(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setCheckoutMode(true);
      setCartOpen(false);
    }
  };

  // ==========================================
  // Tela de confirmação
  // ==========================================
  if (lastOrder) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--text-success)]/10 flex items-center justify-center">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Pedido Confirmado!</h1>
          <p className="text-[var(--text-secondary)] mb-1">
            Seu pedido <span className="font-mono font-medium">{lastOrder.orderNumber}</span> foi enviado para a cozinha.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Tempo estimado: ~{estimatedTime > 0 ? estimatedTime : lastOrder.estimatedTime} minutos
          </p>

          <div className="card p-6 text-left mb-8">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Resumo</h2>
            <ul className="space-y-2 text-sm mb-4">
              {lastOrder.items.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">{item.quantity}× {item.menuItem?.name}</span>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-[var(--border-default)]">
              <span>Total</span>
              <span className="text-[var(--brand-amber)]">{formatCurrency(lastOrder.total)}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className="badge badge-warning">Pendente — aguardando confirmação</span>
            </div>
          </div>

          <button onClick={() => setLastOrder(null)} className="btn btn-primary">
            Fazer novo pedido
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
              <span className="text-2xl">🍔</span>
              <div>
                <p className="font-bold text-[var(--text-primary)] leading-tight">{MOCK_CONFIG.restaurantName}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {isOpen ? (
                    <span className="flex items-center gap-1 text-[var(--text-success)]">
                      <CircleDot className="w-3 h-3" /> Aberto agora
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[var(--text-danger)]">
                      <CircleDot className="w-3 h-3" /> Fechado • abre {getNextOpeningTime(MOCK_CONFIG.openingHours).toLowerCase()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={`tel:${MOCK_CONFIG.contactPhone}`} className="btn btn-ghost p-2" aria-label="Ligar para o restaurante">
                <Phone className="w-5 h-5" />
              </a>
              <button
                onClick={() => setCartOpen(true)}
                className="btn btn-primary relative"
                aria-label={`Ver carrinho com ${itemCount} itens`}
              >
                <ShoppingBag className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Carrinho</span>
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
      <section className="relative bg-gradient-to-br from-[#431407] via-[#7c2d12] to-[#9a3412] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-amber-300 font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Entrega em ~{MOCK_CONFIG.averageDeliveryTime} min
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{MOCK_CONFIG.tagline}</h1>
            <p className="text-white/80 mb-6">{MOCK_CONFIG.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <MapPin className="w-4 h-4" /> {MOCK_CONFIG.address.neighborhood}, {MOCK_CONFIG.address.city}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <ShoppingBag className="w-4 h-4" /> Entrega {formatCurrency(MOCK_CONFIG.deliveryFee)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Checkout (quando ativo) ============ */}
      {checkoutMode && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Finalizar Pedido</h2>
            <button onClick={() => setCheckoutMode(false)} className="btn btn-ghost text-sm">
              ← Voltar ao cardápio
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Tipo de pedido */}
              <div className="card p-5">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Como você quer receber?</h3>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "DINE_IN" as const, label: "No local" },
                    { id: "TAKEAWAY" as const, label: "Retirada" },
                    { id: "DELIVERY" as const, label: "Entrega" },
                  ]).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setOrderType(t.id)}
                      className={clsx(
                        "py-2.5 px-3 rounded-lg border text-sm font-medium transition-all",
                        orderType === t.id
                          ? "bg-[var(--brand-amber)] border-[var(--brand-amber)] text-white"
                          : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-amber)]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dados do cliente */}
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)]">Seus dados</h3>
                <div>
                  <label htmlFor="cust-name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome *</label>
                  <input
                    id="cust-name"
                    type="text"
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-amber)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-amber)]"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label htmlFor="cust-phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Telefone / WhatsApp *</label>
                  <input
                    id="cust-phone"
                    type="tel"
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-amber)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-amber)]"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                {orderType === "DELIVERY" && (
                  <div>
                    <label htmlFor="cust-addr" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Endereço de entrega *</label>
                    <textarea
                      id="cust-addr"
                      rows={2}
                      className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-amber)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-amber)] resize-none"
                      placeholder="Rua, número, complemento, bairro"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Resumo lateral */}
            <div>
              <div className="sticky top-24 card p-5 space-y-3">
                <h3 className="font-semibold text-[var(--text-primary)]">Resumo</h3>
                <ul className="space-y-1.5 text-sm">
                  {cartItems.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-[var(--text-secondary)] truncate pr-2">{item.quantity}× {item.menuItem.name}</span>
                      <span>{formatCurrency(item.total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-[var(--border-default)] space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Entrega</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2">
                    <span>Total</span>
                    <span className="text-[var(--brand-amber)]">{formatCurrency(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || cartItems.length === 0}
                  className="btn btn-primary w-full py-3"
                >
                  {isLoading ? "Enviando..." : `Confirmar pedido • ${formatCurrency(total)}`}
                </button>
                <p className="text-xs text-center text-[var(--text-muted)]">
                  Pagamento na entrega ou via PIX após confirmação
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ Menu principal ============ */}
      {!checkoutMode && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full pl-12 pr-10 py-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand-amber)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-amber)]"
              aria-label="Buscar itens do cardápio"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Limpar busca"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Categorias */}
          <nav className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4" aria-label="Categorias do cardápio">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  activeCategory === cat
                    ? "bg-[var(--brand-amber)] border-[var(--brand-amber)] text-white"
                    : "bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-amber)]"
                )}
              >
                {cat === "all" ? "Tudo" : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </nav>

          {/* Aviso fechado */}
          {!isOpen && (
            <div className="mb-6 p-4 bg-[var(--text-warning)]/10 border border-[var(--text-warning)]/30 rounded-xl text-sm text-[var(--text-warning)]">
              O restaurante está fechado no momento, mas você pode montar seu pedido — ele será confirmado no próximo horário de funcionamento.
            </div>
          )}

          {/* Grid de itens */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Nada encontrado</h3>
              <p className="text-[var(--text-muted)]">Tente outra busca ou categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToCart={i => handleAddToCart(i)}
                  onShowDetails={setDetailsItem}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* ============ Footer ============ */}
      <footer className="border-t border-[var(--border-default)] py-10 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
          <p className="font-medium text-[var(--text-primary)] mb-1">{MOCK_CONFIG.restaurantName}</p>
          <p>{MOCK_CONFIG.address.street}, {MOCK_CONFIG.address.number} — {MOCK_CONFIG.address.neighborhood}, {MOCK_CONFIG.address.city}/{MOCK_CONFIG.address.state}</p>
          <p className="mt-1">{MOCK_CONFIG.contactPhone} • Powered by Nexis Digital</p>
        </div>
      </footer>

      {/* ============ Cart Sidebar ============ */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        itemCount={itemCount}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
        orderType={orderType}
        estimatedTime={estimatedTime}
        onOrderTypeChange={setOrderType}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />

      {/* ============ Item Details Modal ============ */}
      <ItemDetailsModal
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}