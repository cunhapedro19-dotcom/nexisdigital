"use client";

import { cloneElement, isValidElement, useState } from "react";
import { BRAND } from "@/config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MetaTag, GlowCard } from "@/components/visual/Frames";
import { Reveal } from "@/components/visual/Reveal";
import { openWhatsApp, formatPhone, buildWhatsAppUrl } from "@/lib/whatsapp";

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 nx-tech-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
            <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" aria-hidden />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <Reveal>
              <MetaTag tone="violet">contato</MetaTag>
              <h1 className="nx-display mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1] tracking-tight">
                Conte o que o seu <span className="nx-text-gradient">negócio precisa.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-nx-muted sm:text-lg">
                Responderemos com perguntas objetivas e, se fizer sentido, uma
                proposta inicial — sem compromisso.
              </p>
            </Reveal>
          </div>
          <div className="nx-light-seam" />
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <Reveal>
                <ContactForm />
              </Reveal>
              <Reveal delay={100}>
                <aside className="space-y-4">
                  <GlowCard>
                    <div className="p-6">
                      <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                        canal prioritário
                      </p>
                      <p className="nx-display mt-2 text-xl font-medium tracking-tight">
                        WhatsApp comercial
                      </p>
                      <p className="mt-1 text-sm text-nx-muted">
                        {formatPhone(BRAND.whatsapp)}
                      </p>
                      <a
                        href={
                          buildWhatsAppUrl(
                            "Olá, Nexis! Gostaria de conversar sobre um projeto.",
                          ) ?? `mailto:${BRAND.email}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nx-glow-violet mt-4 inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-5 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-200" />
                        Chamar no WhatsApp
                      </a>
                    </div>
                  </GlowCard>

                  <GlowCard>
                    <div className="p-6">
                      <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                        e-mail
                      </p>
                      <a
                        href={`mailto:${BRAND.email}`}
                        className="nx-display mt-2 block text-lg font-medium tracking-tight text-violet-200 hover:text-violet-100"
                      >
                        {BRAND.email}
                      </a>
                    </div>
                  </GlowCard>

                  <GlowCard>
                    <div className="p-6">
                      <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
                        atendimento
                      </p>
                      <p className="mt-2 text-sm text-nx-muted">{BRAND.location}</p>
                      <p className="nx-mono mt-2 text-[10px] uppercase tracking-widest text-emerald-300">
                        resposta em até 1 dia útil
                      </p>
                    </div>
                  </GlowCard>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe seu nome.";
    if (!email.trim()) e.email = "Informe um e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
    if (!message.trim()) e.message = "Conte brevemente o que você precisa.";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const lines = [
      "Olá, Nexis!",
      "",
      `Nome: ${name}`,
      company ? `Empresa: ${company}` : null,
      `E-mail: ${email}`,
      phone ? `Telefone: ${phone}` : null,
      interest ? `Interesse: ${interest}` : null,
      "",
      "Mensagem:",
      message,
    ].filter(Boolean) as string[];

    const ok = openWhatsApp(lines.join("\n"));
    if (!ok) {
      window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(
        `Contato via site — ${name}`,
      )}&body=${encodeURIComponent(lines.join("\n"))}`;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <GlowCard>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="nx-display mt-5 text-2xl font-medium tracking-tight">
            Mensagem preparada.
          </p>
          <p className="mt-3 text-sm text-nx-muted">
            Abrimos o canal de contato com as informações preenchidas. Se nada
            abriu, você também pode enviar diretamente para{" "}
            <a href={`mailto:${BRAND.email}`} className="text-violet-200 hover:text-violet-100">
              {BRAND.email}
            </a>
            .
          </p>
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <p className="nx-display text-xl font-medium tracking-tight">
            Envie uma mensagem
          </p>
          <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
            form.01
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nome" id="ct-nome" error={errors.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={inputCls}
            />
          </Field>
          <Field label="Empresa">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nome da empresa (opcional)"
              className={inputCls}
            />
          </Field>
          <Field label="E-mail" id="ct-email" error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              className={inputCls}
            />
          </Field>
          <Field label="Telefone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-0000"
              className={inputCls}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Interesse">
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className={inputCls}
              >
                <option value="">Selecione (opcional)</option>
                <option>Catálogo digital</option>
                <option>Cardápio digital</option>
                <option>Gestão empresarial</option>
                <option>Gestão de RH</option>
                <option>Site institucional</option>
                <option>Site para pousadas</option>
                <option>Sistema para livraria</option>
                <option>Outro / solução personalizada</option>
              </select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Mensagem" id="ct-mensagem" error={errors.message}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte brevemente o problema ou necessidade que você quer resolver."
                className={`${inputCls} min-h-[130px] py-3`}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
          <p className="nx-mono text-[10px] uppercase tracking-[0.16em] text-nx-dim">
            seus dados abrem a conversa no WhatsApp — nada é armazenado
          </p>
          <button
            type="submit"
            className="nx-glow-violet group inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
          >
            Enviar mensagem
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </form>
    </GlowCard>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-nx-bg/60 px-3.5 text-sm text-nx-text placeholder:text-nx-dim transition focus:border-violet-400/50 focus:bg-nx-bg focus:outline-none";

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id?: string;
  error?: string;
  children: React.ReactNode;
}) {
  // Injeta id + atributos ARIA no controle (input/select/textarea) para
  // que leitores de tela anunciem o estado de erro do campo.
  const errorId = id ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<{
          id?: string;
          "aria-invalid"?: boolean;
          "aria-describedby"?: string;
        }>,
        {
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? errorId : undefined,
        },
      )
    : children;

  return (
    <label className="block">
      <span className="nx-mono text-[10px] uppercase tracking-[0.16em] text-nx-muted">
        {label}
      </span>
      <div className="mt-1.5">{control}</div>
      {error && errorId && (
        <span id={errorId} role="alert" className="mt-1 block text-xs text-rose-400">
          {error}
        </span>
      )}
    </label>
  );
}
