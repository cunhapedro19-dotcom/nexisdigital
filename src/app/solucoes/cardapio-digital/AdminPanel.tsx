"use client";

import { useMemo, useState } from "react";
import { currencyBRL } from "@/lib/cn";
import { nextId } from "@/lib/id";
import { DemoArt, type ArtVariant } from "@/components/visual/DemoArt";
import {
  AdminOverlay,
  AdminEditorModal,
  AdminField,
  AdminSection,
  AdminSearch,
  AdminSelect,
  AdminSwitch,
  AdminTextarea,
  AdminEmpty,
  ArtPicker,
  DangerButton,
  adminInputCls,
  useAdminToast,
} from "@/components/admin/AdminKit";

/* ============================================================
   Modelo de dados do cardápio (compartilhado com a vitrine)
   ============================================================ */

export interface CardapioAddon {
  id: string;
  name: string;
  price: number;
}

export interface CardapioItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  art: ArtVariant;
  available: boolean;
  addons?: CardapioAddon[];
}

export interface CardapioData {
  categories: string[];
  items: CardapioItem[];
}

/* ============================================================
   Painel
   ============================================================ */

export function CardapioAdminPanel({
  data,
  onChange,
  onClose,
  onReset,
}: {
  data: CardapioData;
  onChange: (updater: (prev: CardapioData) => CardapioData) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<"produtos" | "categorias">("produtos");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CardapioItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { show, node } = useAdminToast();

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...data.items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (!q) return list;
    return list.filter((m) => `${m.name} ${m.category}`.toLowerCase().includes(q));
  }, [data.items, search]);

  function openNew() {
    setDraft({
      id: nextId("m"),
      name: "",
      description: "",
      price: 0,
      category: data.categories[0] ?? "",
      art: "burger",
      available: true,
      addons: [],
    });
    setIsNew(true);
  }

  function openEdit(item: CardapioItem) {
    setDraft({ ...item, addons: (item.addons ?? []).map((a) => ({ ...a })) });
    setIsNew(false);
  }

  function saveDraft() {
    if (!draft) return;
    if (!draft.name.trim()) {
      show("Informe o nome do produto.");
      return;
    }
    const price = Math.round(draft.price * 100) / 100;
    if (!Number.isFinite(price) || price < 0) {
      show("Informe um preço válido.");
      return;
    }
    const saved: CardapioItem = { ...draft, name: draft.name.trim(), price };
    onChange((prev) => ({
      ...prev,
      items: isNew
        ? [...prev.items, saved]
        : prev.items.map((m) => (m.id === saved.id ? saved : m)),
    }));
    setDraft(null);
    show(isNew ? "Produto adicionado ao cardápio." : "Alterações salvas na vitrine.");
  }

  function deleteItem(id: string) {
    onChange((prev) => ({ ...prev, items: prev.items.filter((m) => m.id !== id) }));
    show("Produto excluído.");
  }

  function toggleAvailable(item: CardapioItem) {
    onChange((prev) => ({
      ...prev,
      items: prev.items.map((m) => (m.id === item.id ? { ...m, available: !m.available } : m)),
    }));
    show(item.available ? "Item marcado como indisponível." : "Item disponível novamente.");
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
    const inUse = data.items.filter((m) => m.category === name).length;
    if (inUse > 0) {
      show(`Categoria em uso por ${inUse} ${inUse === 1 ? "item" : "itens"} — realoque antes de excluir.`);
      return;
    }
    onChange((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== name) }));
    show("Categoria excluída.");
  }

  return (
    <AdminOverlay
      title="Cardápio — Brasa & Pão"
      subtitle="gerencie produtos, categorias e disponibilidade"
      tone="amber"
      onClose={onClose}
      onReset={() => {
        onReset();
        show("Dados originais restaurados.");
      }}
    >
      {node}

      {/* Abas */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1" role="tablist" aria-label="Seções do painel">
        {(["produtos", "categorias"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-9 flex-1 rounded-lg text-sm font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
              tab === t ? "bg-white/10 text-white" : "text-nx-muted hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "produtos" ? (
        <AdminSection
          title={`Produtos (${data.items.length})`}
          action={
            <button
              type="button"
              onClick={openNew}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 px-4 text-xs font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
            >
              + Novo produto
            </button>
          }
        >
          <div className="mb-4">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar produto ou categoria..."
              label="Buscar produto no painel"
            />
          </div>

          {items.length === 0 ? (
            <AdminEmpty message="Nenhum produto encontrado. Use “Novo produto” para cadastrar." />
          ) : (
            <ul className="space-y-2">
              {items.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="relative h-12 w-12 flex-none overflow-hidden rounded-lg" aria-hidden>
                    <DemoThumb art={m.art} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.name}</span>
                    <span className="nx-mono block text-[10px] uppercase tracking-widest text-nx-dim">
                      {m.category} · {currencyBRL(m.price)}
                      {m.addons && m.addons.length > 0 ? ` · ${m.addons.length} adicional(is)` : ""}
                    </span>
                  </span>
                  <AdminSwitch
                    checked={m.available}
                    onChange={() => toggleAvailable(m)}
                    labelOn="Disponível"
                    labelOff="Indisponível"
                  />
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteItem(m.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      ) : (
        <AdminSection title={`Categorias (${data.categories.length})`}>
          <CategoryForm onAdd={addCategory} />
          {data.categories.length === 0 ? (
            <div className="mt-4">
              <AdminEmpty message="Nenhuma categoria. Cadastre uma para organizar o cardápio." />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.categories.map((c) => {
                const count = data.items.filter((m) => m.category === c).length;
                return (
                  <li
                    key={c}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <span>
                      <span className="text-sm font-medium">{c}</span>
                      <span className="nx-mono ml-2 text-[10px] uppercase tracking-widest text-nx-dim">
                        {count} {count === 1 ? "item" : "itens"}
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
          title={isNew ? "Novo produto" : `Editar — ${draft.name}`}
          onClose={() => setDraft(null)}
          onSave={saveDraft}
        >
          <AdminField label="Nome do produto">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ex.: Burger Clássico"
              className={adminInputCls}
            />
          </AdminField>

          <AdminField label="Descrição">
            <AdminTextarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Ingredientes, tamanho, observações..."
            />
          </AdminField>

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

          <AdminField label="Imagem do item" hint="Escolha a ilustração exibida na vitrine.">
            <ArtPicker value={draft.art} onChange={(art) => setDraft({ ...draft, art })} />
          </AdminField>

          <AdminField label="Disponibilidade" hint="Itens indisponíveis aparecem na vitrine com aviso e sem botão de pedido.">
            <AdminSwitch
              checked={draft.available}
              onChange={(available) => setDraft({ ...draft, available })}
              labelOn="Disponível para pedido"
              labelOff="Indisponível"
            />
          </AdminField>

          {/* Adicionais */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between">
              <span className="nx-mono text-[10px] uppercase tracking-[0.16em] text-nx-muted">
                Adicionais ({draft.addons?.length ?? 0})
              </span>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    addons: [...(draft.addons ?? []), { id: nextId("a"), name: "", price: 0 }],
                  })
                }
                className="inline-flex h-8 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium hover:bg-white/[0.08]"
              >
                + Adicional
              </button>
            </div>
            {(draft.addons?.length ?? 0) === 0 ? (
              <p className="mt-2 text-xs text-nx-dim">Nenhum adicional. Opcional para a maioria dos produtos.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {draft.addons!.map((a, idx) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <input
                      value={a.name}
                      onChange={(e) => {
                        const addons = [...draft.addons!];
                        addons[idx] = { ...a, name: e.target.value };
                        setDraft({ ...draft, addons });
                      }}
                      placeholder="Nome (ex.: Bacon extra)"
                      className={adminInputCls}
                      aria-label={`Nome do adicional ${idx + 1}`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={a.price}
                      onChange={(e) => {
                        const addons = [...draft.addons!];
                        addons[idx] = { ...a, price: Number(e.target.value) };
                        setDraft({ ...draft, addons });
                      }}
                      className={`${adminInputCls} w-24 flex-none`}
                      aria-label={`Preço do adicional ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, addons: draft.addons!.filter((x) => x.id !== a.id) })}
                      className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-white/10 text-xs hover:border-rose-400/40 hover:text-rose-300"
                      aria-label={`Remover adicional ${a.name || idx + 1}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AdminEditorModal>
      )}
    </AdminOverlay>
  );
}

/* Miniatura da arte usada nas listas do painel. */
function DemoThumb({ art }: { art: ArtVariant }) {
  return <DemoArt variant={art} />;
}

/* Formulário de nova categoria. */
function CategoryForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(name);
        setName("");
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
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
  );
}
