import type { ReactNode } from "react";

/**
 * Moldura de "janela de software" — tech minimal:
 * barra superior flat, border 1px, sem sombra pesada.
 */
export function SoftwareFrame({
  children,
  title,
  meta,
  className = "",
  accent = "violet",
}: {
  children: ReactNode;
  title?: string;
  meta?: string;
  className?: string;
  accent?: "violet" | "amber" | "sky" | "emerald" | "cyan" | "orange";
}) {
  const dots: Record<string, string> = {
    violet: "bg-violet-400",
    amber: "bg-amber-400",
    sky: "bg-sky-400",
    emerald: "bg-emerald-400",
    cyan: "bg-cyan-400",
    orange: "bg-orange-400",
  };
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-nx-surface shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-nx-surface-2 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/[0.14]" />
        <span className="h-2 w-2 rounded-full bg-white/[0.1]" />
        <span className="h-2 w-2 rounded-full bg-white/[0.1]" />
        <span className="ml-2 text-[11px] font-medium text-white/50">
          {title ?? "nexis.app"}
        </span>
        {meta && (
          <span className="ml-auto nx-mono text-[9px] uppercase tracking-[0.14em] text-nx-dim">
            {meta}
          </span>
        )}
        <span className={`h-1.5 w-1.5 rounded-full ${dots[accent]}`} />
      </div>
      <div className="bg-nx-bg">{children}</div>
    </div>
  );
}

/**
 * Card com borda 1px — flat, sem gradiente interno.
 */
export function GlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-nx-surface transition-colors hover:border-white/[0.18] ${className}`}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * "Tag" estilo metadado técnico — minimal, borda 1px.
 */
export function MetaTag({
  children,
  tone = "violet",
}: {
  children: ReactNode;
  tone?: "violet" | "ice" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones: Record<string, string> = {
    violet: "border-violet-400/30 text-violet-300",
    ice: "border-sky-400/30 text-sky-300",
    emerald: "border-emerald-400/30 text-emerald-300",
    amber: "border-amber-400/30 text-amber-300",
    rose: "border-rose-400/30 text-rose-300",
    slate: "border-white/15 text-nx-muted",
  };
  return (
    <span
      className={`nx-mono inline-flex items-center gap-1.5 rounded-md border bg-transparent px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
