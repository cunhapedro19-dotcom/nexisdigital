"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal } from "@/components/visual/Reveal";
import { useLocalStorage } from "@/lib/use-local-storage";
import { AdminFab } from "@/components/admin/AdminKit";
import {
  InstitucionalAdminPanel,
  type InstitucionalData,
} from "./AdminPanel";

// Estado inicial persistido: serviços e portfólio (editáveis pelo painel).
const SEED: InstitucionalData = {
  services: [
    { id: "s1", title: "Projeto arquitetônico", description: "Do estudo de viabilidade ao projeto executivo." },
    { id: "s2", title: "Interiores", description: "Layout, marcenaria, especificação de materiais." },
    { id: "s3", title: "Reforma", description: "Diagnóstico, retrofit e compatibilização." },
    { id: "s4", title: "Acompanhamento de obra", description: "Visitas técnicas e controle de qualidade." },
    { id: "s5", title: "Consultoria", description: "Pareceres e orientação para decisões de projeto." },
    { id: "s6", title: "Paisagismo", description: "Em parceria com especialistas, conforme o escopo." },
  ],
  projects: [
    { id: "p1", title: "Casa Araucária", meta: "Residencial · 2024", hue: 28 },
    { id: "p2", title: "Loja Matiz", meta: "Comercial · 2023", hue: 340 },
    { id: "p3", title: "Escritório Norte", meta: "Corporativo · 2023", hue: 220 },
    { id: "p4", title: "Refúgio Serra", meta: "Residencial · 2022", hue: 90 },
    { id: "p5", title: "Café Origem", meta: "Comercial · 2022", hue: 18 },
    { id: "p6", title: "Apartamento 120", meta: "Interiores · 2024", hue: 200 },
  ],
};

