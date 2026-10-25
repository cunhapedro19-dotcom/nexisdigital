import Link from "next/link";
import { SOLUTIONS } from "@/data/solutions";
import { Reveal } from "@/components/visual/Reveal";
import { MetaTag, GlowCard } from "@/components/visual/Frames";

/**
 * Catálogo de soluções em bento grid assimétrico.
 * Dois cards grandes (hero) + cinco cards menores.
 */
export function SolutionsSection() {
  return (
    <section id="solucoes" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 nx-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <MetaTag tone="violet">Soluções</MetaTag>
          <h2 className="nx-display mt-5 text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Demonstração real do que <span className="nx-text-gradient">podemos construir</span> para o seu negócio.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-nx-muted">
            Cada card abaixo abre uma aplicação funcional ou um exemplo visual.
            Experimente, navegue pelos fluxos e, quando encontrar algo que faz
            sentido, fale com a Nexis para adaptar ao seu contexto.
          </p>
        </Reveal>

        {/* Bento grid: 7 cards em layout assimétrico */}
        <div className="mt-14 grid gap-4 md:grid-cols-6 md:grid-rows-[repeat(3,minmax(240px,auto))]">
          {/* Card 1 — grande: Catálogo */}
          <Reveal delay={0} className="md:col-span-4 md:row-span-2">
            <HeroSolutionCard solution={SOLUTIONS[0]} />
          </Reveal>

          {/* Card 2 — vertical: Cardápio */}
          <Reveal delay={80} className="md:col-span-2 md:row-span-2">
            <SolutionCard solution={SOLUTIONS[1]} tall />
          </Reveal>

          {/* Card 3 — Gestão empresarial */}
          <Reveal delay={120} className="md:col-span-2">
            <SolutionCard solution={SOLUTIONS[2]} />
          </Reveal>

          {/* Card 4 — RH */}
          <Reveal delay={160} className="md:col-span-2">
            <SolutionCard solution={SOLUTIONS[3]} />
          </Reveal>

          {/* Card 5 — Institucional */}
          <Reveal delay={200} className="md:col-span-2">
            <SolutionCard solution={SOLUTIONS[4]} />
          </Reveal>

          {/* Card 6 — Pousadas */}
          <Reveal delay={240} className="md:col-span-3">
            <SolutionCard solution={SOLUTIONS[5]} wide />
          </Reveal>

          {/* Card 7 — Livrarias */}
          <Reveal delay={280} className="md:col-span-3">
            <SolutionCard solution={SOLUTIONS[6]} wide />
          </Reveal>
        </div>

        <Reveal className="mt-12 text-center">
          <Link
            href="/solucoes"
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            Ver todas as soluções
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** Card hero (grande) com imagem real e mockup sobreposto */
function HeroSolutionCard({ solution }: { solution: (typeof SOLUTIONS)[number] }) {
  return (
    <Link
      href={solution.href}
      className="group relative block h-full overflow-hidden rounded-3xl"
    >
      <GlowCard className="h-full">
        <div className="relative grid h-full grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl bg-gradient-to-br from-nx-surface-2 via-nx-surface to-nx-bg p-7 sm:p-9">
          <div className="flex items-start justify-between">
            <div>
              <MetaTag tone="violet">{solution.kindLabel}</MetaTag>
              <h3 className="nx-display mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
                {solution.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-nx-muted">
                {solution.description}
              </p>
            </div>
            <div className="nx-mono hidden text-[10px] uppercase tracking-[0.2em] text-nx-dim sm:block">
              01 / 07
            </div>
          </div>

          {/* Visual central — grade de produtos */}
          <div className="relative my-8 grid min-h-[260px] grid-cols-4 gap-3">
            <ProductTile src="/images/catalog-tee.jpg" delay={0} />
            <ProductTile src="/images/catalog-hoodie.jpg" delay={80} />
            <ProductTile src="/images/catalog-cap.jpg" delay={160} />
            <ProductTile src="/images/catalog-bag.jpg" delay={240} />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,6,10,0.8)_100%)]" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-nx-muted">{solution.problem}</p>
            <span className="group/arr inline-flex items-center gap-1.5 text-sm font-medium text-violet-200 transition group-hover:text-violet-100">
              Abrir demonstração
              <span className="transition-transform group-hover/arr:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}

function ProductTile({ src, delay }: { src: string; delay: number }) {
  return (
    <div
      className="nx-fade-up relative aspect-[3/4] overflow-hidden rounded-xl bg-nx-surface-3 ring-1 ring-white/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${src})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
}

/** Card padrão, três variações: normal, tall (vertical), wide (horizontal) */
function SolutionCard({
  solution,
  tall,
  wide,
}: {
  solution: (typeof SOLUTIONS)[number];
  tall?: boolean;
  wide?: boolean;
}) {
  const preview = getPreview(solution.slug);

  return (
    <Link
      href={solution.href}
      className="group relative block h-full overflow-hidden rounded-2xl"
    >
      <GlowCard className="h-full">
        <div
          className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-nx-surface-2 to-nx-bg ${
            tall ? "p-5" : wide ? "p-6 sm:flex-row sm:items-center sm:gap-6" : "p-6"
          }`}
        >
          {/* Imagem/preview */}
          <div
            className={`relative overflow-hidden rounded-xl ${
              tall
                ? "order-1 mt-5 aspect-[4/5] w-full"
                : wide
                ? "sm:w-1/2 aspect-[16/10] sm:aspect-square"
                : "aspect-[16/10]"
            }`}
          >
            {preview}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
          </div>

          {/* Texto */}
          <div className={`flex flex-1 flex-col ${tall ? "order-2" : ""} ${wide ? "sm:w-1/2" : "mt-4"}`}>
            <div className="flex items-center gap-2">
              <MetaTag tone={kindTone(solution.kind)}>{solution.kindLabel}</MetaTag>
            </div>
            <h3 className="nx-display mt-3 text-xl font-medium tracking-tight sm:text-2xl">
              {solution.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-nx-muted line-clamp-3">
              {solution.problem}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-violet-200 transition group-hover:text-violet-100">
              {solution.kind === "exemplo" ? "Ver exemplo" : "Abrir demonstração"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}

function kindTone(k: string): "violet" | "ice" | "slate" {
  if (k === "demo") return "violet";
  if (k === "exemplo") return "ice";
  return "slate";
}

/** Miniaturas visuais de cada solução, feitas em CSS/SVG. */
function getPreview(slug: string) {
  switch (slug) {
    case "cardapio-digital":
      return (
        <div className="relative h-full w-full bg-gradient-to-br from-amber-950 to-nx-bg">
          <img
            src="/images/menu-burger.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 p-2.5 backdrop-blur">
            <p className="nx-mono text-[9px] uppercase tracking-widest text-amber-300">
              Burger Clássico
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white">R$ 32,00</p>
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
          <div className="flex items-center gap-2 rounded bg-white/[0.04] p-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-[10px] font-bold text-black">
              JF
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium">Júlia Ferreira</p>
              <p className="nx-mono text-[9px] text-white/50">Engenharia · Sênior</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 nx-mono text-[8px] text-emerald-300">
              ATIVO
            </span>
          </div>
          <div className="flex items-center gap-2 rounded bg-white/[0.04] p-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-[10px] font-bold text-black">
              MC
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium">Mariana Costa</p>
              <p className="nx-mono text-[9px] text-white/50">Comercial · Gerente</p>
            </div>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 nx-mono text-[8px] text-amber-300">
              FÉRIAS
            </span>
          </div>
          <div className="flex items-center gap-2 rounded bg-white/[0.04] p-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-700 text-[10px] font-bold text-black">
              RS
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-medium">Rafael Souza</p>
              <p className="nx-mono text-[9px] text-white/50">Produto · Pleno</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 nx-mono text-[8px] text-emerald-300">
              ATIVO
            </span>
          </div>
        </div>
      );
    case "site-institucional":
      return (
        <div className="relative h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950 p-3">
          <div className="flex items-center justify-between">
            <span className="nx-display text-[11px] font-medium text-white">Vértice</span>
            <div className="flex gap-1.5 nx-mono text-[8px] text-white/50">
              <span>sobre</span>
              <span>serviços</span>
              <span>contato</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="aspect-[4/5] rounded bg-gradient-to-br from-amber-800/30 to-zinc-900" />
            <div className="space-y-1.5 pt-1">
              <p className="nx-display text-sm font-medium leading-tight text-white">
                Projetos que combinam forma e função.
              </p>
              <p className="text-[9px] text-white/50">
                Arquitetura autoral para residências e escritórios.
              </p>
              <div className="mt-2 inline-flex h-5 items-center rounded bg-white px-2 text-[9px] font-semibold text-black">
                Ver portfólio
              </div>
            </div>
          </div>
        </div>
      );
    case "pousadas":
      return (
        <div className="relative h-full w-full">
          <img src="/images/inn-beach.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04101a] via-[#04101a]/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/40 p-2.5 backdrop-blur">
            <p className="nx-mono text-[9px] uppercase tracking-widest text-cyan-300">
              Pousada Arandis
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white">Chalés à beira-mar</p>
          </div>
        </div>
      );
    case "livrarias":
      return (
        <div className="grid h-full w-full grid-cols-4 gap-1 bg-[#120a08] p-2">
          {[
            ["#6d28d9", "#1e1b4b"],
            ["#ea580c", "#431407"],
            ["#0891b2", "#0c4a6e"],
            ["#be185d", "#500724"],
          ].map(([a, b], i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded"
              style={{ background: `linear-gradient(160deg, ${a}, ${b})` }}
            />
          ))}
        </div>
      );
    default:
      return <div className="h-full w-full bg-nx-surface-3" />;
  }
}
