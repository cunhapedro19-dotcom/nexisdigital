"use client";

import Link from "next/link";
import { Reveal } from "@/components/visual/Reveal";
import { SoftwareFrame } from "@/components/visual/Frames";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fundo: grid técnico sutil, sem partículas nem blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 nx-tech-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_20%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-32">
        {/* Composição centrada — estilo Vercel/Linear */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-nx-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Estúdio digital · sob medida
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="nx-display mt-8 text-[clamp(2.6rem,6.5vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              Seu negócio tem
              <br />
              <span className="nx-text-gradient">muito a explorar</span>
              <br />
              no digital.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-nx-muted sm:text-lg">
              Sites, plataformas e sistemas personalizados para transformar
              ideias, simplificar operações e ampliar possibilidades.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/solucoes"
                className="group inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Explorar soluções
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/contato"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04]"
              >
                Solicitar um projeto
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Painel único em destaque — mockup limpo, centrado */}
        <Reveal delay={260} className="relative mx-auto mt-20 max-w-4xl">
          <div className="relative">
            {/* Brilho de topo discreto */}
            <div
              className="absolute -inset-x-8 -top-8 h-40 bg-violet-500/[0.07] blur-[80px]"
              aria-hidden
            />
            <SoftwareFrame title="ops.nexis" meta="gestão empresarial" accent="violet">
              <HeroDashboard />
            </SoftwareFrame>
          </div>
        </Reveal>

        {/* Meta-informações em linha */}
        <Reveal delay={340}>
          <dl className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { k: "07", l: "soluções demonstráveis" },
              { k: "100%", l: "responsivo e acessível" },
              { k: "∞", l: "personalização" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <dt className="nx-display text-3xl font-semibold tracking-tight">{s.k}</dt>
                <dd className="nx-mono mt-1.5 text-[10px] uppercase tracking-[0.14em] text-nx-dim">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/** Mockup de dashboard: flat, dados reais, sem ornamento. */
function HeroDashboard() {
  return (
    <div className="p-4 sm:p-5">
      {/* Header interno com KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Receita", value: "R$ 42.5k", delta: "+12%", positive: true },
          { label: "Vendas", value: "284", delta: "+8%", positive: true },
          { label: "Estoque", value: "1.204", delta: "3 baixos", positive: false },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="nx-mono text-[9px] uppercase tracking-wider text-nx-dim">
              {kpi.label}
            </p>
            <p className="nx-display mt-1 text-base font-semibold tracking-tight sm:text-lg">
              {kpi.value}
            </p>
            <p className={`nx-mono mt-0.5 text-[9px] ${kpi.positive ? "text-emerald-400" : "text-amber-400"}`}>
              {kpi.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras minimal */}
      <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center justify-between">
          <p className="nx-mono text-[9px] uppercase tracking-wider text-nx-dim">
            Últimos 7 dias
          </p>
          <p className="nx-mono text-[9px] text-nx-dim">semana atual</p>
        </div>
        <div className="mt-3 flex h-24 items-end gap-1.5 sm:h-28">
          {[38, 56, 42, 68, 52, 84, 72].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-[3px] transition-all ${
                i === 5 ? "bg-violet-400" : "bg-white/[0.08]"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between nx-mono text-[8px] uppercase tracking-wider text-nx-dim">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <span key={i} className="flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>

      {/* Lista de transações */}
      <div className="mt-3 space-y-1.5">
        {[
          { name: "Ana Martins", detail: "2 itens", value: "R$ 1.950", status: "Concluída" },
          { name: "Bruno Lima", detail: "1 item", value: "R$ 1.599", status: "Concluída" },
          { name: "Carla Duarte", detail: "3 itens", value: "R$ 2.847", status: "Pendente" },
        ].map((t) => (
          <div
            key={t.name}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-white/[0.06] text-[9px] font-semibold text-nx-muted">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{t.name}</p>
                <p className="nx-mono text-[9px] text-nx-dim">{t.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                  t.status === "Concluída"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {t.status}
              </span>
              <span className="nx-mono text-xs">{t.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
