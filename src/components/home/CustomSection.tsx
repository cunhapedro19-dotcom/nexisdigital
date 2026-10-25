import Link from "next/link";
import { MetaTag, GlowCard } from "@/components/visual/Frames";
import { Reveal } from "@/components/visual/Reveal";

export function CustomSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <GlowCard>
            <div className="relative grid gap-10 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/40 via-nx-surface to-nx-bg p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
              {/* Esferas decorativas */}
              <div
                className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px]"
                aria-hidden
              />
              <div
                className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/15 blur-[100px]"
                aria-hidden
              />

              <div className="relative">
                <MetaTag tone="violet">Sob medida</MetaTag>
                <h2 className="nx-display mt-5 text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
                  Não encontrou <span className="nx-text-gradient">exatamente</span> o que procura?
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-nx-muted">
                  As demonstrações acima mostram apenas parte do que podemos
                  construir. Se a sua operação tem necessidades específicas —
                  integrações, fluxos próprios, regras do seu segmento —
                  montamos uma solução personalizada a partir do que você já faz.
                </p>

                <ul className="mt-6 space-y-2.5">
                  {[
                    "Integrações com sistemas que você já usa",
                    "Fluxos de aprovação e permissões por perfil",
                    "Relatórios e indicadores do seu negócio",
                    "Layout e identidade visual próprios",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-nx-text/90">
                      <span className="relative mt-2 flex h-2 w-2 flex-none">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-40" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-300" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contato"
                    className="nx-glow-violet group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
                  >
                    Solicitar uma proposta
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                  <Link
                    href="/solucoes"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-white backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    Ver demonstrações
                  </Link>
                </div>
              </div>

              {/* Spec visual */}
              <div className="relative">
                <div className="rounded-2xl border border-white/5 bg-nx-bg/60 p-6 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                      Especificação
                    </span>
                    <span className="relative flex items-center gap-1.5 nx-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 nx-pulse-ring" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      </span>
                      proposta aberta
                    </span>
                  </div>
                  <p className="nx-display mt-3 text-xl font-medium tracking-tight">
                    Projeto sob medida
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {[
                      ["Segmento", "A combinar"],
                      ["Objetivo", "Resolver necessidade real"],
                      ["Stack", "Definida em conjunto"],
                      ["Prazo", "Conforme escopo"],
                      ["Entrega", "Código + publicação"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between border-b border-white/5 pb-2 text-sm last:border-0"
                      >
                        <span className="nx-mono text-[10px] uppercase tracking-widest text-nx-dim">
                          {k}
                        </span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlowCard>
        </Reveal>
      </div>
    </section>
  );
}
