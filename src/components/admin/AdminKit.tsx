"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useModalA11y } from "@/lib/use-modal-a11y";
import { DemoArt, type ArtVariant } from "@/components/visual/DemoArt";

/**
 * Kit de componentes para os painéis administrativos das demonstrações.
 *
 * Todos os painéis seguem o mesmo contrato:
 * - abrem em tela cheia (AdminOverlay), como um sistema de verdade;
 * - deixam claro que é uma demonstração com persistência local;
 * - oferecem "Ver vitrine" para retornar e "Restaurar padrão" para
 *   voltar aos dados originais.
 *
 * NÃO há autenticação nem servidor: os dados vivem no localStorage do
 * navegador. Isso é intencional e está sinalizado na interface.
 */

/* ============================================================
   Opções de arte (as "imagens" do sistema de demonstração)
   ============================================================ */

export const ART_OPTIONS: Array<{ variant: ArtVariant; label: string }> = [
  { variant: "burger", label: "Burger" },
  { variant: "burger-double", label: "Burger duplo" },
  { variant: "fries", label: "Fritas" },
  { variant: "drink", label: "Bebida" },
  { variant: "dessert", label: "Sobremesa" },
  { variant: "tee", label: "Camiseta" },
  { variant: "hoodie", label: "Moletom" },
  { variant: "cap", label: "Boné" },
  { variant: "bag", label: "Bolsa" },
  { variant: "beach", label: "Praia" },
  { variant: "beach-wide", label: "Vista do mar" },
  { variant: "room", label: "Quarto frio" },
  { variant: "room-warm", label: "Quarto quente" },
  { variant: "store", label: "Loja" },
];

/* ============================================================
   Overlay em tela cheia do painel
   ============================================================ */

