import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      <SiteHeader />
      <main className="relative overflow-hidden py-32">
        <div className="absolute inset-0 -z-10 nx-tech-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-nx-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
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
              <span>→</span>
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
      <SiteFooter />
    </div>
  );
}
