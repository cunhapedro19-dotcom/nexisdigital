"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/layout/DemoShell";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import { currencyBRL } from "@/lib/cn";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DemoArt } from "@/components/visual/DemoArt";
import { useModalA11y } from "@/lib/use-modal-a11y";
import { useLocalStorage } from "@/lib/use-local-storage";
import { AdminFab } from "@/components/admin/AdminKit";
import {
  CatalogoAdminPanel,
  type CatalogItem,
  type CatalogoData,
} from "./AdminPanel";

// Arte de cada produto do seed (o painel permite trocar depois).
const SEED_ART: Record<string, CatalogItem["art"]> = {
  p1: "tee",
  p2: "tee",
  p3: "hoodie",
  p4: "hoodie",
  p5: "cap",
  p6: "cap",
  p7: "bag",
  p8: "bag",
};

// Estado inicial persistido: produtos + categorias (editáveis pelo painel).
const SEED: CatalogoData = {
  categories: ["Camisetas", "Moletons", "Bonés", "Acessórios"],
  products: CATALOG_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description,
    art: SEED_ART[p.id] ?? "tee",
    available: true,
  })),
};

export default function CatalogoDigitalPage() {
  return <CatalogDemo />;
}

interface CartItem {
  id: string;
  qty: number;
}

function CatalogDemo() {
  // Dados do catálogo persistidos no navegador — a vitrine e o painel
  // de demonstração compartilham o mesmo estado.
  const { value: data, setValue: setData, reset: resetData } = useLocalStorage<CatalogoData>(
    "nx-demo-catalogo:v1",
    SEED,
  );
  const [category, setCategory] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const products = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data.products.filter((p) => {
      if (category !== "Todos" && p.category !== category) return false;
      if (s && !p.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [data.products, category, search]);

  const cartDetails = useMemo(() => {
    const items = cart
      .map((c) => {
        const p = data.products.find((x) => x.id === c.id);
        if (!p) return null;
        return { ...p, qty: c.qty, subtotal: p.price * c.qty };
      })
      .filter(Boolean) as Array<CatalogItem & { qty: number; subtotal: number }>;
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return { items, total, count: items.reduce((s, i) => s + i.qty, 0) };
  }, [cart, data.products]);

  function add(id: string) {
    setCart((prev) => {
      const found = prev.find((c) => c.id === id);
      if (found) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id, qty: 1 }];
    });
    setJustAdded(id);
    setTimeout(() => setJustAdded(null), 900);
  }

  function updateQty(id: string, qty: number) {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty } : c)).filter((c) => c.qty > 0),
    );
  }

  function remove(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function sendWhatsApp() {
    if (cartDetails.items.length === 0) return;
    const lines = [
      "Olá! Gostaria de solicitar um orçamento:",
      "",
      ...cartDetails.items.map((i) => `• ${i.qty}x ${i.name} — ${currencyBRL(i.subtotal)}`),
      "",
      `Total: ${currencyBRL(cartDetails.total)}`,
      "",
      "(pedido gerado pela demonstração de catálogo digital)",
    ];
    const url = buildWhatsAppUrl(lines.join("\n"));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <DemoShell
      title="Catálogo digital"
      subtitle="Vitrine online com busca, categorias e pedidos"
      kind="Demonstração funcional"
      solutionSlug="catalogo-digital"
      accent="violet"
    >
      {/* Header da loja fictícia */}
      <header className="border-b border-white/5 bg-nx-bg/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
              demo · loja fictícia
            </p>
            <h1 className="nx-display mt-1 text-2xl font-medium tracking-tight sm:text-3xl">
              Ateliê Aurora
            </h1>
            <p className="text-sm text-nx-muted">Roupas e acessórios de produção independente.</p>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden gap-1 text-sm md:flex">
              {["Todos", ...data.categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    category === c
                      ? "bg-white/10 text-white"
                      : "text-nx-muted hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.4 7h12.8M10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Carrinho
              {cartDetails.count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-black">
                  {cartDetails.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Barra de busca + categorias mobile */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-dim" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="h-11 w-full rounded-xl border border-white/10 bg-nx-surface pl-9 pr-3 text-sm focus:border-white/30 focus:outline-none"
              aria-label="Buscar produto"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:hidden">
            {["Todos", ...data.categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  category === c
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-nx-muted hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de produtos */}
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-nx-surface p-16 text-center">
            <p className="text-nx-muted">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <article
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-nx-surface transition hover:-translate-y-0.5"
              >
                <div className="nx-edge-light overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className="relative block aspect-[4/5] w-full overflow-hidden"
                    aria-label={`Ver detalhes de ${p.name}`}
                  >
                    <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                      <DemoArt variant={p.art} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 nx-mono rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/90 backdrop-blur">
                      {p.category}
                    </span>
                    {!p.available && (
                      <span className="nx-mono absolute right-3 top-3 rounded-full border border-rose-400/30 bg-rose-500/20 px-2 py-0.5 text-[9px] uppercase tracking-widest text-rose-200 backdrop-blur">
                        indisponível
                      </span>
                    )}
                  </button>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="nx-display text-base font-medium tracking-tight">
                        {p.name}
                      </h3>
                      <p className="nx-display whitespace-nowrap text-base font-medium">
                        {currencyBRL(p.price)}
                      </p>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-nx-muted">
                      {p.description}
                    </p>
                    {!p.available ? (
                      <button
                        type="button"
                        disabled
                        className="mt-4 inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-nx-dim"
                      >
                        Produto indisponível
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => add(p.id)}
                        className={`mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition ${
                          justAdded === p.id
                            ? "bg-emerald-500/90 text-black"
                            : "border border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.08]"
                        }`}
                      >
                        {justAdded === p.id ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Adicionado
                          </>
                        ) : (
                          <>Adicionar ao carrinho</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <ModalDetalhes
          item={selected}
          onClose={() => setSelected(null)}
          onAdd={() => {
            add(selected.id);
            setSelected(null);
            setCartOpen(true);
          }}
        />
      )}

      {/* Drawer do carrinho */}
      {cartOpen && (
        <CartDrawer
          items={cartDetails.items}
          total={cartDetails.total}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={remove}
          onSend={sendWhatsApp}
        />
      )}

      {/* Acesso ao painel administrativo da demonstração */}
      <AdminFab onClick={() => setAdminOpen(true)} label="Painel de demonstração" />

      {adminOpen && (
        <CatalogoAdminPanel
          data={data}
          onChange={setData}
          onClose={() => setAdminOpen(false)}
          onReset={resetData}
        />
      )}
    </DemoShell>
  );
}

/** Drawer do carrinho, com foco preso e fechamento por Escape. */
function CartDrawer({
  items,
  total,
  onClose,
  onUpdateQty,
  onRemove,
  onSend,
}: {
  items: Array<CatalogItem & { qty: number; subtotal: number }>;
  total: number;
  onClose: () => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSend: () => void;
}) {
  const drawerRef = useModalA11y(true, onClose);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <aside
        ref={drawerRef as React.RefObject<HTMLElement | null>}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/5 bg-nx-surface p-5 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
              checkout
            </p>
            <h2 className="nx-display text-xl font-medium tracking-tight">Seu pedido</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-sm hover:bg-white/5"
            aria-label="Fechar carrinho"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-nx-muted">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto nx-scroll pr-1">
              {items.map((i) => (
                <li key={i.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="h-16 w-14 flex-none overflow-hidden rounded-lg">
                    <DemoArt variant={i.art} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="nx-mono text-[10px] text-nx-muted">
                      {currencyBRL(i.price)} · un.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(i.id, i.qty - 1)}
                          className="h-7 w-7 text-sm hover:bg-white/5"
                          aria-label="Diminuir quantidade"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(i.id, i.qty + 1)}
                          className="h-7 w-7 text-sm hover:bg-white/5"
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(i.id)}
                        className="ml-auto text-xs text-nx-muted hover:text-rose-300"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <p className="nx-display text-sm font-medium">
                    {currencyBRL(i.subtotal)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="nx-mono text-[10px] uppercase tracking-widest text-nx-muted">
                  subtotal
                </span>
                <span className="nx-display text-lg font-medium">
                  {currencyBRL(total)}
                </span>
              </div>
              <p className="mt-1 text-xs text-nx-muted">
                Valores de demonstração. Frete e prazos são combinados no atendimento.
              </p>
            </div>

            <button
              type="button"
              onClick={onSend}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Enviar pedido pelo WhatsApp
              <span>→</span>
            </button>
          </>
        )}
      </aside>
    </div>
  );
}

/** Modal de detalhes do produto, com foco preso e fechamento por Escape. */
function ModalDetalhes({
  item,
  onClose,
  onAdd,
}: {
  item: CatalogItem;
  onClose: () => void;
  onAdd: () => void;
}) {
  const modalRef = useModalA11y(true, onClose);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} — detalhes do produto`}
        className="nx-edge-light w-full max-w-3xl overflow-hidden rounded-3xl bg-nx-surface outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square w-full md:aspect-auto">
            <DemoArt variant={item.art} />
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
              {item.category}
            </span>
            <h2 className="nx-display mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
              {item.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-nx-muted">
              {item.description}
            </p>
            <p className="nx-display mt-6 text-3xl font-medium tracking-tight">
              {currencyBRL(item.price)}
            </p>
            <div className="mt-auto flex gap-2 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.06]"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={onAdd}
                disabled={!item.available}
                className={`inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${
                  item.available
                    ? "bg-white text-black hover:bg-white/85"
                    : "cursor-not-allowed bg-white/10 text-nx-dim"
                }`}
              >
                {item.available ? "Adicionar ao carrinho" : "Indisponível"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
