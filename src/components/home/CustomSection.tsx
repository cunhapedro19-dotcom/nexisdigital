import Link from "next/link";
import { MetaTag, GlowCard } from "@/components/visual/Frames";
import { Reveal } from "@/components/visual/Reveal";

export function CustomSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <GlowCard>
            <div className="relative grid gap-10 overflow-hidden rounded-2xl bg-nx-surface p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
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
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-violet-400" />
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contato"
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/85"
                  >
                    Solicitar uma proposta
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                  <Link
                    href="/solucoes"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04]"
                  >
                    Ver demonstrações
                  </Link>
                </div>
              </div>

              {/* Spec visual */}
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-nx-bg/60 p-6">
                  <div className="flex items-center justify-between">
                    <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                      Especificação
                    </span>
                    <span className="flex items-center gap-1.5 nx-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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