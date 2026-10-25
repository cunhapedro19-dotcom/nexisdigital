"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/layout/DemoShell";
import { CATALOG_CATEGORIES, CATALOG_PRODUCTS, type CatalogProduct } from "@/data/catalog";
import { currencyBRL } from "@/lib/cn";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Mapeamento das fotos reais para cada produto da demo.
const PRODUCT_IMAGES: Record<string, string> = {
  p1: "/images/catalog-tee.jpg",
  p2: "/images/catalog-tee.jpg",
  p3: "/images/catalog-hoodie.jpg",
  p4: "/images/catalog-hoodie.jpg",
  p5: "/images/catalog-cap.jpg",
  p6: "/images/catalog-cap.jpg",
  p7: "/images/catalog-bag.jpg",
  p8: "/images/catalog-bag.jpg",
};

export default function CatalogoDigitalPage() {
  return <CatalogDemo />;
}

interface CartItem {
  id: string;
  qty: number;
}

function CatalogDemo() {
  const [category, setCategory] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const products = useMemo(() => {
    const s = search.trim().toLowerCase();
    return CATALOG_PRODUCTS.filter((p) => {
      if (category !== "Todos" && p.category !== category) return false;
      if (s && !p.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [category, search]);

  const cartDetails = useMemo(() => {
    const items = cart
      .map((c) => {
        const p = CATALOG_PRODUCTS.find((x) => x.id === c.id);
        if (!p) return null;
        return { ...p, qty: c.qty, subtotal: p.price * c.qty };
      })
      .filter(Boolean) as Array<CatalogProduct & { qty: number; subtotal: number }>;
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return { items, total, count: items.reduce((s, i) => s + i.qty, 0) };
  }, [cart]);

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
            <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-violet-200">
              demo · loja fictícia
            </p>
            <h1 className="nx-display mt-1 text-2xl font-medium tracking-tight sm:text-3xl">
              Ateliê Aurora
            </h1>
            <p className="text-sm text-nx-muted">Roupas e acessórios de produção independente.</p>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden gap-1 text-sm md:flex">
              {CATALOG_CATEGORIES.map((c) => (
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
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[11px] font-semibold text-white">
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
              className="h-11 w-full rounded-xl border border-white/10 bg-nx-surface pl-9 pr-3 text-sm focus:border-violet-400/50 focus:outline-none"
              aria-label="Buscar produto"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:hidden">
            {CATALOG_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  category === c
                    ? "border-violet-400/40 bg-violet-500/15 text-white"
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
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url(${PRODUCT_IMAGES[p.id]})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 nx-mono rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/90 backdrop-blur">
                      {p.category}
                    </span>
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
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal
        >
          <div
            className="nx-edge-light w-full max-w-3xl overflow-hidden rounded-3xl bg-nx-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              <div
                className="aspect-square w-full bg-cover bg-center md:aspect-auto"
                style={{ backgroundImage: `url(${PRODUCT_IMAGES[selected.id]})` }}
              />
              <div className="flex flex-col p-6 md:p-8">
                <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                  {selected.category}
                </span>
                <h2 className="nx-display mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
                  {selected.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-nx-muted">
                  {selected.description}
                </p>
                <p className="nx-display mt-6 text-3xl font-medium tracking-tight">
                  {currencyBRL(selected.price)}
                </p>
                <div className="mt-auto flex gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm hover:bg-white/[0.06]"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      add(selected.id);
                      setSelected(null);
                      setCartOpen(true);
                    }}
                    className="nx-glow-violet inline-flex h-11 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer do carrinho */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/5 bg-nx-surface p-5"
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
                onClick={() => setCartOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-sm hover:bg-white/5"
                aria-label="Fechar carrinho"
              >
                ✕
              </button>
            </div>

            {cartDetails.items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-nx-muted">Seu carrinho está vazio.</p>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto nx-scroll pr-1">
                  {cartDetails.items.map((i) => (
                    <li key={i.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div
                        className="h-16 w-14 flex-none rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${PRODUCT_IMAGES[i.id]})` }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{i.name}</p>
                        <p className="nx-mono text-[10px] text-nx-muted">
                          {currencyBRL(i.price)} · un.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="inline-flex items-center rounded-lg border border-white/10">
                            <button
                              type="button"
                              onClick={() => updateQty(i.id, i.qty - 1)}
                              className="h-7 w-7 text-sm hover:bg-white/5"
                              aria-label="Diminuir quantidade"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-xs">{i.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(i.id, i.qty + 1)}
                              className="h-7 w-7 text-sm hover:bg-white/5"
                              aria-label="Aumentar quantidade"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(i.id)}
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
                      {currencyBRL(cartDetails.total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-nx-muted">
                    Valores de demonstração. Frete e prazos são combinados no atendimento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={sendWhatsApp}
                  className="nx-glow-violet mt-4 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
                >
                  Enviar pedido pelo WhatsApp
                  <span>→</span>
                </button>
              </>
            )}
          </aside>
        </div>
      )}
    </DemoShell>
  );
}
