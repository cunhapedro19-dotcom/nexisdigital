"use client";

import type { PageBlock } from "../types";
import { renderStars, getInitials } from "../utils/helpers";
import { ArrowRight, Quote } from "lucide-react";

/**
 * Renderizador universal de blocos de página
 */

export function BlockRenderer({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
    case "features":
      return <FeaturesBlock block={block} />;
    case "gallery":
      return <GalleryBlock block={block} />;
    case "testimonials":
      return <TestimonialsBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "contact-form":
      return <ContactFormBlock block={block} />;
    case "stats":
      return <StatsBlock block={block} />;
    default:
      return null;
  }
}

// =========================================================
// Hero
// =========================================================

function HeroBlock({ block }: { block: Extract<PageBlock, { type: "hero" }> }) {
  return (
    <section className="relative bg-gradient-to-br from-[#083344] via-[#155e75] to-[#0e7490] text-white overflow-hidden">
      {block.backgroundImage && (
        <>
          <img
            src={block.backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#083344]/90 via-[#155e75]/80 to-[#0e7490]/70" aria-hidden="true" />
        </>
      )}
      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className={block.align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-2xl"}>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">{block.title}</h1>
          {block.subtitle && <p className="text-lg text-white/85 mb-8">{block.subtitle}</p>}
          {block.ctaText && block.ctaLink && (
            <a
              href={block.ctaLink}
              className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              {block.ctaText}
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// =========================================================
// Texto
// =========================================================

function TextBlock({ block }: { block: Extract<PageBlock, { type: "text" }> }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {block.heading && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-5">{block.heading}</h2>}
      <div className="prose-container max-w-3xl text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
        {block.content}
      </div>
    </section>
  );
}

// =========================================================
// Features (Diferenciais)
// =========================================================

function FeaturesBlock({ block }: { block: Extract<PageBlock, { type: "features" }> }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {block.heading && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">{block.heading}</h2>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {block.items.map((item, i) => (
          <div key={i} className="card p-6 text-center hover:border-[var(--brand-cyan)]/50 transition-all">
            {item.icon && <div className="text-4xl mb-3">{item.icon}</div>}
            <h3 className="font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// =========================================================
// Galeria
// =========================================================

function GalleryBlock({ block }: { block: Extract<PageBlock, { type: "gallery" }> }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {block.heading && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">{block.heading}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {block.images.map((img, i) => (
          <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)]">
            <img src={img} alt={`${block.heading || "Galeria"} — imagem ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
}

// =========================================================
// Depoimentos
// =========================================================

function TestimonialsBlock({ block }: { block: Extract<PageBlock, { type: "testimonials" }> }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {block.heading && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">{block.heading}</h2>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {block.items.map((item, i) => (
          <figure key={i} className="card p-6 flex flex-col">
            <Quote className="w-8 h-8 text-[var(--brand-cyan)]/30 mb-3" aria-hidden="true" />
            <blockquote className="text-sm text-[var(--text-secondary)] italic flex-1 mb-4">
              "{item.text}"
            </blockquote>
            <figcaption className="flex items-center gap-3 pt-3 border-t border-[var(--border-muted)]">
              {item.avatar ? (
                <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] flex items-center justify-center font-bold text-sm">
                  {getInitials(item.name)}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {[item.role, item.company].filter(Boolean).join(" • ")}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// =========================================================
// CTA
// =========================================================

function CtaBlock({ block }: { block: Extract<PageBlock, { type: "cta" }> }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-[#155e75] to-[#0e7490] rounded-2xl p-8 sm:p-12 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{block.title}</h2>
        {block.description && <p className="text-white/80 mb-6 max-w-xl mx-auto">{block.description}</p>}
        <a href={block.buttonLink} className="btn bg-white text-[#155e75] hover:bg-white/90 font-semibold px-6 py-3 inline-flex items-center gap-2">
          {block.buttonText}
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}

// =========================================================
// Formulário de contato
// =========================================================

function ContactFormBlock({ block }: { block: Extract<PageBlock, { type: "contact-form" }> }) {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Em produção: POST /api/tenants/:tenantId/contact
      await new Promise(r => setTimeout(r, 500));
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Mensagem enviada!</h2>
          <p className="text-[var(--text-secondary)]">Responderemos no seu email em breve.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      {block.heading && <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 text-center">{block.heading}</h2>}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {block.fields.includes("name") && (
          <div>
            <label htmlFor="cf-name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome *</label>
            <input id="cf-name" name="name" required className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="Seu nome" />
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {block.fields.includes("email") && (
            <div>
              <label htmlFor="cf-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email *</label>
              <input id="cf-email" name="email" type="email" required className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="voce@email.com" />
            </div>
          )}
          {block.fields.includes("phone") && (
            <div>
              <label htmlFor="cf-phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Telefone</label>
              <input id="cf-phone" name="phone" type="tel" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="(11) 99999-9999" />
            </div>
          )}
        </div>
        {block.fields.includes("subject") && (
          <div>
            <label htmlFor="cf-subject" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Assunto</label>
            <input id="cf-subject" name="subject" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="Como podemos ajudar?" />
          </div>
        )}
        {block.fields.includes("message") && (
          <div>
            <label htmlFor="cf-message" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Mensagem *</label>
            <textarea id="cf-message" name="message" required rows={4} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none resize-none" placeholder="Escreva sua mensagem..." />
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
          {isSubmitting ? "Enviando..." : "Enviar mensagem"}
        </button>
      </form>
    </section>
  );
}

// =========================================================
// Estatísticas
// =========================================================

function StatsBlock({ block }: { block: Extract<PageBlock, { type: "stats" }> }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {block.items.map((item, i) => (
          <div key={i} className="card p-6 text-center">
            <p className="text-3xl font-bold text-[var(--brand-cyan)] mb-1">{item.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
