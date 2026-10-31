"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { currencyBRL } from "@/lib/cn";
import { useLocalStorage } from "@/lib/use-local-storage";
import { AdminFab } from "@/components/admin/AdminKit";
import {
  LivrariaAdminPanel,
  type LivrariaBook,
  type LivrariaData,
} from "./AdminPanel";

type Book = LivrariaBook;

// Capas ilustrativas geradas com CSS; títulos e autores fictícios.
const SEED: LivrariaData = {
  categories: ["Romance", "Não ficção", "Infantil", "Quadrinhos", "Técnicos"],
  books: [
  {
    id: "b1",
    title: "O Cartógrafo de Memórias",
    author: "Helena Prado",
    category: "Romance",
    price: 54.9,
    year: 2023,
    synopsis: "Uma pesquisadora retorna à cidade natal e reencontra mapas deixados pelo avô.",
    colors: ["#6d28d9", "#1e1b4b"],
  },
  {
    id: "b2",
    title: "Pequenas Revoluções",
    author: "André Vilas",
    category: "Não ficção",
    price: 62,
    year: 2024,
    synopsis: "Ensaios sobre hábitos que transformam rotinas, equipes e cidades.",
    colors: ["#ea580c", "#431407"],
  },
  {
    id: "b3",
    title: "A Menina que Contava Estrelas",
    author: "Lia Monteiro",
    category: "Infantil",
    price: 39.9,
    year: 2022,
    synopsis: "Uma fábula ilustrada sobre curiosidade e coragem.",
    colors: ["#0891b2", "#0c4a6e"],
  },
  {
    id: "b4",
    title: "Caderno de Silêncios",
    author: "Marina Lemos",
    category: "Romance",
    price: 48,
    year: 2021,
    synopsis: "Cartas nunca enviadas revelam uma história de amizade ao longo de décadas.",
    colors: ["#be185d", "#500724"],
  },
  {
    id: "b5",
    title: "Código & Contexto",
    author: "Rafael Souza",
    category: "Técnicos",
    price: 89.9,
    year: 2024,
    synopsis: "Um guia para pensar sistemas além da sintaxe, com foco em decisões.",
    colors: ["#059669", "#064e3b"],
  },
  {
    id: "b6",
    title: "A Cidade em Quatro Andares",
    author: "Bruno Costa",
    category: "Quadrinhos",
    price: 72,
    year: 2023,
    synopsis: "Graphic novel sobre quatro vizinhos cujas histórias se cruzam no elevador.",
    colors: ["#b45309", "#451a03"],
  },
  {
    id: "b7",
    title: "Jardim de Inverno",
    author: "Clara Nunes",
    category: "Romance",
    price: 45.5,
    year: 2020,
    synopsis: "Um romance de recomeços em uma pequena cidade do interior.",
    colors: ["#4338ca", "#1e1b4b"],
  },
  {
    id: "b8",
    title: "Economia do Cotidiano",
    author: "Diego Ramos",
    category: "Não ficção",
    price: 58,
    year: 2022,
    synopsis: "Conceitos econômicos explicados a partir de escolhas do dia a dia.",
    colors: ["#0f766e", "#042f2e"],
  },
  {
    id: "b9",
    title: "Dino e o Foguete de Papel",
    author: "Paula Reis",
    category: "Infantil",
    price: 36,
    year: 2023,
    synopsis: "Uma aventura sobre imaginação e amizade entre crianças e um cachorro inventor.",
    colors: ["#db2777", "#500724"],
  },
  {
    id: "b10",
    title: "Redes que Pensam",
    author: "Thiago Nunes",
    category: "Técnicos",
    price: 94,
    year: 2025,
    synopsis: "Fundamentos práticos de redes, segurança e arquitetura moderna.",
    colors: ["#1d4ed8", "#1e1b4b"],
  },
  {
    id: "b11",
    title: "Atlas dos Sentimentos",
    author: "Camila Rocha",
    category: "Quadrinhos",
    price: 68,
    year: 2024,
    synopsis: "Uma coleção de micro-histórias ilustradas sobre emoções comuns.",
    colors: ["#7c2d12", "#450a0a"],
  },
  {
    id: "b12",
    title: "Receitas de uma Avó Solitária",
    author: "Marina Lemos",
    category: "Não ficção",
    price: 52,
    year: 2021,
    synopsis: "Um livro de receitas com histórias de família em cada capítulo.",
    colors: ["#a16207", "#422006"],
  },
  ],
};

interface CartLine {
  id: string;
  qty: number;
}

