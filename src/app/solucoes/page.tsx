import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MetaTag, GlowCard } from "@/components/visual/Frames";
import { Reveal } from "@/components/visual/Reveal";
import { DemoArt } from "@/components/visual/DemoArt";
import { SOLUTIONS } from "@/data/solutions";

export const metadata: Metadata = {
  title: "Soluções",
  description:
    "Demonstrações de catálogos, cardápios, sistemas de gestão, sites institucionais, pousadas e livrarias.",
  alternates: { canonical: "/solucoes/" },
  openGraph: {
    title: "Soluções · Nexis Digital",
    description:
      "Demonstrações de catálogos, cardápios, sistemas de gestão, sites institucionais, pousadas e livrarias.",
    url: "/solucoes/",
  },
};

export default function SolucoesPage() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 nx-tech-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <Reveal>
              <MetaTag tone="violet">Catálogo de soluções</MetaTag>
              <h1 className="nx-display mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1] tracking-tight">
                Experimente <span className="nx-text-gradient">demonstrações reais</span> das soluções que construímos.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-nx-muted sm:text-lg">
                Navegue pelos exemplos, teste fluxos completos e, quando
                encontrar algo que faz sentido para o seu negócio, fale com a
                Nexis para adaptar à sua realidade.
              </p>
            </Reveal>
          </div>
          <div className="nx-light-seam" />
        </section>

        {/* Grid */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {SOLUTIONS.map((s, i) => (
                <Reveal key={s.slug} delay={i * 60}>
                  <SolutionTile solution={s} index={i} />
                </Reveal>
              ))}
            </div>

            {/* CTA custom */}
            <Reveal className="mt-20">
              <GlowCard>
                <div className="relative overflow-hidden rounded-2xl bg-nx-surface p-8 sm:p-12">
                  <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <MetaTag tone="violet">sob medida</MetaTag>
                      <h2 className="nx-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                        Não encontrou o que precisa?
                      </h2>
                      <p className="mt-3 max-w-xl text-nx-muted">
                        Podemos construir uma solução personalizada para o seu
                        segmento, com integrações, regras e layout próprios.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/contato"
                        className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/85"
                      >
                        Solicitar uma proposta
                        <span>→</span>
                      </Link>
                      <a
                        href={`mailto:${BRAND.email}`}
                        className="inline-flex h-12 items-center rounded-lg border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04]"
                      >
                        Falar por e-mail
                      </a>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SolutionTile({
  solution,
  index,
}: {
  solution: (typeof SOLUTIONS)[number];
  index: number;
}) {
  return (
    <Link
      href={solution.href}
      className="group relative block h-full overflow-hidden rounded-2xl"
    >
      <GlowCard className="h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-nx-surface">
          {/* Preview visual */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <SolutionPreview slug={solution.slug} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nx-bg via-transparent to-transparent" />
            <div className="absolute left-3 top-3">
              <span
                className={`nx-mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] backdrop-blur ${
                  solution.kind === "demo"
                    ? "border-white/25 bg-black/50 text-white"
                    : "border-white/25 bg-black/50 text-white"
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-current" />
                {solution.kindLabel}
              </span>
            </div>
            <div className="absolute right-3 top-3 nx-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              0{index + 1}
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-1 flex-col p-5">
            <h2 className="nx-display text-xl font-medium tracking-tight sm:text-2xl">
              {solution.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-nx-muted">
              {solution.problem}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-nx-text/80 line-clamp-3">
              {solution.description}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-nx-text transition group-hover:text-white">
              {solution.kind === "exemplo" ? "Ver exemplo" : "Abrir demonstração"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}

/** Cada solução tem um preview visual específico */
function SolutionPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "catalogo-digital":
      return (
        <div className="relative grid h-full w-full grid-cols-4 gap-1 bg-nx-bg p-2">
          {([
            "tee",
            "hoodie",
            "cap",
            "bag",
          ] as const).map((art) => (
            <div
              key={art}
              className="relative aspect-[3/4] overflow-hidden rounded"
            >
              <DemoArt variant={art} />
            </div>
          ))}
        </div>
      );
    case "cardapio-digital":
      return (
        <div className="relative h-full w-full">
          <DemoArt variant="burger" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-black/70" />
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 p-2 backdrop-blur">
            <p className="nx-mono text-[9px] uppercase tracking-widest text-amber-300">Burger Clássico</p>
            <p className="mt-0.5 text-xs font-semibold text-white">R$ 32,00 · 150g blend</p>
          </div>
        </div>
      );
    case "gestao-empresarial":
      return (
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 bg-nx-bg p-2">
          <div className="col-span-2 rounded bg-white/[0.04] p-1.5">
            <p className="nx-mono text-[8px] text-white/40">RECEITA</p>
            <p className="nx-display text-sm font-medium text-sky-200">R$ 42k</p>
            <div className="mt-1 flex h-3 items-end gap-0.5">
              {[30, 55, 40, 72, 50, 85, 65].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-sky-400/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded bg-white/[0.04] p-1.5">
            <p className="nx-mono text-[8px] text-white/40">VENDAS</p>
            <p className="nx-display text-sm font-medium">284</p>
            <p className="nx-mono mt-0.5 text-[8px] text-emerald-300">+12%</p>
          </div>
          <div className="col-span-3 row-span-2 rounded bg-white/[0.04] p-1.5">
            <p className="nx-mono text-[8px] text-white/40">MOVIMENTAÇÕES</p>
            <div className="mt-1 space-y-1">
              {["Ana · 2 itens", "Bruno · 1 item", "Carla · 3 itens"].map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded bg-black/30 px-1.5 py-1 nx-mono text-[9px]">
                  <span className="truncate text-white/70">{t}</span>
                  <span className="text-sky-300">R$ {(i + 1) * 120}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "gestao-rh":
      return (
        <div className="flex h-full w-full flex-col gap-1.5 bg-nx-bg p-2.5">
          {[
            ["JF", "Júlia Ferreira", "Engenharia", "emerald"],
            ["MC", "Mariana Costa", "Comercial", "amber"],
            ["RS", "Rafael Souza", "Produto", "emerald"],
          ].map(([i, n, d, c]) => (
            <div key={i as string} className="flex items-center gap-2 rounded bg-white/[0.04] p-1.5">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br text-[10px] font-bold text-black ${
                  c === "amber"
                    ? "from-amber-400 to-amber-700"
                    : "from-emerald-400 to-emerald-700"
                }`}
              >
                {i}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium">{n}</p>
                <p className="nx-mono text-[9px] text-white/50">{d}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "site-institucional":
      return (
        <div className="relative h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950 p-3">
          <p className="nx-display text-sm font-medium text-white">Vértice</p>
          <p className="nx-display mt-2 text-lg font-medium leading-tight text-white">
            Projetos que combinam forma e função.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-square rounded"
                style={{ background: `linear-gradient(135deg, hsl(${30 + i * 20}, 15%, ${20 + i * 3}%), #0a0a0a)` }}
              />
            ))}
          </div>
        </div>
      );
    case "pousadas":
      return (
        <div className="relative h-full w-full">
          <DemoArt variant="beach" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04101a] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/40 p-2 backdrop-blur">
            <p className="nx-mono text-[9px] uppercase tracking-widest text-cyan-300">Pousada Arandis</p>
            <p className="mt-0.5 text-xs font-semibold text-white">Chalés à beira-mar</p>
          </div>
        </div>
      );
    case "livrarias":
      return (
        <div className="grid h-full w-full grid-cols-5 gap-1 bg-[#120a08] p-2">
          {[
            ["#6d28d9", "#1e1b4b"],
            ["#ea580c", "#431407"],
            ["#0891b2", "#0c4a6e"],
            ["#be185d", "#500724"],
            ["#059669", "#064e3b"],
          ].map(([a, b], i) => (
            <div key={i} className="aspect-[3/4] rounded" style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} />
          ))}
        </div>
      );
    default:
      return <div className="h-full w-full bg-nx-surface-3" />;
  }
}
