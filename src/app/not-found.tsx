import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config";

export const metadata: Metadata = {
  title: "Página não encontrada (404)",
  description: "A página solicitada não foi encontrada. Volte ao início ou explore nossas soluções.",
  robots: "noindex",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text flex flex-col">
      {/* Header simples para 404 */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3" aria-label={`${BRAND.name} — Início`}>
            <span className="text-2xl" aria-hidden>🔷</span>
            <span className="font-display text-lg font-medium">{BRAND.name}</span>
            <span className="hidden h-5 w-px bg-white/10 sm:block" aria-hidden />
            <span className="nx-mono hidden text-[11px] uppercase tracking-[0.2em] text-nx-dim sm:block">
              digital.studio
            </span>
          </Link>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden py-32 flex items-center justify-center">
        <div className="absolute inset-0 -z-10 nx-tech-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-nx-muted" role="status" aria-live="polite">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden />
            404 · não encontrado
          </span>
          <h1 className="nx-display mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Página <span className="nx-text-gradient">fora de órbita.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-nx-muted">
            A página que você tentou acessar não existe ou foi movida. Volte
            para o início ou explore nossas soluções.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Ir para o início
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/solucoes"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04]"
            >
              Ver soluções
            </Link>
          </div>
        </div>
      </main>

      {/* Footer simples para 404 */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-nx-dim sm:px-6">
          <p>© {new Date().getFullYear()} {BRAND.name} · Demonstração Nexis Digital</p>
          <a href={`mailto:${BRAND.email}`} className="hover:text-white">
            {BRAND.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
