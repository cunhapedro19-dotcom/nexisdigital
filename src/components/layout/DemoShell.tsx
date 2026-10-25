"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BRAND } from "@/config";
import { buildWhatsAppUrl, formatPhone } from "@/lib/whatsapp";

interface DemoShellProps {
  title: string;
  subtitle: string;
  kind: string;
  solutionSlug: string;
  children: ReactNode;
  accent?: "violet" | "amber" | "sky" | "emerald" | "cyan" | "orange" | "slate";
}

const toneMap: Record<string, { chip: string; dot: string; border: string }> = {
  violet: {
    chip: "border-violet-400/25 bg-violet-500/10 text-violet-200",
    dot: "bg-violet-400",
    border: "via-violet-400/40",
  },
  amber: {
    chip: "border-amber-400/25 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
    border: "via-amber-400/40",
  },
  sky: {
    chip: "border-sky-400/25 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
    border: "via-sky-400/40",
  },
  emerald: {
    chip: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
    border: "via-emerald-400/40",
  },
  cyan: {
    chip: "border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
    dot: "bg-cyan-400",
    border: "via-cyan-400/40",
  },
  orange: {
    chip: "border-orange-400/25 bg-orange-500/10 text-orange-200",
    dot: "bg-orange-400",
    border: "via-orange-400/40",
  },
  slate: {
    chip: "border-white/10 bg-white/5 text-white/70",
    dot: "bg-white/60",
    border: "via-white/30",
  },
};

export function DemoShell({
  title,
  subtitle,
  kind,
  solutionSlug,
  children,
  accent = "violet",
}: DemoShellProps) {
  const tone = toneMap[accent] ?? toneMap.violet;
  const message = `Olá, Nexis! Gostei da demonstração de "${title}" e gostaria de uma solução assim para minha empresa.`;
  const url = buildWhatsAppUrl(message);

  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      {/* Top bar com navegação contextual */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-nx-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/solucoes"
              className="group inline-flex items-center gap-2 text-sm text-nx-muted transition hover:text-white"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Todas as soluções</span>
            </Link>
            <span className="h-4 w-px bg-white/10" />
            <span className={`nx-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${tone.chip}`}>
              <span className={`h-1 w-1 rounded-full ${tone.dot}`} />
              {kind}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-display text-sm font-medium">{title}</p>
              <p className="nx-mono text-[10px] uppercase tracking-widest text-nx-dim">
                /{solutionSlug}
              </p>
            </div>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 text-xs font-medium text-white transition hover:border-violet-400/60 hover:bg-violet-500/20"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                Quero uma solução assim
              </a>
            ) : (
              <a
                href={`mailto:${BRAND.email}?subject=${encodeURIComponent(`Solução: ${title}`)}`}
                className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white hover:bg-white/[0.06]"
              >
                Solicitar ({formatPhone(BRAND.whatsapp)} indisponível)
              </a>
            )}
          </div>
        </div>
        <div className={`h-px bg-gradient-to-r from-transparent ${tone.border} to-transparent`} />
      </div>

      <div>{children}</div>

      {/* CTA inferior */}
      <div className="relative mt-20 overflow-hidden border-t border-white/5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        <div className="absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" aria-hidden />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
          <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-nx-muted">
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            demonstração · {solutionSlug}
          </span>
          <h3 className="nx-display max-w-2xl text-3xl font-medium leading-tight sm:text-4xl">
            Quer uma solução assim <span className="nx-text-gradient">para sua empresa?</span>
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-nx-muted">
            Esta demonstração é apenas uma amostra do que podemos construir. Conte
            o que sua operação precisa e montamos uma versão personalizada — com
            integrações, layout e fluxos próprios.
          </p>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="nx-glow-violet relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
            >
              Falar com a Nexis no WhatsApp
              <span>→</span>
            </a>
          ) : (
            <a
              href={`mailto:${BRAND.email}`}
              className="inline-flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-semibold text-white hover:bg-white/[0.06]"
            >
              Falar por e-mail
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
