"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { currencyBRL } from "@/lib/cn";
import { DemoArt } from "@/components/visual/DemoArt";
import { useLocalStorage } from "@/lib/use-local-storage";
import { AdminFab } from "@/components/admin/AdminKit";
import { PousadaAdminPanel, type PousadaData } from "./AdminPanel";

// Estado inicial persistido: acomodações + comodidades (editáveis pelo painel).
const SEED: PousadaData = {
  rooms: [
    {
      id: "r1",
      name: "Chalé Jardim",
      meta: "2 hóspedes · 32m²",
      description: "Cama queen, varanda com rede e vista para o jardim interno.",
      price: 420,
      art: "room",
    },
    {
      id: "r2",
      name: "Chalé Mata",
      meta: "3 hóspedes · 40m²",
      description: "Cama queen + solteiro, ofurô privativo e trilha interna exclusiva.",
      price: 580,
      art: "room-warm",
    },
    {
      id: "r3",
      name: "Chalé Beira-Mar",
      meta: "4 hóspedes · 55m²",
      description: "Dois ambientes, deck com espreguiçadeira e acesso direto à praia.",
      price: 820,
      art: "beach-wide",
    },
  ],
  amenities: [
    { id: "a1", icon: "☕", title: "Café da manhã artesanal", description: "Buffet com frutas, pães e bolos da casa." },
    { id: "a2", icon: "🏊", title: "Piscina com deck", description: "Espreguiçadeiras, toalhas e bar de apoio." },
    { id: "a3", icon: "🌿", title: "Trilhas internas", description: "Percursos sinalizados pela mata atlântica." },
    { id: "a4", icon: "📶", title: "Wi-Fi nas áreas comuns", description: "Chalés com conexão dedicada." },
    { id: "a5", icon: "🚗", title: "Estacionamento gratuito", description: "Vagas cobertas e manobrista." },
    { id: "a6", icon: "🛎️", title: "Recepção 24h", description: "Atendimento em português, inglês e espanhol." },
    { id: "a7", icon: "🍽️", title: "Restaurante aberto ao público", description: "Cozinha autoral com ingredientes locais." },
    { id: "a8", icon: "🧘", title: "Espaço para yoga", description: "Aulas ao amanhecer, sob reserva." },
    { id: "a9", icon: "🛶", title: "Caiaques e pranchas", description: "Equipamentos gratuitos para hóspedes." },
  ],
};