const toneMap = {
  violet: { chip: "border-violet-400/30 bg-violet-500/10 text-violet-200", dot: "bg-violet-400", bar: "via-violet-400/60" },
  amber: { chip: "border-amber-400/30 bg-amber-500/10 text-amber-200", dot: "bg-amber-400", bar: "via-amber-400/60" },
  cyan: { chip: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200", dot: "bg-cyan-400", bar: "via-cyan-400/60" },
  orange: { chip: "border-orange-400/30 bg-orange-500/10 text-orange-200", dot: "bg-orange-400", bar: "via-orange-400/60" },
  zinc: { chip: "border-zinc-400/30 bg-zinc-500/10 text-zinc-200", dot: "bg-zinc-400", bar: "via-zinc-400/60" },
} as const;

export type AdminTone = keyof typeof toneMap;

export function AdminOverlay({
  title,
  subtitle,
  tone = "violet",
  onClose,
  onReset,
  children,
}: {
  title: string;
  subtitle: string;
  tone?: AdminTone;
  onClose: () => void;
  onReset: () => void;
  children: ReactNode;
}) {
  const panelRef = useModalA11y(true, onClose);
  const t = toneMap[tone] ?? toneMap.violet;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-nx-bg" role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Painel de demonstração — ${title}`}
        className="min-h-full outline-none"
      >
        {/* Header fixo */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-nx-bg/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className={`nx-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${t.chip}`}>
                <span className={`h-1 w-1 rounded-full ${t.dot}`} />
                painel · demonstração
              </span>
              <div>
                <p className="font-display text-sm font-medium leading-tight">{title}</p>
                <p className="nx-mono text-[10px] uppercase tracking-widest text-nx-dim">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DangerButton onConfirm={onReset} label="Restaurar padrão" confirmLabel="Confirmar restauração?" />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 text-xs font-semibold text-white transition hover:from-violet-400 hover:to-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg"
              >
                Ver vitrine
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
          <div className={`h-px bg-gradient-to-r from-transparent ${t.bar} to-transparent`} />
          {/* Aviso de escopo */}
          <div className="border-b border-white/5 bg-amber-400/[0.04]">
            <p className="mx-auto max-w-5xl px-4 py-2 text-[11px] leading-relaxed text-amber-200/80 sm:px-6">
              Demonstração: as alterações ficam salvas <strong className="font-semibold">apenas neste navegador</strong> e
              refletem na vitrine abaixo/ao lado. Nenhum dado é enviado a servidores — a versão real do painel incluiria
              login e banco de dados.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

/* ============================================================
   Botão flutuante de acesso ao painel
   ============================================================ */

export function AdminFab({
  onClick,
  label,
  raised = false,
}: {
  onClick: () => void;
  label: string;
  /** raised: use quando houver barra fixa na base da página */
  raised?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={`fixed left-4 z-30 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 text-xs font-medium text-white backdrop-blur transition hover:border-white/30 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
        raised ? "bottom-24 sm:bottom-20" : "bottom-5"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path
          d="M9.6 3.9a1.4 1.4 0 0 1 1.4-1h2a1.4 1.4 0 0 1 1.4 1l.3 1.2a6.8 6.8 0 0 1 1.6.9l1.2-.4a1.4 1.4 0 0 1 1.7.6l1 1.8a1.4 1.4 0 0 1-.3 1.8l-1 .8a7 7 0 0 1 0 1.9l1 .8a1.4 1.4 0 0 1 .3 1.8l-1 1.8a1.4 1.4 0 0 1-1.7.6l-1.2-.4a6.8 6.8 0 0 1-1.6.9l-.3 1.2a1.4 1.4 0 0 1-1.4 1h-2a1.4 1.4 0 0 1-1.4-1l-.3-1.2a6.8 6.8 0 0 1-1.6-.9l-1.2.4a1.4 1.4 0 0 1-1.7-.6l-1-1.8a1.4 1.4 0 0 1 .3-1.8l1-.8a7 7 0 0 1 0-1.9l-1-.8a1.4 1.4 0 0 1-.3-1.8l1-1.8a1.4 1.4 0 0 1 1.7-.6l1.2.4c.5-.4 1-.7 1.6-.9l.3-1.2Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.6" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  );
}

/* ============================================================
   Toast de feedback
   ============================================================ */

export function useAdminToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function show(msg: string) {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), 2400);
  }

  const node =
    message !== null ? (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-xs font-medium text-emerald-100 backdrop-blur"
      >
        {message}
      </div>
    ) : null;

  return { show, node } as const;
}

/* ============================================================
   Botão destrutivo em duas etapas (sem window.confirm)
   ============================================================ */

export function DangerButton({
  onConfirm,
  label,
  confirmLabel = "Confirmar?",
  className = "",
}: {
  onConfirm: () => void;
  label: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function click() {
    if (armed) {
      if (timer.current) clearTimeout(timer.current);
      setArmed(false);
      onConfirm();
      return;
    }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), 3000);
  }

  return (
    <button
      type="button"
      onClick={click}
      className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
        armed
          ? "border-rose-400/60 bg-rose-500/20 text-rose-100"
          : "border-white/15 bg-white/[0.03] text-nx-muted hover:border-white/30 hover:text-white"
      } ${className}`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}

/* ============================================================
   Campos de formulário
   ============================================================ */

export const adminInputCls =
  "h-10 w-full rounded-lg border border-white/10 bg-nx-bg/70 px-3 text-sm text-nx-text placeholder:text-nx-dim transition focus:border-violet-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg";

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="nx-mono text-[10px] uppercase tracking-[0.16em] text-nx-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-nx-dim">{hint}</span>}
    </label>
  );
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${adminInputCls} min-h-[80px] py-2 ${className}`} />;
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${adminInputCls} ${className}`}>
      {children}
    </select>
  );
}

