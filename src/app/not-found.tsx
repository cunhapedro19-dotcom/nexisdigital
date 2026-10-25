import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      <SiteHeader />
      <main className="relative overflow-hidden py-32">
        <div className="absolute inset-0 -z-10 nx-tech-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[140px]" aria-hidden />

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-200">
            <span className="h-1 w-1 rounded-full bg-violet-300" />
            404 · não encontrado
          </span>
          <h1 className="nx-display mt-6 text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.98] tracking-tight">
            Página <span className="nx-text-gradient">fora de órbita.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-nx-muted">
            A página que você tentou acessar não existe ou foi movida. Volte
            para o início ou explore nossas soluções.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="nx-glow-violet inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
            >
              Ir para o início
              <span>→</span>
            </Link>
            <Link
              href="/solucoes"
              className="inline-flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Ver soluções
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