export default function LivrariasPage() {
  return <BookstoreDemo />;
}

function BookstoreDemo() {
  // Dados da livraria persistidos no navegador — a vitrine e o painel
  // de demonstração compartilham o mesmo estado.
  const { value: data, setValue: setData, reset: resetData } = useLocalStorage<LivrariaData>(
    "nx-demo-livrarias:v1",
    SEED,
  );
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [active, setActive] = useState<Book | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.books.filter((b) => {
      if (category !== "Todos" && b.category !== category) return false;
      if (q && !(b.title + " " + b.author + " " + b.category).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.books, category, search]);

  const cartDetails = useMemo(() => {
    const items = cart
      .map((c) => {
        const b = data.books.find((x) => x.id === c.id);
        if (!b) return null;
        return { ...b, qty: c.qty, subtotal: b.price * c.qty };
      })
      .filter(Boolean) as Array<Book & { qty: number; subtotal: number }>;
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    return { items, total, count };
  }, [cart, data.books]);

  function add(id: string) {
    setCart((prev) => {
      const f = prev.find((c) => c.id === id);
      if (f) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id, qty: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    setCart((p) => p.map((c) => (c.id === id ? { ...c, qty } : c)).filter((c) => c.qty > 0));
  }

  function remove(id: string) {
    setCart((p) => p.filter((c) => c.id !== id));
  }

  function toggleWish(id: string) {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  }

  function sendCart() {
    if (cartDetails.items.length === 0) return;
    const lines = [
      "Olá! Gostaria de encomendar os seguintes livros:",
      "",
      ...cartDetails.items.map(
        (i) => `• ${i.qty}x "${i.title}" — ${i.author} — ${currencyBRL(i.subtotal)}`,
      ),
      "",
      `Total: ${currencyBRL(cartDetails.total)}`,
      "",
      "(pedido gerado pela demonstração Nexis)",
    ];
    const url = buildWhatsAppUrl(lines.join("\n"));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function sendWishlist() {
    const books = data.books.filter((b) => wishlist.includes(b.id));
    if (books.length === 0) return;
    const lines = [
      "Olá! Gostaria de cotação para os seguintes livros:",
      "",
      ...books.map((b) => `• "${b.title}" — ${b.author}`),
      "",
      "(mensagem enviada pela demonstração Nexis)",
    ];
    const url = buildWhatsAppUrl(lines.join("\n"));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-[#120a08] text-orange-50">
      <div className="border-b border-white/10 bg-[#0c0706]/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6">
          <Link href="/solucoes" className="inline-flex items-center gap-2 text-orange-100/70 hover:text-white">
            ← Voltar para a Nexis Digital
          </Link>
          <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-orange-200">
            Demonstração funcional · livraria
          </span>
        </div>
      </div>

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-sm font-semibold">Livraria Capítulos</p>
              <p className="text-xs text-orange-100/70">Desde 1998 · Centro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sendWishlist}
              disabled={wishlist.length === 0}
              className="hidden h-10 items-center gap-1 rounded-lg border border-white/10 px-3 text-sm text-orange-100 hover:bg-white/5 disabled:opacity-50 sm:inline-flex"
            >
              ♡ Lista ({wishlist.length})
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-[#120a08] hover:bg-orange-400"
            >
              🛒 Carrinho
              {cartDetails.count > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#120a08] px-1.5 text-xs text-orange-300">
                  {cartDetails.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-orange-200/70">Catálogo</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Histórias para cada tipo de leitor.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-orange-100/80">
            Catálogo fictício com títulos ilustrativos usados apenas como
            demonstração da interface de uma livraria.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, autor ou categoria..."
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm placeholder:text-orange-100/40 focus:border-orange-400/60 focus:outline-none sm:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {["Todos", ...data.categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  category === c
                    ? "border-orange-400/50 bg-orange-400/10 text-white"
                    : "border-white/10 bg-white/5 text-orange-100/70 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
            <p className="text-orange-100/70">Nenhum livro encontrado.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((b) => {
              const wished = wishlist.includes(b.id);
              return (
                <article
                  key={b.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-orange-400/40"
                >
                  <button
                    type="button"
                    onClick={() => setActive(b)}
                    className="relative flex aspect-[3/4] items-end p-4 text-left"
                    style={{
                      background: `linear-gradient(160deg, ${b.colors[0]}, ${b.colors[1]})`,
                    }}
                    aria-label={`Ver detalhes de ${b.title}`}
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-white/70">
                        {b.category}
                      </p>
                      <p className="mt-1 text-xl font-semibold leading-tight text-white">
                        {b.title}
                      </p>
                      <p className="mt-1 text-sm text-white/80">{b.author}</p>
                    </div>
                  </button>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-sm text-orange-100/70 line-clamp-2">{b.synopsis}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-semibold">{currencyBRL(b.price)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleWish(b.id)}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm ${
                            wished
                              ? "border-orange-400/60 bg-orange-400/10 text-orange-200"
                              : "border-white/10 text-orange-100/70 hover:text-white"
                          }`}
                          aria-label="Adicionar à lista de interesse"
                        >
                          {wished ? "♥" : "♡"}
                        </button>
                        <button
                          type="button"
                          onClick={() => add(b.id)}
                          className="inline-flex h-9 items-center rounded-lg bg-orange-500 px-3 text-xs font-semibold text-[#120a08] hover:bg-orange-400"
                        >
                          + Carrinho
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal
        >
          <div
            className="grid w-full max-w-2xl gap-5 overflow-hidden rounded-2xl border border-white/10 bg-[#120a08] md:grid-cols-[1fr_1.2fr]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex aspect-[3/4] items-end p-6 md:aspect-auto"
              style={{
                background: `linear-gradient(160deg, ${active.colors[0]}, ${active.colors[1]})`,
              }}
            >
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/70">
                  {active.category}
                </p>
                <p className="mt-1 text-2xl font-semibold leading-tight text-white">
                  {active.title}
                </p>
                <p className="mt-1 text-sm text-white/80">{active.author}</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-orange-100/70">Publicado em {active.year}</p>
              <h2 className="mt-1 text-xl font-semibold">{active.title}</h2>
              <p className="mt-3 text-sm text-orange-100/80">{active.synopsis}</p>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-lg font-semibold">{currencyBRL(active.price)}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="inline-flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm hover:bg-white/5"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      add(active.id);
                      setActive(null);
                      setCartOpen(true);
                    }}
                    className="inline-flex h-10 items-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-[#120a08] hover:bg-orange-400"
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setCartOpen(false)}>
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#120a08] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seu carrinho</h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg border border-white/10 px-2 py-1 text-sm hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {cartDetails.items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-orange-100/70">Seu carrinho está vazio.</p>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto nx-scroll">
                  {cartDetails.items.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div
                        className="h-16 w-12 flex-none rounded"
                        style={{
                          background: `linear-gradient(160deg, ${i.colors[0]}, ${i.colors[1]})`,
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{i.title}</p>
                        <p className="text-xs text-orange-100/70">{i.author}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQty(i.id, i.qty - 1)}
                            className="h-7 w-7 rounded-md border border-white/10 text-sm hover:bg-white/5"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm">{i.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(i.id, i.qty + 1)}
                            className="h-7 w-7 rounded-md border border-white/10 text-sm hover:bg-white/5"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(i.id)}
                            className="ml-auto text-xs text-orange-100/60 hover:text-rose-300"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">{currencyBRL(i.subtotal)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-100/70">Total</span>
                    <span className="font-semibold">{currencyBRL(cartDetails.total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-orange-100/60">
                    Disponibilidade e envio combinados no atendimento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sendCart}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-[#120a08] hover:bg-orange-400"
                >
                  Enviar pedido pelo WhatsApp
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-orange-100/60 sm:px-6">
          <p>© {new Date().getFullYear()} Livraria Capítulos · Empresa fictícia · Demonstração Nexis Digital</p>
          <a href={`mailto:${BRAND.email}`} className="hover:text-white">
            contato@capitulos.demo
          </a>
        </div>
      </footer>

      {/* CTA Nexis */}
      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-nx-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="text-sm">
            <p className="font-semibold">Quer um catálogo assim para a sua livraria?</p>
            <p className="text-xs text-orange-100/70">
              Adaptamos categorias, integrações e identidade visual ao seu negócio.
            </p>
          </div>
          <a
            href={
              buildWhatsAppUrl(
                "Olá, Nexis! Gostei da demonstração de livraria e quero uma solução assim.",
              ) ?? "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-black hover:bg-white/85"
          >
            Quero uma solução assim
          </a>
        </div>
      </div>

      {/* Acesso ao painel administrativo da demonstração */}
      <AdminFab raised onClick={() => setAdminOpen(true)} label="Painel de demonstração" />

      {adminOpen && (
        <LivrariaAdminPanel
          data={data}
          onChange={setData}
          onClose={() => setAdminOpen(false)}
          onReset={resetData}
        />
      )}
    </div>
  );
}
