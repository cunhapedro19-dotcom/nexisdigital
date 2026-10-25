"use client";

import Link from "next/link";
import { BRAND } from "@/config";
import { ParticleField } from "@/components/visual/ParticleField";
import { Reveal } from "@/components/visual/Reveal";
import { SoftwareFrame, MetaTag } from "@/components/visual/Frames";
import { SOLUTIONS } from "@/data/solutions";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fundo: partículas + grid técnico + gradientes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 nx-tech-grid opacity-60" />
        <div className="absolute inset-0">
          <ParticleField density={50} tint="violet" />
        </div>
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]" aria-hidden />
        <div className="absolute right-0 top-1/3 h-[400px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" aria-hidden />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-32 lg:pt-20">
        {/* Coluna de texto */}
        <div className="nx-fade-up">
          <div className="flex items-center gap-3">
            <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 nx-pulse-ring" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-300" />
              </span>
              Estúdio digital · sob medida
            </span>
          </div>

          <h1 className="nx-display mt-7 text-[clamp(2.4rem,6.2vw,5rem)] font-medium leading-[0.98] tracking-tight">
            Seu negócio tem
            <br />
            <span className="nx-text-gradient">muito a explorar</span>
            <br />
            no digital.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-nx-muted sm:text-lg">
            Sites, plataformas e sistemas personalizados para transformar ideias,
            simplificar operações e ampliar possibilidades.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/solucoes"
              className="nx-glow-violet group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
            >
              <span className="relative z-10">Explorar soluções</span>
              <span className="relative z-10 transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/contato"
              className="group inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-white backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Solicitar um projeto
              <span className="transition-transform group-hover:translate-x-0.5">↗</span>
            </Link>
          </div>

          {/* Meta-informações */}
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/5 pt-6">
            {[
              { k: "07", l: "soluções demonstráveis" },
              { k: "100%", l: "responsivo e acessível" },
              { k: "∞", l: "personalização" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="nx-display text-2xl font-medium tracking-tight">{s.k}</dt>
                <dd className="nx-mono mt-1 text-[10px] uppercase tracking-[0.14em] text-nx-dim">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Coluna visual: painéis flutuantes */}
        <div className="relative hidden aspect-square lg:block nx-fade-in">
          <HeroComposition />
        </div>
      </div>

      {/* Linha de transição */}
      <div className="nx-light-seam" />
    </section>
  );
}

function HeroComposition() {
  // Painéis representando produtos reais, em diferentes planos e rotações sutis.
  return (
    <div className="relative h-full w-full">
      {/* Anel orbital decorativo */}
      <div
        className="absolute inset-8 rounded-full border border-white/5 nx-orbit"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_20px_rgba(196,181,253,0.8)]" />
      </div>
      <div className="absolute inset-16 rounded-full border border-white/[0.03]" aria-hidden />

      {/* Painel 1 - ERP (ao fundo) */}
      <div
        className="absolute left-0 top-8 w-[68%] nx-float-slower"
        style={{ transform: "rotate(-4deg)" }}
      >
        <SoftwareFrame title="ops.nexis" meta="admin" accent="sky">
          <MiniDashboard />
        </SoftwareFrame>
      </div>

      {/* Painel 2 - Catálogo (meio) */}
      <div
        className="absolute right-0 top-24 w-[60%] nx-float-slow"
        style={{ transform: "rotate(3deg)" }}
      >
        <SoftwareFrame title="store.aurora" meta="catalog" accent="violet">
          <MiniStore />
        </SoftwareFrame>
      </div>

      {/* Painel 3 - Cardápio (frente) */}
      <div
        className="absolute bottom-8 left-6 w-[58%]"
        style={{ transform: "rotate(-2deg)" }}
      >
        <SoftwareFrame title="brasa.pao" meta="menu" accent="amber">
          <MiniMenu />
        </SoftwareFrame>
      </div>

      {/* Ponto de luz central */}
      <div
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300"
        aria-hidden
        style={{ boxShadow: "0 0 40px 8px rgba(196, 181, 253, 0.6)" }}
      />
    </div>
  );
}

function MiniDashboard() {
  return (
    <div className="grid grid-cols-3 gap-1.5 p-2.5">
      <div className="rounded-md bg-white/[0.04] p-2">
        <p className="nx-mono text-[8px] uppercase tracking-wider text-white/40">Receita</p>
        <p className="nx-display mt-0.5 text-sm font-medium">R$ 42k</p>
        <div className="mt-1 h-1 rounded-full bg-white/5">
          <div className="h-1 w-[72%] rounded-full bg-sky-400" />
        </div>
      </div>
      <div className="rounded-md bg-white/[0.04] p-2">
        <p className="nx-mono text-[8px] uppercase tracking-wider text-white/40">Vendas</p>
        <p className="nx-display mt-0.5 text-sm font-medium">284</p>
        <p className="nx-mono mt-1 text-[8px] text-emerald-300">+12%</p>
      </div>
      <div className="rounded-md bg-white/[0.04] p-2">
        <p className="nx-mono text-[8px] uppercase tracking-wider text-white/40">Estoque</p>
        <p className="nx-display mt-0.5 text-sm font-medium">1.2k</p>
        <p className="nx-mono mt-1 text-[8px] text-amber-300">3 baixos</p>
      </div>
      <div className="col-span-3 rounded-md bg-white/[0.04] p-2">
        <p className="nx-mono text-[8px] uppercase tracking-wider text-white/40">Últimas 7 dias</p>
        <div className="mt-1 flex h-8 items-end gap-1">
          {[40, 60, 35, 72, 55, 82, 68].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-sky-500/30 to-sky-300/90"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStore() {
  return (
    <div className="grid grid-cols-2 gap-1.5 p-2.5">
      {[
        { src: "/images/catalog-tee.jpg", name: "Essentials", p: "R$ 89" },
        { src: "/images/catalog-hoodie.jpg", name: "Canguro", p: "R$ 229" },
      ].map((p) => (
        <div key={p.name} className="overflow-hidden rounded-md bg-white/[0.04]">
          <div
            className="aspect-square w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${p.src})` }}
          />
          <div className="p-1.5">
            <p className="truncate text-[10px] font-medium">{p.name}</p>
            <p className="nx-mono text-[9px] text-violet-300">{p.p}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniMenu() {
  return (
    <div className="flex gap-2 p-2.5">
      <div
        className="h-14 w-14 flex-none rounded-md bg-cover bg-center"
        style={{ backgroundImage: `url(/images/menu-burger.jpg)` }}
      />
      <div className="flex-1">
        <p className="text-[11px] font-medium">Burger Clássico</p>
        <p className="nx-mono text-[9px] text-amber-300">R$ 32,00</p>
        <div className="mt-1 flex items-center gap-1">
          <span className="rounded bg-white/[0.06] px-1 py-0.5 nx-mono text-[8px] text-white/60">
            +bacon
          </span>
          <span className="rounded bg-white/[0.06] px-1 py-0.5 nx-mono text-[8px] text-white/60">
            +cheddar
          </span>
        </div>
      </div>
      <div className="grid h-7 w-7 place-items-center self-center rounded-md bg-amber-400 text-[11px] font-bold text-black">
        +
      </div>
    </div>
  );
}
