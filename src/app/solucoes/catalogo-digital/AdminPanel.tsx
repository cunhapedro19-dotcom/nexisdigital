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
   Modelo de dados do catálogo (compartilhado com a vitrine)
   ============================================================ */

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  art: ArtVariant;
  available: boolean;
}

export interface CatalogoData {
  categories: string[];
  products: CatalogItem[];
}

/* ============================================================
   Painel
   ============================================================ */

export function CatalogoAdminPanel({
  data,
  onChange,
  onClose,
  onReset,
}: {
  data: CatalogoData;
  onChange: (updater: (prev: CatalogoData) => CatalogoData) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<"produtos" | "categorias">("produtos");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<CatalogItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { show, node } = useAdminToast();

  const products = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...data.products].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (!q) return list;
    return list.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q));
  }, [data.products, search]);

  function openNew() {
    setDraft({
      id: nextId("p"),
      name: "",
      price: 0,
      category: data.categories[0] ?? "",
      description: "",
      art: "tee",
      available: true,
    });
    setIsNew(true);
  }

  function openEdit(p: CatalogItem) {
    setDraft({ ...p });
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
    const saved: CatalogItem = { ...draft, name: draft.name.trim(), price };
    onChange((prev) => ({
      ...prev,
      products: isNew
        ? [...prev.products, saved]
        : prev.products.map((p) => (p.id === saved.id ? saved : p)),
    }));
    setDraft(null);
    show(isNew ? "Produto adicionado à vitrine." : "Alterações salvas na vitrine.");
  }

  function deleteProduct(id: string) {
    onChange((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
    show("Produto excluído.");
  }

  function toggleAvailable(p: CatalogItem) {
    onChange((prev) => ({
      ...prev,
      products: prev.products.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)),
    }));
    show(p.available ? "Produto marcado como indisponível." : "Produto disponível novamente.");
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
    const inUse = data.products.filter((p) => p.category === name).length;
    if (inUse > 0) {
      show(`Categoria em uso por ${inUse} ${inUse === 1 ? "produto" : "produtos"} — realoque antes de excluir.`);
      return;
    }
    onChange((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== name) }));
    show("Categoria excluída.");
  }

  return (
    <AdminOverlay
      title="Catálogo — Ateliê Aurora"
      subtitle="gerencie produtos, categorias e disponibilidade"
      tone="violet"
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
            className={`h-9 flex-1 rounded-lg text-sm font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
              tab === t ? "bg-white/10 text-white" : "text-nx-muted hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "produtos" ? (
        <AdminSection
          title={`Produtos (${data.products.length})`}
          action={
            <button
              type="button"
              onClick={openNew}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 text-xs font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
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

          {products.length === 0 ? (
            <AdminEmpty message="Nenhum produto encontrado. Use “Novo produto” para cadastrar." />
          ) : (
            <ul className="space-y-2">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="relative h-12 w-12 flex-none overflow-hidden rounded-lg" aria-hidden>
                    <DemoArt variant={p.art} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="nx-mono block text-[10px] uppercase tracking-widest text-nx-dim">
                      {p.category} · {currencyBRL(p.price)}
                    </span>
                  </span>
                  <AdminSwitch
                    checked={p.available}
                    onChange={() => toggleAvailable(p)}
                    labelOn="Disponível"
                    labelOff="Indisponível"
                  />
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteProduct(p.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
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
                const count = data.products.filter((p) => p.category === c).length;
                return (
                  <li
                    key={c}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <span>
                      <span className="text-sm font-medium">{c}</span>
                      <span className="nx-mono ml-2 text-[10px] uppercase tracking-widest text-nx-dim">
                        {count} {count === 1 ? "produto" : "produtos"}
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
              placeholder="Ex.: Camiseta Essentials"
              className={adminInputCls}
            />
          </AdminField>

          <AdminField label="Descrição">
            <AdminTextarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Material, modelagem, detalhes..."
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

          <AdminField label="Imagem do produto" hint="Escolha a ilustração exibida na vitrine.">
            <ArtPicker value={draft.art} onChange={(art) => setDraft({ ...draft, art })} />
          </AdminField>

          <AdminField label="Disponibilidade" hint="Produtos indisponíveis aparecem na vitrine com aviso e sem botão de compra.">
            <AdminSwitch
              checked={draft.available}
              onChange={(available) => setDraft({ ...draft, available })}
              labelOn="Disponível para venda"
              labelOff="Indisponível"
            />
          </AdminField>
        </AdminEditorModal>
      )}
    </AdminOverlay>
  );
}
