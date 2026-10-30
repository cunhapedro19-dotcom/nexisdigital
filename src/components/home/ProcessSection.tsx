import { MetaTag } from "@/components/visual/Frames";
import { Reveal } from "@/components/visual/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Entendemos as necessidades",
    text: "Conversamos sobre o seu negócio, seus processos e onde o digital pode realmente ajudar.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.97-4.03 9-9 9a9 9 0 0 1-4.9-1.44L3 21l1.44-4.1A9 9 0 0 1 3 12a9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Planejamos a solução",
    text: "Escopo, telas, integrações e prioridades definidas em um plano claro e objetivo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Desenvolvemos e validamos",
    text: "Construímos em ciclos curtos, com validações para garantir que faz sentido na prática.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 20l4-16m4 4 4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Entregamos e mantemos",
    text: "Publicação, treinamento e, quando contratado, manutenção contínua da solução.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function ProcessSection() {
  return (
    <section className="relative border-y border-white/5 bg-nx-surface/30 py-24 sm:py-32">
      <div className="absolute inset-0 nx-tech-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <MetaTag tone="slate">Processo</MetaTag>
          <h2 className="nx-display mt-5 text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Do primeiro papo <span className="nx-text-ice">à entrega.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-nx-muted">
            Um processo estruturado em quatro etapas, pensado para reduzir
            ruídos e entregar o que realmente importa para a sua operação.
          </p>
        </Reveal>

        <ol className="relative mt-16 grid gap-5 md:grid-cols-4">
          {/* Linha de conexão */}
          <div
            className="absolute left-0 right-0 top-10 hidden h-px md:block"
            aria-hidden
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <li className="relative h-full rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-6">
                <div className="relative z-10 grid h-10 w-10 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-200">
                  {s.icon}
                </div>
                <span className="nx-mono mt-5 block text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                  Etapa {s.n}
                </span>
                <p className="nx-display mt-2 text-lg font-medium tracking-tight">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-nx-muted">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}