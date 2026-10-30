"use client";

import { BRAND } from "@/config";
import { openWhatsApp } from "@/lib/whatsapp";
import { Reveal } from "@/components/visual/Reveal";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* fundo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 nx-tech-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px]" aria-hidden />
      </div>

      <Reveal className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-200">
          <span className="h-1 w-1 rounded-full bg-violet-300" />
          próximo passo
        </span>

        <h2 className="nx-display mt-6 text-[clamp(2.2rem,5.5vw,4.5rem)] font-medium leading-[1] tracking-tight">
          Vamos conversar sobre
          <br />
          <span className="nx-text-gradient">o seu negócio?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-nx-muted">
          Conte o que sua empresa precisa. Responderemos com perguntas objetivas
          e, se fizer sentido, uma proposta inicial — sem compromisso.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              const ok = openWhatsApp(
                "Olá, Nexis! Gostaria de conversar sobre uma solução digital para o meu negócio.",
              );
              if (!ok) window.location.href = `mailto:${BRAND.email}`;
            }}
            className="nx-glow-violet group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-8 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
          >
            <span className="relative z-10">Chamar no WhatsApp</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-0.5">→</span>
          </button>
          <a
            href={`mailto:${BRAND.email}`}
            className="inline-flex h-14 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-8 text-sm font-medium text-white backdrop-blur transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            Enviar e-mail
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
          <span>sem compromisso</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span>resposta em até 1 dia útil</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span>proposta inicial gratuita</span>
        </div>
      </Reveal>
    </section>
  );
}