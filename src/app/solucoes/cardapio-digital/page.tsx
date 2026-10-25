"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/layout/DemoShell";
import { currencyBRL } from "@/lib/cn";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Addon { id: string; name: string; price: number; }
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  addons?: Addon[];
}

const CATEGORIES = ["Todos", "Burgers", "Porções", "Bebidas", "Sobremesas"];

const MENU: MenuItem[] = [
  {
    id: "m1",
    name: "Burger Clássico",
    description: "Pão brioche, 150g de blend, queijo, alface, tomate e molho da casa.",
    price: 32,
    category: "Burgers",
    image: "/images/menu-burger.jpg",
    addons: [
      { id: "bacon", name: "Bacon extra", price: 6 },
      { id: "cheddar", name: "Cheddar extra", price: 4 },
      { id: "ovo", name: "Ovo", price: 3 },
    ],
  },
  {
    id: "m2",
    name: "Burger Duplo",
    description: "Dois blends 120g, queijo, cebola caramelizada e molho barbecue.",
    price: 44,
    category: "Burgers",
    image: "/images/menu-burger-2.jpg",
    addons: [
      { id: "bacon", name: "Bacon extra", price: 6 },
      { id: "cheddar", name: "Cheddar extra", price: 4 },
    ],
  },
  {
    id: "m3",
    name: "Burger Vegano",
    description: "Hambúrguer de grão-de-bico, rúcula, tomate seco e maionese verde.",
    price: 36,
    category: "Burgers",
    image: "/images/menu-burger.jpg",
  },
  {
    id: "m4",
    name: "Batata Rústica",
    description: "Porção 400g com alecrim, sal grosso e maionese da casa.",
    price: 26,
    category: "Porções",
    image: "/images/menu-fries.jpg",
    addons: [{ id: "cheddar-bacon", name: "Cheddar e bacon", price: 8 }],
  },
  {
    id: "m5",
    name: "Onion Rings",
    description: "Anéis de cebola empanados 300g com molho barbecue.",
    price: 24,
    category: "Porções",
    image: "/images/menu-fries.jpg",
  },
  {
    id: "m6",
    name: "Refrigerante Lata",
    description: "Lata 350ml. Sabores no atendimento.",
    price: 7,
    category: "Bebidas",
    image: "/images/menu-fries.jpg",
  },
  {
    id: "m7",
    name: "Suco Natural",
    description: "500ml da fruta. Laranja, limão, maracujá ou abacaxi.",
    price: 12,
    category: "Bebidas",
    image: "/images/menu-fries.jpg",
  },
  {
    id: "m8",
    name: "Brownie com Sorvete",
    description: "Brownie quentinho com bola de sorvete de creme.",
    price: 22,
    category: "Sobremesas",
    image: "/images/menu-fries.jpg",
  },
];

interface CartEntry {
  item: MenuItem;
  qty: number;
  selectedAddons: string[];
  notes: string;
}

export default function CardapioDigitalPage() {
  return <MenuDemo />;
}