/** Interruptor acessível (role="switch"). */
export function AdminSwitch({
  checked,
  onChange,
  labelOn,
  labelOff,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
        checked
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
          : "border-white/15 bg-white/[0.03] text-nx-muted hover:text-white"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${checked ? "bg-emerald-400" : "bg-white/40"}`} aria-hidden />
      {checked ? labelOn : labelOff}
    </button>
  );
}

/* ============================================================
   Seletor de arte (as "imagens" da demo)
   ============================================================ */

export function ArtPicker({
  value,
  onChange,
  variants,
}: {
  value: ArtVariant;
  onChange: (v: ArtVariant) => void;
  variants?: ArtVariant[];
}) {
  const options = variants
    ? ART_OPTIONS.filter((o) => variants.includes(o.variant))
    : ART_OPTIONS;
  return (
    <div role="radiogroup" aria-label="Imagem do item" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {options.map((o) => (
        <button
          key={o.variant}
          type="button"
          role="radio"
          aria-checked={value === o.variant}
          onClick={() => onChange(o.variant)}
          className={`group overflow-hidden rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg ${
            value === o.variant
              ? "border-violet-400/70 ring-1 ring-violet-400/50"
              : "border-white/10 hover:border-white/25"
          }`}
          title={o.label}
        >
          <span className="relative block aspect-square">
            <DemoArt variant={o.variant} />
          </span>
          <span className="block truncate border-t border-white/5 bg-black/30 px-1 py-1 text-center text-[9px] text-nx-muted">
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Par de cores (capas de livro da demo de livraria)
   ============================================================ */

const COLOR_PRESETS: Array<[string, string]> = [
  ["#6d28d9", "#1e1b4b"],
  ["#b45309", "#451a03"],
  ["#0891b2", "#0c4a6e"],
  ["#be185d", "#500724"],
  ["#059669", "#064e3b"],
  ["#db2777", "#500724"],
  ["#1d4ed8", "#1e1b4b"],
  ["#a16207", "#422006"],
];

export function ColorDuoPicker({
  value,
  onChange,
}: {
  value: [string, string];
  onChange: (v: [string, string]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value[0]}
          onChange={(e) => onChange([e.target.value, value[1]])}
          className="h-9 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
          aria-label="Cor principal da capa"
        />
        <span className="nx-mono text-xs text-nx-dim">{value[0]}</span>
        <span aria-hidden className="text-nx-dim">→</span>
        <input
          type="color"
          value={value[1]}
          onChange={(e) => onChange([value[0], e.target.value])}
          className="h-9 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
          aria-label="Cor secundária da capa"
        />
        <span className="nx-mono text-xs text-nx-dim">{value[1]}</span>
        <span
          aria-hidden
          className="h-9 w-9 rounded-lg border border-white/10"
          style={{ background: `linear-gradient(160deg, ${value[0]}, ${value[1]})` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map(([a, b]) => (
          <button
            key={`${a}${b}`}
            type="button"
            onClick={() => onChange([a, b])}
            className="h-7 w-7 rounded-md border border-white/15 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg"
            style={{ background: `linear-gradient(160deg, ${a}, ${b})` }}
            aria-label={`Usar combinação ${a} e ${b}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Busca do painel + linha de listagem
   ============================================================ */

export function AdminSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-dim"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3-3" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={`${adminInputCls} pl-9`}
      />
    </div>
  );
}

/* ============================================================
   Modal de editor (abre dentro do AdminOverlay)
   ============================================================ */

export function AdminEditorModal({
  title,
  onClose,
  onSave,
  saveLabel = "Salvar alterações",
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  children: ReactNode;
}) {
  const ref = useModalA11y(true, onClose);

  return (
    <div className="fixed inset-0 z-[55] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" role="presentation">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="nx-edge-light w-full max-w-lg overflow-hidden rounded-2xl bg-nx-surface outline-none"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
          <p className="font-display text-sm font-medium">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg"
            aria-label="Fechar editor"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[65vh] space-y-4 overflow-y-auto nx-scroll px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-white/5 bg-nx-bg/40 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nx-bg"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Seções e estados vazios
   ============================================================ */

export function AdminSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="nx-display text-lg font-medium tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-nx-muted">
      {message}
    </div>
  );
}
