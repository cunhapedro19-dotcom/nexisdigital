"use client";

import { useMemo, useState } from "react";
import { currencyBRL } from "@/lib/cn";
import { nextId } from "@/lib/id";
import {
  AdminOverlay,
  AdminEditorModal,
  AdminField,
  AdminSection,
  AdminTextarea,
  AdminEmpty,
  AdminSearch,
  AdminSelect,
  ColorDuoPicker,
  DangerButton,
  adminInputCls,
  useAdminToast,
} from "@/components/admin/AdminKit";

/* ============================================================
   Modelo de dados da livraria (compartilhado com a vitrine)
   ============================================================ */

export interface LivrariaBook {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  year: number;
  synopsis: string;
  /** Par de cores que gera a capa ilustrativa (CSS). */
  colors: [string, string];
}

export interface LivrariaData {
  categories: string[];
  books: LivrariaBook[];
}

/* ============================================================
   Painel
   ============================================================ */

export function LivrariaAdminPanel({
  data,
  onChange,
  onClose,
  onReset,
}: {
  data: LivrariaData;
  onChange: (updater: (prev: LivrariaData) => LivrariaData) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<"livros" | "categorias">("livros");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<LivrariaBook | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { show, node } = useAdminToast();

  const books = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...data.books].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    if (!q) return list;
    return list.filter((b) => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q));
  }, [data.books, search]);

  function openNew() {
    setDraft({
      id: nextId("b"),
      title: "",
      author: "",
      category: data.categories[0] ?? "",
      price: 0,
      year: new Date().getFullYear(),
      synopsis: "",
      colors: ["#6d28d9", "#1e1b4b"],
    });
    setIsNew(true);
  }

  function openEdit(b: LivrariaBook) {
    setDraft({ ...b, colors: [b.colors[0], b.colors[1]] });
    setIsNew(false);
  }

  function saveDraft() {
    if (!draft) return;
    if (!draft.title.trim()) {
      show("Informe o título do livro.");
      return;
    }
    if (!draft.author.trim()) {
      show("Informe o autor.");
      return;
    }
    const price = Math.round(draft.price * 100) / 100;
    if (!Number.isFinite(price) || price < 0) {
      show("Informe um preço válido.");
      return;
    }
    const year = Math.round(draft.year);
    if (!Number.isFinite(year) || year < 1900 || year > 2100) {
      show("Informe um ano entre 1900 e 2100.");
      return;
    }
    const saved: LivrariaBook = {
      ...draft,
      title: draft.title.trim(),
      author: draft.author.trim(),
      price,
      year,
    };
    onChange((prev) => ({
      ...prev,
      books: isNew
        ? [...prev.books, saved]
        : prev.books.map((b) => (b.id === saved.id ? saved : b)),
    }));
    setDraft(null);
    show(isNew ? "Livro adicionado ao catálogo." : "Alterações salvas na vitrine.");
  }

  function deleteBook(id: string) {
    onChange((prev) => ({ ...prev, books: prev.books.filter((b) => b.id !== id) }));
    show("Livro excluído.");
  }

  function addCategory(name: string) {
    const clean = name.trim();
    if (!clean) {
      show("Digite o nome da categoria.");
      return;
    }
    if (data.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      show("Já existe uma categoria com esse nome.");
      return;
    }
    onChange((prev) => ({ ...prev, categories: [...prev.categories, clean] }));
    show("Categoria criada.");
  }

  function deleteCategory(name: string) {
    const inUse = data.books.filter((b) => b.category === name).length;
    if (inUse > 0) {
      show(`Categoria em uso por ${inUse} ${inUse === 1 ? "livro" : "livros"} — realoque antes de excluir.`);
      return;
    }
    onChange((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== name) }));
    show("Categoria excluída.");
  }

  return (
    <AdminOverlay
      title="Livraria Capítulos — gerenciamento"
      subtitle="catálogo e categorias da livraria"
      tone="orange"
      onClose={onClose}
      onReset={() => {
        onReset();
        show("Dados originais restaurados.");
      }}
    >
      {node}

      {/* Abas */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1" role="tablist" aria-label="Seções do painel">
        {(
          [
            ["livros", "Livros"],
            ["categorias", "Categorias"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-9 flex-1 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
              tab === t ? "bg-white/10 text-white" : "text-nx-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "livros" ? (
        <AdminSection
          title={`Livros (${data.books.length})`}
          action={
            <button
              type="button"
              onClick={openNew}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-orange-400 to-orange-600 px-4 text-xs font-semibold text-[#120a08] transition hover:from-orange-300 hover:to-orange-500"
            >
              + Novo livro
            </button>
          }
        >
          <div className="mb-4">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar por título, autor ou categoria..."
              label="Buscar livro no painel"
            />
          </div>

          {books.length === 0 ? (
            <AdminEmpty message="Nenhum livro encontrado. Use “Novo livro” para cadastrar." />
          ) : (
            <ul className="space-y-2">
              {books.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span
                    aria-hidden
                    className="h-12 w-9 flex-none rounded border border-white/10"
                    style={{ background: `linear-gradient(160deg, ${b.colors[0]}, ${b.colors[1]})` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{b.title}</span>
                    <span className="nx-mono block truncate text-[10px] uppercase tracking-widest text-nx-dim">
                      {b.author} · {b.category} · {currencyBRL(b.price)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteBook(b.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      ) : (
        <AdminSection title={`Categorias (${data.categories.length})`}>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("cat") as HTMLInputElement | null;
              if (input) {
                addCategory(input.value);
                input.value = "";
              }
            }}
          >
            <input
              name="cat"
              placeholder="Nome da nova categoria"
              className={adminInputCls}
              aria-label="Nome da nova categoria"
            />
            <button
              type="submit"
              className="inline-flex h-10 flex-none items-center rounded-lg border border-white/15 bg-white/[0.03] px-4 text-sm font-medium hover:bg-white/[0.08]"
            >
              Criar
            </button>
          </form>
          {data.categories.length === 0 ? (
            <div className="mt-4">
              <AdminEmpty message="Nenhuma categoria. Cadastre uma para organizar o catálogo." />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.categories.map((c) => {
                const count = data.books.filter((b) => b.category === c).length;
                return (
                  <li
                    key={c}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <span>
                      <span className="text-sm font-medium">{c}</span>
                      <span className="nx-mono ml-2 text-[10px] uppercase tracking-widest text-nx-dim">
                        {count} {count === 1 ? "livro" : "livros"}
                      </span>
                    </span>
                    <DangerButton
                      onConfirm={() => deleteCategory(c)}
                      label="Excluir"
                      confirmLabel={count > 0 ? "Em uso" : "Excluir mesmo?"}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </AdminSection>
      )}

      {draft && (
        <AdminEditorModal
          title={isNew ? "Novo livro" : `Editar — ${draft.title}`}
          onClose={() => setDraft(null)}
          onSave={saveDraft}
        >
          <AdminField label="Título">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex.: O Cartógrafo de Memórias"
              className={adminInputCls}
            />
          </AdminField>

          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Autor(a)">
              <input
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                placeholder="Ex.: Helena Prado"
                className={adminInputCls}
              />
            </AdminField>
            <AdminField label="Categoria">
              {data.categories.length === 0 ? (
                <p className="text-xs text-amber-300">Crie uma categoria na aba “Categorias”.</p>
              ) : (
                <AdminSelect
                  value={data.categories.includes(draft.category) ? draft.category : ""}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  {!data.categories.includes(draft.category) && <option value="">Selecione...</option>}
                  {data.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </AdminField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Preço (R$)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(draft.price) ? draft.price : 0}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className={adminInputCls}
              />
            </AdminField>
            <AdminField label="Ano de publicação">
              <input
                type="number"
                min="1900"
                max="2100"
                step="1"
                value={Number.isFinite(draft.year) ? draft.year : new Date().getFullYear()}
                onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}
                className={adminInputCls}
              />
            </AdminField>
          </div>

          <AdminField label="Sinopse">
            <AdminTextarea
              value={draft.synopsis}
              onChange={(e) => setDraft({ ...draft, synopsis: e.target.value })}
              placeholder="Do que trata o livro..."
            />
          </AdminField>

          <AdminField label="Capa" hint="Par de cores que gera a capa ilustrativa do livro.">
            <ColorDuoPicker
              value={draft.colors}
              onChange={(colors) => setDraft({ ...draft, colors })}
            />
          </AdminField>
        </AdminEditorModal>
      )}
    </AdminOverlay>
  );
}