function MenuDemo() {
  const [category, setCategory] = useState("Todos");
  const [active, setActive] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const items = useMemo(
    () => MENU.filter((m) => category === "Todos" || m.category === category),
    [category],
  );

  const subtotal = useMemo(
    () =>
      cart.reduce((acc, e) => {
        const addons = (e.item.addons ?? [])
          .filter((a) => e.selectedAddons.includes(a.id))
          .reduce((s, a) => s + a.price, 0);
        return acc + (e.item.price + addons) * e.qty;
      }, 0),
    [cart],
  );

  const count = cart.reduce((s, e) => s + e.qty, 0);

  function addEntry(entry: CartEntry) {
    setCart((c) => [...c, entry]);
    setActive(null);
    setCartOpen(true);
  }

  function removeEntry(i: number) {
    setCart((c) => c.filter((_, idx) => idx !== i));
  }

  return (
    <DemoShell
      title="Cardápio digital"
      subtitle="Pedido online com adicionais e envio pelo WhatsApp"
      kind="Demonstração funcional"
      solutionSlug="cardapio-digital"
      accent="amber"
    >
      {/* Header do restaurante */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/menu-burger.jpg"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-nx-bg/70 via-nx-bg/90 to-nx-bg" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="nx-mono text-[10px] uppercase tracking-[0.24em] text-amber-300">
            demo · lanchonete fictícia
          </p>
          <h1 className="nx-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Brasa &amp; Pão
          </h1>
          <p className="mt-2 text-sm text-nx-muted">
            Hambúrgueria artesanal · Aberto das 18h às 23h
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Categorias */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === c
                  ? "border-amber-400/50 bg-amber-500/15 text-white"
                  : "border-white/10 bg-white/[0.02] text-nx-muted hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid de pratos */}
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m)}
              className="group nx-edge-light relative flex items-stretch gap-4 overflow-hidden rounded-2xl bg-nx-surface p-3 text-left transition hover:-translate-y-0.5"
            >
              <div className="relative h-28 w-28 flex-none overflow-hidden rounded-xl sm:h-32 sm:w-32">
                <img
                  src={m.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col py-1">
                <span className="nx-mono text-[9px] uppercase tracking-[0.2em] text-amber-300">
                  {m.category}
                </span>
                <h3 className="nx-display mt-1 text-lg font-medium tracking-tight">
                  {m.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-nx-muted">
                  {m.description}
                </p>
                <p className="nx-display mt-auto pt-2 text-lg font-medium">
                  {currencyBRL(m.price)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botão flutuante do carrinho */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 px-5 text-sm font-semibold text-black shadow-[0_20px_50px_-10px_rgba(251,191,36,0.6)] transition hover:from-amber-300 hover:to-amber-500"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.4 7h12.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Ver pedido
        {count > 0 && (
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-2 text-xs text-amber-300">
            {count}
          </span>
        )}
      </button>

      {active && (
        <ItemModal item={active} onClose={() => setActive(null)} onAdd={addEntry} />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          subtotal={subtotal}
          onClose={() => setCartOpen(false)}
          onRemove={removeEntry}
        />
      )}
    </DemoShell>
  );
}

function ItemModal({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (e: CartEntry) => void;
}) {
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function toggle(id: string) {
    setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  const addonsTotal = (item.addons ?? [])
    .filter((a) => addons.includes(a.id))
    .reduce((s, a) => s + a.price, 0);
  const unit = item.price + addonsTotal;
  const subtotal = unit * qty;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="nx-edge-light w-full max-w-md overflow-hidden rounded-3xl bg-nx-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-nx-surface via-transparent to-transparent" />
        </div>
        <div className="-mt-10 relative p-6">
          <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">
            {item.category}
          </span>
          <h2 className="nx-display mt-1 text-2xl font-medium tracking-tight">{item.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-nx-muted">{item.description}</p>

          {item.addons && item.addons.length > 0 && (
            <div className="mt-5">
              <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">Adicionais</p>
              <ul className="mt-2 space-y-2">
                {item.addons.map((a) => (
                  <li key={a.id}>
                    <label className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-sm transition hover:border-white/10">
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={addons.includes(a.id)}
                          onChange={() => toggle(a.id)}
                          className="h-4 w-4 accent-amber-400"
                        />
                        {a.name}
                      </span>
                      <span className="nx-mono text-[11px] text-amber-300">
                        +{currencyBRL(a.price)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="mt-5 block">
            <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">Observações</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sem cebola, ponto da carne, etc."
              className="mt-1.5 min-h-[72px] w-full rounded-xl border border-white/10 bg-nx-bg/60 px-3 py-2 text-sm focus:border-amber-400/50 focus:outline-none"
            />
          </label>

          <div className="mt-5 flex items-center justify-between">
            <div className="inline-flex items-center rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-10 w-10 text-sm hover:bg-white/5"
                aria-label="Diminuir"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-10 w-10 text-sm hover:bg-white/5"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
            <p className="nx-display text-2xl font-medium">{currencyBRL(subtotal)}</p>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.06]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onAdd({ item, qty, selectedAddons: addons, notes })}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
            >
              Adicionar ao pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  cart,
  subtotal,
  onClose,
  onRemove,
}: {
  cart: CartEntry[];
  subtotal: number;
  onClose: () => void;
  onRemove: (i: number) => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState("Pix");
  const [change, setChange] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe seu nome.";
    if (mode === "delivery" && !address.trim()) e.address = "Informe o endereço de entrega.";
    return e;
  }

  function send() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const lines: string[] = [
      "*Novo pedido — Brasa & Pão*",
      `(demonstração de cardápio digital)`,
      "",
      `*Cliente:* ${name}`,
      `*Modalidade:* ${mode === "delivery" ? "Entrega" : "Retirada no local"}`,
    ];
    if (mode === "delivery") lines.push(`*Endereço:* ${address}`);
    lines.push(`*Pagamento:* ${pay}`);
    if (pay === "Dinheiro" && change.trim()) lines.push(`Troco para: ${change}`);
    lines.push("", "*Itens:*");
    cart.forEach((e) => {
      const addons = (e.item.addons ?? [])
        .filter((a) => e.selectedAddons.includes(a.id))
        .map((a) => a.name);
      const addonsTotal = (e.item.addons ?? [])
        .filter((a) => e.selectedAddons.includes(a.id))
        .reduce((s, a) => s + a.price, 0);
      const unit = e.item.price + addonsTotal;
      const line = [
        `• ${e.qty}x ${e.item.name} — ${currencyBRL(unit * e.qty)}`,
        addons.length ? `  Adicionais: ${addons.join(", ")}` : "",
        e.notes.trim() ? `  Obs.: ${e.notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      lines.push(line);
    });
    lines.push("", `*Total: ${currencyBRL(subtotal)}*`);
    if (generalNotes.trim()) lines.push("", `Observações gerais: ${generalNotes}`);

    const url = buildWhatsAppUrl(lines.join("\n"));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const inputCls =
    "h-11 w-full rounded-xl border border-white/10 bg-nx-bg/60 px-3.5 text-sm focus:border-amber-400/50 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/5 bg-nx-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
              {step === "cart" ? "carrinho" : "checkout"}
            </p>
            <h2 className="nx-display text-xl font-medium tracking-tight">
              {step === "cart" ? "Seu pedido" : "Finalizar pedido"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-sm hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="nx-display mt-5 text-xl font-medium tracking-tight">Pedido preparado</p>
            <p className="mt-2 max-w-xs text-sm text-nx-muted">
              Abrimos o WhatsApp com o resumo. Esta é uma demonstração — nenhum pedido foi realmente transmitido.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm hover:bg-white/[0.06]"
            >
              Fechar
            </button>
          </div>
        ) : step === "cart" ? (
          <>
            {cart.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-nx-muted">Nenhum item adicionado.</p>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto nx-scroll pr-1">
                  {cart.map((e, idx) => {
                    const addons = (e.item.addons ?? [])
                      .filter((a) => e.selectedAddons.includes(a.id))
                      .map((a) => a.name);
                    const addonsTotal = (e.item.addons ?? [])
                      .filter((a) => e.selectedAddons.includes(a.id))
                      .reduce((s, a) => s + a.price, 0);
                    const unit = e.item.price + addonsTotal;
                    return (
                      <li key={idx} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        <img src={e.item.image} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">
                              {e.qty}x {e.item.name}
                            </p>
                            <p className="nx-display text-sm font-medium">
                              {currencyBRL(unit * e.qty)}
                            </p>
                          </div>
                          {addons.length > 0 && (
                            <p className="nx-mono mt-0.5 text-[10px] text-amber-300">
                              + {addons.join(", ")}
                            </p>
                          )}
                          {e.notes.trim() && (
                            <p className="mt-1 text-xs text-nx-muted">Obs.: {e.notes}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemove(idx)}
                            className="mt-2 text-xs text-nx-muted hover:text-rose-300"
                          >
                            Remover
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="nx-mono text-[10px] uppercase tracking-widest text-nx-muted">subtotal</span>
                    <span className="nx-display text-lg font-medium">{currencyBRL(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-nx-muted">Taxa de entrega informada no atendimento.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
                >
                  Continuar
                  <span>→</span>
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto nx-scroll pr-1">
              <L label="Seu nome" error={errors.name}>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </L>

              <p className="mt-5 nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">Modalidade</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["delivery", "pickup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`h-11 rounded-xl border text-sm transition ${
                      mode === m
                        ? "border-amber-400/50 bg-amber-500/15 text-white"
                        : "border-white/10 bg-white/[0.02] text-nx-muted hover:text-white"
                    }`}
                  >
                    {m === "delivery" ? "🛵 Entrega" : "🏪 Retirada"}
                  </button>
                ))}
              </div>

              {mode === "delivery" && (
                <div className="mt-4">
                  <L label="Endereço de entrega" error={errors.address}>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro, complemento"
                      className="min-h-[80px] w-full rounded-xl border border-white/10 bg-nx-bg/60 px-3.5 py-2.5 text-sm focus:border-amber-400/50 focus:outline-none"
                    />
                  </L>
                </div>
              )}

              <div className="mt-4">
                <L label="Forma de pagamento">
                  <select value={pay} onChange={(e) => setPay(e.target.value)} className={inputCls}>
                    <option>Pix</option>
                    <option>Cartão na entrega</option>
                    <option>Dinheiro</option>
                  </select>
                </L>
              </div>

              {pay === "Dinheiro" && (
                <div className="mt-4">
                  <L label="Troco para quanto?">
                    <input value={change} onChange={(e) => setChange(e.target.value)} placeholder="Ex.: R$ 50" className={inputCls} />
                  </L>
                </div>
              )}

              <div className="mt-4">
                <L label="Observações gerais">
                  <textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Ex.: tocar a campainha, deixar na portaria..."
                    className="min-h-[72px] w-full rounded-xl border border-white/10 bg-nx-bg/60 px-3.5 py-2.5 text-sm focus:border-amber-400/50 focus:outline-none"
                  />
                </L>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="nx-mono text-[10px] uppercase tracking-widest text-nx-muted">total</span>
                <span className="nx-display text-lg font-medium">{currencyBRL(subtotal)}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.06]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={send}
                className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
              >
                Enviar pedido
                <span>→</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function L({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
    </label>
  );
}
