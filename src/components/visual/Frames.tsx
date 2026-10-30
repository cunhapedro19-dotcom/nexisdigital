import type { ReactNode } from "react";

/**
 * Moldura de "janela de software" para apresentar capturas/mockups
 * de produtos digitais em contextos editoriais.
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
      className={`nx-edge-light overflow-hidden rounded-2xl bg-nx-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-nx-surface-2 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <div className="mx-3 flex h-6 flex-1 items-center rounded-md bg-black/30 px-2 text-[11px] text-white/40">
          <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${dots[accent]}`} />
          {title ?? "nexis.app"}
          {meta && (
            <span className="ml-auto nx-mono text-[10px] uppercase tracking-widest text-white/30">
              {meta}
            </span>
          )}
        </div>
      </div>
      <div className="bg-nx-bg">{children}</div>
    </div>
  );
}

/**
 * Card com borda luminosa sutil e gradiente interno.
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
      className={`nx-edge-light relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] ${className}`}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * "Tag" estilo metadado técnico.
 */
export function MetaTag({
  children,
  tone = "violet",
}: {
  children: ReactNode;
  tone?: "violet" | "ice" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones: Record<string, string> = {
    violet: "border-violet-400/25 bg-violet-500/10 text-violet-200",
    ice: "border-sky-400/25 bg-sky-500/10 text-sky-200",
    emerald: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/25 bg-amber-500/10 text-amber-200",
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-200",
    slate: "border-white/10 bg-white/5 text-white/70",
  };
  return (
    <span
      className={`nx-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}