export default function PousadasPage() {
  const { value: data, setValue: setData, reset: resetData } = useLocalStorage<PousadaData>(
    "nx-demo-pousadas:v1",
    SEED,
  );
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06141b] text-cyan-50">
      {/* Barra Nexis */}
      <div className="border-b border-white/10 bg-[#04101a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6">
          <Link href="/solucoes" className="inline-flex items-center gap-2 text-cyan-200/70 hover:text-white">
            ← Voltar para a Nexis Digital
          </Link>
          <span className="nx-mono inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200">
            <span className="h-1 w-1 rounded-full bg-current" />
            exemplo visual · pousadas
          </span>
        </div>
      </div>

      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-300 to-cyan-700" />
              <span className="relative font-display text-base font-semibold text-[#04101a]">A</span>
            </div>
            <div>
              <p className="font-display text-sm font-medium tracking-tight">Pousada Arandis</p>
              <p className="nx-mono text-[9px] uppercase tracking-[0.2em] text-cyan-200/60">
                litoral · desde 2008
              </p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-cyan-100/80 md:flex">
            <a href="#acomodacoes" className="hover:text-white">Acomodações</a>
            <a href="#galeria" className="hover:text-white">Galeria</a>
            <a href="#comodidades" className="hover:text-white">Comodidades</a>
            <a href="#reserva" className="hover:text-white">Reserva</a>
          </nav>
          <a
            href="#reserva"
            className="inline-flex h-9 items-center rounded-lg bg-cyan-300 px-3.5 text-xs font-semibold text-[#04101a] hover:bg-cyan-200"
          >
            Reservar
          </a>
        </div>
      </header>

      <main>
        {/* Hero com arte própria */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <DemoArt variant="beach" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#04101a]/60 via-[#04101a]/30 to-[#06141b]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#04101a]/80 via-transparent to-transparent" />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 sm:py-32 md:grid-cols-2">
            <div>
              <span className="nx-mono inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75 nx-pulse-ring" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-200" />
                </span>
                refúgio à beira-mar
              </span>
              <h1 className="nx-display mt-6 text-4xl font-medium leading-[1] tracking-tight sm:text-5xl lg:text-6xl">
                Dias tranquilos
                <br />
                entre o <span className="nx-text-ice">mar</span> e a mata.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-cyan-100/80">
                Chalés privativos, café da manhã artesanal e acesso direto à
                praia — uma hospedagem pensada para desacelerar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#reserva"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-cyan-300 px-6 text-sm font-semibold text-[#04101a] transition hover:bg-cyan-200"
                >
                  Solicitar reserva
                  <span>→</span>
                </a>
                <a
                  href="#acomodacoes"
                  className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm backdrop-blur transition hover:border-white/30 hover:bg-white/10"
                >
                  Ver acomodações
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Acomodações */}
        <section id="acomodacoes" className="relative border-b border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">acomodações</span>
            <h2 className="nx-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Três tipos de chalé
            </h2>
            <p className="mt-2 max-w-xl text-sm text-cyan-100/70">
              Cada chalé foi pensado para um perfil de hóspede — do casal que
              busca privacidade à família que quer espaço e deck próprio.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {data.rooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-cyan-100/70 md:col-span-3">
                  Nenhuma acomodação cadastrada — gerencie pelo painel de demonstração
                  (canto inferior esquerdo).
                </div>
              ) : (
                data.rooms.map((a) => (
                  <article
                    key={a.id}
                    className="group nx-edge-light overflow-hidden rounded-2xl bg-white/[0.03]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <DemoArt variant={a.art} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04101a] via-[#04101a]/20 to-transparent" />
                      <span className="absolute left-3 top-3 nx-mono rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/90 backdrop-blur">
                        {a.meta}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="nx-display text-xl font-medium tracking-tight">{a.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-cyan-100/75">{a.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                        <p className="text-sm font-medium">
                          a partir de {currencyBRL(a.price)} / diária
                        </p>
                        <a
                          href="#reserva"
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 text-xs hover:bg-white/10"
                        >
                          Reservar
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            <p className="mt-8 nx-mono text-[10px] uppercase tracking-widest text-cyan-100/50">
              valores ilustrativos · disponibilidade confirmada no atendimento
            </p>
          </div>
        </section>

        {/* Galeria */}
        <section id="galeria" className="relative border-b border-white/10 bg-[#04101a] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">galeria</span>
                <h2 className="nx-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                  Um tour visual
                </h2>
              </div>
              <p className="nx-mono text-[10px] uppercase tracking-widest text-cyan-100/50">
                imagens ilustrativas
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
              {[
                { art: "beach" as const, span: "md:col-span-2 md:row-span-2", ratio: "aspect-[4/3] md:aspect-auto" },
                { art: "room" as const, span: "", ratio: "aspect-square" },
                { art: "room-warm" as const, span: "", ratio: "aspect-square" },
                { art: "beach-wide" as const, span: "md:col-span-2", ratio: "aspect-[16/9]" },
              ].map((tile, i) => (
                <div
                  key={i}
                  className={`nx-edge-light relative overflow-hidden rounded-2xl ${tile.span} ${tile.ratio}`}
                >
                  <DemoArt variant={tile.art} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comodidades */}
        <section id="comodidades" className="relative border-b border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">comodidades</span>
            <h2 className="nx-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              O que está incluído
            </h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.amenities.map((am) => (
                <div
                  key={am.id}
                  className="nx-edge-light rounded-2xl bg-nx-surface p-5 transition hover:-translate-y-0.5"
                >
                  <span className="text-2xl" aria-hidden>
                    {am.icon}
                  </span>
                  <p className="nx-display mt-3 text-base font-medium tracking-tight">{am.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-cyan-100/70">{am.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="border-b border-white/10 bg-[#04101a] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">localização</span>
            <h2 className="nx-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">Como chegar</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="nx-edge-light rounded-2xl bg-nx-surface p-6">
                <p className="nx-mono text-[10px] uppercase tracking-widest text-cyan-100/60">endereço ilustrativo</p>
                <p className="nx-display mt-3 text-xl font-medium tracking-tight">
                  Rua das Dunas, 420
                </p>
                <p className="text-sm text-cyan-100/80">Praia do Silêncio · Litoral fictício</p>
                <div className="mt-6 space-y-2.5 border-t border-white/5 pt-5 text-sm text-cyan-100/80">
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    35 minutos do aeroporto regional
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    5 minutos do centrinho
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    Transfers sob encomenda
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 opacity-80">
                  <DemoArt variant="beach-wide" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 to-[#04101a]/60" />
                <div className="relative flex h-full flex-col justify-end p-6">
                  <p className="nx-mono text-[10px] uppercase tracking-widest text-cyan-200">coordenadas</p>
                  <p className="nx-display mt-1 text-lg font-medium">-23.4567, -45.1234</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reserva */}
        <section id="reserva" className="relative py-20 sm:py-28">
          <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <span className="nx-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">reserva</span>
            <h2 className="nx-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Solicite sua reserva pelo WhatsApp.
            </h2>
            <p className="mt-3 text-sm text-cyan-100/70">
              Esta é uma solicitação. A confirmação depende de disponibilidade e
              é feita pela equipe da pousada.
            </p>

            <ReservationForm roomNames={data.rooms.map((r) => r.name)} />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-cyan-100/60 sm:px-6">
          <p className="nx-mono text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} Pousada Arandis · empresa fictícia · demo Nexis Digital
          </p>
          <a href={`mailto:${BRAND.email}`} className="hover:text-white">
            contato@arandis.demo
          </a>
        </div>
      </footer>

      {/* CTA Nexis */}
      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-nx-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="text-sm">
            <p className="font-display font-medium">Quer um site assim para a sua pousada?</p>
            <p className="nx-mono text-[10px] uppercase tracking-widest text-nx-muted">
              adaptamos layout, conteúdo e integrações
            </p>
          </div>
          <a
            href={
              buildWhatsAppUrl(
                "Olá, Nexis! Gostei do exemplo de pousadas e quero uma solução assim.",
              ) ?? "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-black transition hover:bg-white/85 px-4"
          >
            Quero uma solução assim
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Acesso ao painel administrativo da demonstração */}
      <AdminFab raised onClick={() => setAdminOpen(true)} label="Painel de demonstração" />

      {adminOpen && (
        <PousadaAdminPanel
          data={data}
          onChange={setData}
          onClose={() => setAdminOpen(false)}
          onReset={resetData}
        />
      )}
    </div>
  );
}

function ReservationForm({ roomNames }: { roomNames: string[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  // Acomodação selecionada: mantém a escolha do usuário; se ela deixar de
  // existir (ou antes da hidratação), usa a primeira da lista.
  const selectedType = roomNames.includes(type) ? type : (roomNames[0] ?? "");

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe seu nome.";
    if (!email.trim()) e.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
    if (!checkin || !checkout) e.dates = "Informe as datas.";
    else if (checkin >= checkout) e.dates = "O check-out deve ser posterior ao check-in.";
    const today = new Date().toISOString().slice(0, 10);
    if (checkin && checkin < today) e.dates = "A data de check-in não pode ser no passado.";
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1 || g > 8) e.guests = "Informe entre 1 e 8 hóspedes.";
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const msg = [
      "Olá, Pousada Arandis! Gostaria de solicitar uma reserva:",
      "",
      `Nome: ${name}`,
      `E-mail: ${email}`,
      phone ? `Telefone: ${phone}` : null,
      "",
      `Check-in: ${checkin}`,
      `Check-out: ${checkout}`,
      `Hóspedes: ${guests}`,
      `Acomodação: ${selectedType || "(nenhuma)"}`,
      notes.trim() ? `Observações: ${notes}` : null,
      "",
      "(solicitação enviada pela demonstração Nexis)",
    ].filter(Boolean) as string[];

    const url = buildWhatsAppUrl(msg.join("\n"));
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const cls =
    "h-11 w-full rounded-xl border border-white/10 bg-[#04101a]/80 px-3.5 text-sm focus:border-cyan-300/50 focus:outline-none";

  if (sent) {
    return (
      <div className="mt-8 nx-edge-light rounded-2xl bg-nx-surface p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="nx-display mt-5 text-2xl font-medium tracking-tight">Solicitação preparada</p>
        <p className="mt-2 text-sm text-cyan-100/80">
          Abra o WhatsApp para enviar à pousada. Nenhuma reserva foi confirmada automaticamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 nx-edge-light rounded-2xl bg-nx-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={cls} />
        </Field>
        <Field label="Telefone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={cls} />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cls} />
        </Field>
        <Field label="Hóspedes" error={errors.guests}>
          <select value={guests} onChange={(e) => setGuests(e.target.value)} className={cls}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Check-in" error={errors.dates}>
          <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className={cls} />
        </Field>
        <Field label="Check-out">
          <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className={cls} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Tipo de acomodação">
            <select
              value={selectedType}
              onChange={(e) => setType(e.target.value)}
              className={cls}
            >
              {roomNames.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Observações">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chegada tardia, aniversários, necessidades especiais..."
              className={`${cls} min-h-[96px] py-2.5`}
            />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 text-sm font-semibold text-[#04101a] transition hover:bg-cyan-200"
      >
        Solicitar reserva pelo WhatsApp
        <span>→</span>
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="nx-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/60">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
    </label>
  );
}