export default function SiteInstitucionalPage() {
  // Dados do site persistidos no navegador — a vitrine e o painel
  // de demonstração compartilham o mesmo estado.
  const { value: data, setValue: setData, reset: resetData } = useLocalStorage<InstitucionalData>(
    "nx-demo-siteinst:v1",
    SEED,
  );
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Barra Nexis */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6">
          <Link href="/solucoes" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white">
            ← Voltar para a Nexis Digital
          </Link>
          <span className="nx-mono inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-violet-200">
            <span className="h-1 w-1 rounded-full bg-current" />
            exemplo visual · site institucional
          </span>
        </div>
      </div>

      {/* Header da empresa fictícia */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-100 text-zinc-900">
              <span className="font-display text-base font-semibold">V</span>
            </div>
            <div>
              <p className="font-display text-sm font-medium tracking-tight">Estúdio Vértice</p>
              <p className="nx-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                arquitetura · interiores
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a href="#sobre" className="transition hover:text-white">Sobre</a>
            <a href="#servicos" className="transition hover:text-white">Serviços</a>
            <a href="#portfolio" className="transition hover:text-white">Portfólio</a>
            <a href="#contato" className="transition hover:text-white">Contato</a>
          </nav>
          <a
            href="#contato"
            className="inline-flex h-9 items-center rounded-lg bg-zinc-100 px-3.5 text-xs font-semibold text-zinc-900 hover:bg-white"
          >
            Iniciar projeto
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 -z-10 nx-dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-32">
            <Reveal>
              <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                <span className="h-1 w-1 rounded-full bg-zinc-100" />
                arquitetura autoral · desde 2010
              </span>
              <h1 className="nx-display mt-7 text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.98] tracking-tight">
                Projetos que
                <br />
                combinam <span className="italic text-zinc-400">forma</span>,
                <br />
                função e contexto.
              </h1>
              <p className="mt-7 max-w-md text-base leading-relaxed text-zinc-400">
                Desenvolvemos projetos residenciais, comerciais e corporativos
                com foco em uso real, luz natural e materiais honestos.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#portfolio"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-zinc-100 px-6 text-sm font-semibold text-zinc-900 transition hover:bg-white"
                >
                  Ver portfólio
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
                <a
                  href="#contato"
                  className="inline-flex h-12 items-center rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 text-sm transition hover:border-zinc-500 hover:bg-zinc-900"
                >
                  Iniciar um projeto
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded"
                      style={{
                        backgroundColor: `hsl(${28 + i * 3}, 10%, ${18 + (i % 4) * 4}%)`,
                      }}
                    />
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 nx-edge-light rounded-xl bg-black/50 p-4 backdrop-blur-xl">
                  <p className="nx-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                    projeto em destaque
                  </p>
                  <p className="nx-display mt-1 text-base font-medium">Casa Araucária · 2024</p>
                  <p className="text-xs text-zinc-400">Residencial · 420m² · Serra da Cantareira</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="border-b border-zinc-800 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
              <Reveal>
                <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">sobre</span>
                <h2 className="nx-display mt-3 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                  Quinze anos traduzindo necessidades em espaços.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <div className="space-y-5 text-zinc-400">
                  <p className="text-base leading-relaxed">
                    O Estúdio Vértice é um escritório de arquitetura fundado em
                    2010 com atuação em projetos residenciais, comerciais e
                    corporativos.
                  </p>
                  <p className="text-base leading-relaxed">
                    Trabalhamos do estudo preliminar à execução, com uma equipe
                    enxuta e parcerias estáveis de engenharia, paisagismo e
                    iluminação.
                  </p>
                  <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
                    {[
                      ["120+", "projetos entregues"],
                      ["15", "anos de estúdio"],
                      ["8", "prêmios"],
                    ].map(([v, l]) => (
                      <div key={l}>
                        <dt className="nx-display text-2xl font-medium tracking-tight">{v}</dt>
                        <dd className="nx-mono mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{l}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="servicos" className="border-b border-zinc-800 bg-zinc-950/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">serviços</span>
              <h2 className="nx-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">O que fazemos</h2>
            </Reveal>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((s, i) => (
                <Reveal key={s.id}>
                  <div className="group relative h-full bg-zinc-950 p-7 transition hover:bg-zinc-900">
                    <span className="nx-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="nx-display mt-5 text-xl font-medium tracking-tight">{s.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.description}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition group-hover:text-white">
                      saber mais <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
            {data.services.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                Nenhum serviço cadastrado no painel de demonstração.
              </div>
            )}
          </div>
        </section>

        {/* Diferenciais */}
        <section className="border-b border-zinc-800 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">diferenciais</span>
              <h2 className="nx-display mt-3 max-w-2xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                Um jeito de trabalhar que valoriza o essencial.
              </h2>
            </Reveal>
            <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-2">
              {[
                "Processo estruturado e transparente em todas as etapas.",
                "Projetos pensados para o uso real, não apenas para fotografias.",
                "Atendimento direto com os arquitetos responsáveis.",
                "Especificações com foco em durabilidade e custo-benefício.",
              ].map((t, i) => (
                <Reveal key={t} delay={i * 60}>
                  <li className="flex h-full items-start gap-5 bg-zinc-950 p-7">
                    <span className="nx-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      0{i + 1}
                    </span>
                    <span className="text-base leading-relaxed text-zinc-200">{t}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* Portfólio */}
        <section id="portfolio" className="border-b border-zinc-800 bg-zinc-950/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">portfólio</span>
                  <h2 className="nx-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                    Projetos recentes.
                  </h2>
                </div>
                <p className="nx-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  conteúdo ilustrativo
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.projects.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <article className="group nx-edge-light overflow-hidden rounded-2xl bg-zinc-900">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <div
                        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, hsl(${p.hue}, 15%, 22%) 0%, hsl(${p.hue}, 8%, 10%) 100%)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 nx-mono rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/80 backdrop-blur">
                        {p.meta}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="nx-display text-lg font-medium tracking-tight">{p.title}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="nx-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          {p.meta}
                        </p>
                        <span className="text-xs text-zinc-400 transition group-hover:text-white">
                          ver →
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
              {data.projects.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                  Nenhum projeto no portfólio. Cadastre projetos pelo painel de demonstração.
                </div>
              )}
          </div>
        </section>

        {/* Depoimentos */}
        <section className="border-b border-zinc-800 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">depoimentos</span>
              <h2 className="nx-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                O que dizem sobre trabalhar com a gente.
              </h2>
              <p className="mt-2 nx-mono text-[10px] uppercase tracking-widest text-zinc-500">
                conteúdo ilustrativo · usado apenas como demonstração
              </p>
            </Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                { t: "Entenderam exatamente o que a gente precisava — e entregaram além.", n: "Helena Prado", r: "Cliente residencial" },
                { t: "Processo claro, prazos cumpridos e atenção real aos detalhes.", n: "André Vilas", r: "Diretor de operações" },
                { t: "Parceria de confiança em três reformas seguidas.", n: "Marina Lemos", r: "Proprietária de loja" },
              ].map((d, i) => (
                <Reveal key={d.n} delay={i * 80}>
                  <figure className="nx-edge-light h-full rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-7">
                    <span className="nx-display text-4xl text-zinc-600">&ldquo;</span>
                    <blockquote className="mt-3 text-sm leading-relaxed text-zinc-200">
                      {d.t}
                    </blockquote>
                    <figcaption className="mt-6 border-t border-zinc-800 pt-4">
                      <p className="font-display text-sm font-medium">{d.n}</p>
                      <p className="nx-mono text-[10px] uppercase tracking-widest text-zinc-500">{d.r}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="border-b border-zinc-800 bg-zinc-950/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">localização</span>
              <h2 className="nx-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Onde estamos</h2>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Reveal>
                <div className="nx-edge-light h-full rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-7">
                  <p className="nx-mono text-[10px] uppercase tracking-widest text-zinc-500">escritório</p>
                  <p className="nx-display mt-3 text-xl font-medium tracking-tight">
                    Rua das Palmeiras, 1200
                  </p>
                  <p className="text-sm text-zinc-400">São Paulo · SP · endereço ilustrativo</p>
                  <div className="mt-6 space-y-2 border-t border-zinc-800 pt-5 text-sm text-zinc-400">
                    <p>Seg – Sex · 9h às 19h</p>
                    <p>Atendimento com hora marcada</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div
                  className="relative h-full min-h-[280px] overflow-hidden rounded-2xl"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #18181b 0 14px, #27272a 14px 28px)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.7)_100%)]" />
                  <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-100/30" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Contato */}
        <ContactSection />
      </main>

      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <p className="nx-mono text-[10px] uppercase tracking-widest text-zinc-500">
            © {new Date().getFullYear()} Estúdio Vértice · empresa fictícia · demo Nexis Digital
          </p>
          <div className="flex gap-4 nx-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Behance</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* CTA Nexis */}
      <div className="sticky bottom-0 z-40 border-t border-violet-400/30 bg-gradient-to-b from-violet-500/10 to-violet-500/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="text-sm">
            <p className="font-display font-medium">Quer um site assim para a sua empresa?</p>
            <p className="nx-mono text-[10px] uppercase tracking-widest text-zinc-400">
              este é apenas um exemplo
            </p>
          </div>
          <a
            href={
              buildWhatsAppUrl(
                "Olá, Nexis! Gostei do exemplo de site institucional e quero uma solução assim.",
              ) ?? "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="nx-glow-violet inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 text-sm font-semibold text-white transition hover:from-violet-400 hover:to-violet-600"
          >
            Quero uma solução assim
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Acesso ao painel administrativo da demonstração */}
      <AdminFab raised onClick={() => setAdminOpen(true)} label="Painel de demonstração" />

      {adminOpen && (
        <InstitucionalAdminPanel
          data={data}
          onChange={setData}
          onClose={() => setAdminOpen(false)}
          onReset={resetData}
        />
      )}
    </div>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = "Informe seu nome.";
    if (!form.email.trim()) er.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "E-mail inválido.";
    if (!form.message.trim()) er.message = "Escreva uma mensagem.";
    setErrors(er);
    if (Object.keys(er).length) return;

    const url = buildWhatsAppUrl(
      `Olá! Meu nome é ${form.name} (${form.email}). ${form.message}`,
    );
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const cls =
    "h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 text-sm focus:border-zinc-500 focus:outline-none";

  return (
    <section id="contato" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">contato</span>
          <h2 className="nx-display mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            Vamos conversar sobre o seu projeto?
          </h2>
        </Reveal>

        {sent ? (
          <Reveal>
            <div className="mt-10 nx-edge-light rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="nx-display mt-5 text-2xl font-medium tracking-tight">Mensagem preparada</p>
              <p className="mt-3 text-sm text-zinc-400">
                Se o WhatsApp não abriu, você também pode escrever para{" "}
                <a href={`mailto:${BRAND.email}`} className="text-zinc-100 underline">
                  {BRAND.email}
                </a>
                .
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={100}>
            <form onSubmit={submit} noValidate className="mt-10 nx-edge-light rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-7 sm:p-9">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Nome</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${cls} mt-1.5`}
                  />
                  {errors.name && <span className="mt-1 block text-xs text-rose-400">{errors.name}</span>}
                </label>
                <label className="block">
                  <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">E-mail</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`${cls} mt-1.5`}
                  />
                  {errors.email && <span className="mt-1 block text-xs text-rose-400">{errors.email}</span>}
                </label>
                <label className="block sm:col-span-2">
                  <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Mensagem</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${cls} mt-1.5 min-h-[130px] py-3`}
                  />
                  {errors.message && <span className="mt-1 block text-xs text-rose-400">{errors.message}</span>}
                </label>
              </div>
              <button
                type="submit"
                className="group mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-zinc-100 px-6 text-sm font-semibold text-zinc-900 transition hover:bg-white"
              >
                Enviar mensagem
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}
