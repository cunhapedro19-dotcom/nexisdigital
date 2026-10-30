"use client";

import { useState } from "react";
import { nextId } from "@/lib/id";
import {
  AdminOverlay,
  AdminEditorModal,
  AdminField,
  AdminSection,
  AdminTextarea,
  AdminEmpty,
  DangerButton,
  adminInputCls,
  useAdminToast,
} from "@/components/admin/AdminKit";

/* ============================================================
   Modelo de dados do site institucional (compartilhado)
   ============================================================ */

export interface InstService {
  id: string;
  title: string;
  description: string;
}

export interface InstProject {
  id: string;
  title: string;
  /** Ex.: "Residencial · 2024" */
  meta: string;
  /** Matiz (0-360) usada na arte do card. */
  hue: number;
}

export interface InstitucionalData {
  services: InstService[];
  projects: InstProject[];
}

/* ============================================================
   Painel
   ============================================================ */

export function InstitucionalAdminPanel({
  data,
  onChange,
  onClose,
  onReset,
}: {
  data: InstitucionalData;
  onChange: (updater: (prev: InstitucionalData) => InstitucionalData) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<"servicos" | "portfolio">("servicos");
  const [serviceDraft, setServiceDraft] = useState<InstService | null>(null);
  const [serviceIsNew, setServiceIsNew] = useState(false);
  const [projectDraft, setProjectDraft] = useState<InstProject | null>(null);
  const [projectIsNew, setProjectIsNew] = useState(false);
  const { show, node } = useAdminToast();

  function openNewService() {
    setServiceDraft({ id: nextId("s"), title: "", description: "" });
    setServiceIsNew(true);
  }

  function saveService() {
    if (!serviceDraft) return;
    if (!serviceDraft.title.trim()) {
      show("Informe o título do serviço.");
      return;
    }
    const saved: InstService = { ...serviceDraft, title: serviceDraft.title.trim() };
    onChange((prev) => ({
      ...prev,
      services: serviceIsNew
        ? [...prev.services, saved]
        : prev.services.map((s) => (s.id === saved.id ? saved : s)),
    }));
    setServiceDraft(null);
    show(serviceIsNew ? "Serviço adicionado ao site." : "Alterações salvas na vitrine.");
  }

  function deleteService(id: string) {
    onChange((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== id) }));
    show("Serviço excluído.");
  }

  function openNewProject() {
    setProjectDraft({ id: nextId("pr"), title: "", meta: "Residencial · 2026", hue: 28 });
    setProjectIsNew(true);
  }

  function saveProject() {
    if (!projectDraft) return;
    if (!projectDraft.title.trim()) {
      show("Informe o título do projeto.");
      return;
    }
    const hue = ((Math.round(projectDraft.hue) % 360) + 360) % 360;
    const saved: InstProject = { ...projectDraft, title: projectDraft.title.trim(), hue };
    onChange((prev) => ({
      ...prev,
      projects: projectIsNew
        ? [...prev.projects, saved]
        : prev.projects.map((p) => (p.id === saved.id ? saved : p)),
    }));
    setProjectDraft(null);
    show(projectIsNew ? "Projeto adicionado ao portfólio." : "Alterações salvas na vitrine.");
  }

  function deleteProject(id: string) {
    onChange((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
    show("Projeto excluído do portfólio.");
  }

  return (
    <AdminOverlay
      title="Estúdio Vértice — gerenciamento"
      subtitle="serviços e portfólio do site institucional"
      tone="zinc"
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
            ["servicos", "Serviços"],
            ["portfolio", "Portfólio"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-9 flex-1 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
              tab === t ? "bg-white/10 text-white" : "text-nx-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "servicos" ? (
        <AdminSection
          title={`Serviços (${data.services.length})`}
          action={
            <button
              type="button"
              onClick={openNewService}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-400/40 bg-zinc-100 px-4 text-xs font-semibold text-zinc-900 transition hover:bg-white"
            >
              + Novo serviço
            </button>
          }
        >
          {data.services.length === 0 ? (
            <AdminEmpty message="Nenhum serviço cadastrado. Cadastre o primeiro para exibi-lo no site." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.services.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.title}</span>
                    <span className="block truncate text-xs text-nx-muted">{s.description}</span>
                  </span>
                  <span className="flex flex-none items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setServiceDraft({ ...s });
                        setServiceIsNew(false);
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteService(s.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      ) : (
        <AdminSection
          title={`Portfólio (${data.projects.length})`}
          action={
            <button
              type="button"
              onClick={openNewProject}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-400/40 bg-zinc-100 px-4 text-xs font-semibold text-zinc-900 transition hover:bg-white"
            >
              + Novo projeto
            </button>
          }
        >
          {data.projects.length === 0 ? (
            <AdminEmpty message="Nenhum projeto no portfólio." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span
                    aria-hidden
                    className="h-11 w-11 flex-none rounded-lg border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, hsl(${p.hue}, 15%, 22%) 0%, hsl(${p.hue}, 8%, 10%) 100%)`,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.title}</span>
                    <span className="nx-mono block text-[10px] uppercase tracking-widest text-nx-dim">
                      {p.meta}
                    </span>
                  </span>
                  <span className="flex flex-none items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProjectDraft({ ...p });
                        setProjectIsNew(false);
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/[0.03] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                    >
                      Editar
                    </button>
                    <DangerButton onConfirm={() => deleteProject(p.id)} label="Excluir" confirmLabel="Excluir mesmo?" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      )}

      {serviceDraft && (
        <AdminEditorModal
          title={serviceIsNew ? "Novo serviço" : `Editar — ${serviceDraft.title}`}
          onClose={() => setServiceDraft(null)}
          onSave={saveService}
        >
          <AdminField label="Título">
            <input
              value={serviceDraft.title}
              onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })}
              placeholder="Ex.: Projeto arquitetônico"
              className={adminInputCls}
            />
          </AdminField>
          <AdminField label="Descrição">
            <AdminTextarea
              value={serviceDraft.description}
              onChange={(e) => setServiceDraft({ ...serviceDraft, description: e.target.value })}
              placeholder="O que inclui, para quem é indicado..."
            />
          </AdminField>
        </AdminEditorModal>
      )}

      {projectDraft && (
        <AdminEditorModal
          title={projectIsNew ? "Novo projeto" : `Editar — ${projectDraft.title}`}
          onClose={() => setProjectDraft(null)}
          onSave={saveProject}
        >
          <AdminField label="Título">
            <input
              value={projectDraft.title}
              onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })}
              placeholder="Ex.: Casa Araucária"
              className={adminInputCls}
            />
          </AdminField>
          <AdminField label="Categoria e ano" hint="Ex.: Residencial · 2024">
            <input
              value={projectDraft.meta}
              onChange={(e) => setProjectDraft({ ...projectDraft, meta: e.target.value })}
              className={adminInputCls}
            />
          </AdminField>
          <AdminField label={`Tom da arte (${projectDraft.hue}°)`} hint="Arraste para mudar a cor da capa do projeto.">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="359"
                step="1"
                value={projectDraft.hue}
                onChange={(e) => setProjectDraft({ ...projectDraft, hue: Number(e.target.value) })}
                className="h-9 flex-1 accent-zinc-200"
                aria-label="Tom da arte do projeto"
              />
              <span
                aria-hidden
                className="h-9 w-9 flex-none rounded-lg border border-white/10"
                style={{
                  background: `linear-gradient(135deg, hsl(${projectDraft.hue}, 15%, 22%) 0%, hsl(${projectDraft.hue}, 8%, 10%) 100%)`,
                }}
              />
            </div>
          </AdminField>
        </AdminEditorModal>
      )}
    </AdminOverlay>
  );
}
