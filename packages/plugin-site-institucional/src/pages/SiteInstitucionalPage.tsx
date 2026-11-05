"use client";

import { useState, useMemo } from "react";
import type { SitePage, Service, TeamMember, BlogPost, SiteSettings, ContactMessage } from "../types";
import { BlockRenderer } from "../components/PageBlocks";
import { formatDate, getReadingTime, renderStars } from "../utils/helpers";
import { Menu, X, Phone, Mail, MapPin, Clock, Linkedin, Calendar } from "lucide-react";
import { clsx } from "clsx";

// =========================================================
// Mock Data
// =========================================================

const MOCK_SETTINGS: SiteSettings = {
  companyName: "Nexis Contabilidade",
  tagline: "Sua contabilidade em dia, sua empresa no rumo certo",
  primaryColor: "#06b6d4",
  contactEmail: "contato@nexiscontabil.com.br",
  contactPhone: "(11) 3555-4433",
  whatsapp: "551135554433",
  address: "Rua dos Contadores, 89 — Sala 12",
  city: "São Paulo",
  state: "SP",
  socialLinks: { instagram: "https://instagram.com/nexiscontabil", linkedin: "https://linkedin.com/company/nexiscontabil" },
  seoTitle: "Nexis Contabilidade — Contabilidade para MEI, ME e LTDA",
  seoDescription: "Contabilidade digital completa para pequenas e médias empresas. Abertura de CNPJ, folha de pagamento, impostos e consultoria.",
  seoKeywords: ["contabilidade", "CNPJ", "MEI", "impostos"],
  enableBlog: true,
  enableTeam: true,
  footerText: "CRC-SP 2SP123456 • Desde 2009",
};

const MOCK_SERVICES: Service[] = [
  {
    id: "s1", tenantId: "demo",
    title: "Contabilidade Mensal",
    description: "Escrituração completa, balanços, DRE e envio de todas as obrigações fiscais. Atendimento por WhatsApp com contador dedicado.",
    icon: "📊", isFeatured: true, sortOrder: 1,
    price: 39900, priceNote: "a partir de / mês",
  },
  {
    id: "s2", tenantId: "demo",
    title: "Abertura de CNPJ",
    description: "Cuidamos de todo o processo: viabilidade, registro na Junta Comercial, inscrições municipal e estadual, alvará e certificado digital.",
    icon: "🏢", isFeatured: true, sortOrder: 2,
    price: 89900, priceNote: "taxa única",
  },
  {
    id: "s3", tenantId: "demo",
    title: "Folha de Pagamento",
    description: "Processamento de folha, admissões e demissões, férias, 13º, holerites digitais e envio do eSocial e DCTFWeb.",
    icon: "👥", isFeatured: false, sortOrder: 3,
    price: 1990, priceNote: "por funcionário / mês",
  },
  {
    id: "s4", tenantId: "demo",
    title: "Imposto de Renda PJ",
    description: "Declaração anual, planejamento tributário legal e acompanhamento de malhas finas.",
    icon: "📝", isFeatured: false, sortOrder: 4,
    price: 59900, priceNote: "a partir de / ano",
  },
  {
    id: "s5", tenantId: "demo",
    title: "Certificado Digital e-CNPJ",
    description: "Emissão e renovação de certificado digital A1 com validade de 1 ano, com suporte na instalação.",
    icon: "🔐", isFeatured: false, sortOrder: 5,
    price: 19900, priceNote: "/ ano",
  },
  {
    id: "s6", tenantId: "demo",
    title: "Consultoria Tributária",
    description: "Análise do regime tributário mais vantajoso para o seu negócio e projeção de economia anual.",
    icon: "💡", isFeatured: false, sortOrder: 6,
  },
];

const MOCK_TEAM: TeamMember[] = [
  {
    id: "t1", tenantId: "demo",
    name: "Ricardo Mendes", role: "Sócio-Contador",
    bio: "CRC-SP há 18 anos, especialista em Simples Nacional e Lucro Presumido.",
    email: "ricardo@nexiscontabil.com.br",
    linkedin: "https://linkedin.com/in/ricardomendes",
    sortOrder: 1,
  },
  {
    id: "t2", tenantId: "demo",
    name: "Fernanda Costa", role: "Departamento Fiscal",
    bio: "Especialista em obrigações acessórias e certificações SPED.",
    sortOrder: 2,
  },
  {
    id: "t3", tenantId: "demo",
    name: "Bruno Tanaka", role: "Departamento Pessoal",
    bio: "Mais de 10 anos cuidando de folha de pagamento e eSocial.",
    sortOrder: 3,
  },
];

const MOCK_POSTS: BlogPost[] = [
  {
    id: "bp1", tenantId: "demo",
    title: "Simples Nacional 2026: o que muda nos limites de faturamento",
    slug: "simples-nacional-2026-limites",
    excerpt: "Novos limites de faturamento e alíquotas entram em vigor em janeiro. Entenda o que muda para a sua empresa.",
    content: "O Simples Nacional terá atualização importante nos limites de faturamento em 2026.\n\nAs empresas enquadradas no regime deverão se atentar ao novo teto de R$ 5,2 milhões anuais e às alíquotas nominais revisadas.\n\nO que isso significa na prática? Dependendo do seu Anexo e faixa de receita, a carga tributária pode variar até 3 pontos percentuais. Empresas próximas ao limite devem avaliar o planejamento de receitas nos últimos meses do ano.\n\nRecomendamos que todos os clientes agendem uma revisão do enquadramento até dezembro. Nossa equipe está à disposição para simular os cenários.",
    author: "Ricardo Mendes",
    tags: ["simples nacional", "impostos", "2026"],
    isPublished: true,
    publishedAt: new Date("2026-10-15"),
    createdAt: new Date("2026-10-14"),
    updatedAt: new Date("2026-10-15"),
  },
  {
    id: "bp2", tenantId: "demo",
    title: "MEI: 5 erros que podem causar o desenquadramento",
    slug: "mei-erros-desenquadramento",
    excerpt: "Faturamento acima do limite, contratação fora da regra e mais: veja os erros mais comuns que tiram o MEI do regime.",
    content: "Ser MEI traz benefícios enormes, mas alguns descuidos podem custar o enquadramento.\n\n1. Faturar acima de R$ 81 mil por ano\n2. Contratar mais de um funcionário\n3. Exercer atividade não permitida na lista do MEI\n4. Não pagar o DAS mensal\n5. Abrir filial ou participação em outra empresa\n\nSe você identificou qualquer um desses sinais, procure seu contador antes que a Receita encontre. O desenquadramento retroativo gera impostos retroativos com multa.\n\nA boa notícia: na maioria dos casos, a migração para ME ou EPP é tranquila e pode até ser vantajosa.",
    author: "Fernanda Costa",
    tags: ["MEI", "desenquadramento"],
    isPublished: true,
    publishedAt: new Date("2026-09-20"),
    createdAt: new Date("2026-09-19"),
    updatedAt: new Date("2026-09-20"),
  },
];

const MOCK_TESTIMONIALS = [
  { id: "tm1", tenantId: "demo", name: "Patrícia Gomes", role: "Proprietária", company: "Studio Pilates Vida", text: "Trocamos de contador 3 vezes antes de chegar na Nexis. Nunca mais tivemos problema com imposto atrasado e o atendimento no WhatsApp é imediato.", rating: 5, isPublished: true, createdAt: new Date("2026-08-10") },
  { id: "tm2", tenantId: "demo", name: "Diego Martins", role: "CEO", company: "Martins Tech LTDA", text: "A consultoria tributária economizou R$ 14 mil por ano na minha empresa. Só isso já paga o serviço várias vezes.", rating: 5, isPublished: true, createdAt: new Date("2026-07-22") },
  { id: "tm3", tenantId: "demo", name: "Cláudia e Roberto", role: "Sócios", company: "CR Distribuição ME", text: "Ajudaram na abertura do CNPJ do zero em 8 dias. Tudo digital, sem dor de cabeça.", rating: 4, isPublished: true, createdAt: new Date("2026-06-30") },
];

// Página Home (blocos)
const MOCK_HOME_PAGE: SitePage = {
  id: "home",
  tenantId: "demo",
  title: "Home",
  slug: "/",
  isPublished: true,
  showInMenu: false,
  menuOrder: 0,
  metaDescription: MOCK_SETTINGS.seoDescription,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  blocks: [
    {
      type: "hero",
      title: "Contabilidade digital para quem não tem tempo a perder",
      subtitle: "Cuidamos de impostos, folha e obrigações enquanto você cuida do seu negócio. Atendimento humano por WhatsApp, sem robô.",
      ctaText: "Fale com um contador",
      ctaLink: "#contato",
      align: "center",
    },
    {
      type: "stats",
      items: [
        { value: "+500", label: "empresas atendidas" },
        { value: "15 anos", label: "de mercado" },
        { value: "98%", label: "clientes renovam" },
        { value: "24h", label: "tempo de resposta" },
      ],
    },
    {
      type: "features",
      heading: "Por que escolher a Nexis?",
      items: [
        { icon: "💬", title: "Atendimento direto", description: "Você fala com o contador, não com central de atendimento. Resposta em até 24h úteis." },
        { icon: "📲", title: "100% digital", description: "Documentos enviados por app ou email. Só visite o escritório se quiser tomar um café." },
        { icon: "🛡️", title: "Zero surpresas", description: "Avisamos de impostos e prazos com antecedência. Nada de multa por esquecimento." },
      ],
    },
    {
      type: "testimonials",
      heading: "O que dizem nossos clientes",
      items: MOCK_TESTIMONIALS.map(t => ({ name: t.name, role: t.role, company: t.company, text: t.text })),
    },
    {
      type: "cta",
      title: "Pronto para tirar a contabilidade da sua lista de preocupações?",
      description: "Solicite uma proposta personalizada — respondemos no mesmo dia útil.",
      buttonText: "Solicitar proposta",
      buttonLink: "#contato",
    },
  ],
};

const MENU_ITEMS = [
  { id: "servicos", label: "Serviços" },
  { id: "sobre", label: "Sobre Nós" },
  { id: "blog", label: "Blog" },
  { id: "contato", label: "Contato" },
];

// =========================================================
// Página pública
// =========================================================

export default function SiteInstitucionalPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a href="#" onClick={e => { e.preventDefault(); scrollTo("home"); }} className="flex items-center gap-2.5">
              <span className="text-2xl">💼</span>
              <span className="font-bold text-[var(--text-primary)]">{MOCK_SETTINGS.companyName}</span>
            </a>

            <nav className="hidden md:flex items-center gap-1" aria-label="Menu principal">
              {MENU_ITEMS.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={e => { e.preventDefault(); scrollTo(item.id); }}
                  className={clsx(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "text-[var(--brand-cyan)] bg-[var(--brand-cyan)]/10"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {item.label}
                </a>
              ))}
              <a href={`tel:${MOCK_SETTINGS.contactPhone}`} className="btn btn-primary ml-2 text-sm">
                <Phone className="w-4 h-4 mr-1" />
                {MOCK_SETTINGS.contactPhone}
              </a>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn btn-ghost p-2 md:hidden" aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[var(--border-default)] px-4 py-3 space-y-1" aria-label="Menu mobile">
            {MENU_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={e => { e.preventDefault(); scrollTo(item.id); }}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* ============ Home (blocos renderizados) ============ */}
      <main id="home">
        {MOCK_HOME_PAGE.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </main>

      {/* ============ Serviços ============ */}
      <section id="servicos" className="border-t border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 text-center">Nossos Serviços</h2>
          <p className="text-[var(--text-secondary)] text-center mb-10 max-w-xl mx-auto">
            Planos que crescem junto com sua empresa — sem letra miúda.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_SERVICES.map(service => (
              <article key={service.id} className={clsx("card p-6 flex flex-col", service.isFeatured && "border-[var(--brand-cyan)]/50")}>
                {service.icon && <div className="text-3xl mb-3">{service.icon}</div>}
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{service.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] flex-1">{service.description}</p>
                <div className="mt-4 pt-4 border-t border-[var(--border-muted)]">
                  {service.price != null ? (
                    <p className="text-lg font-bold text-[var(--brand-cyan)]">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price / 100)}
                      <span className="text-xs font-normal text-[var(--text-muted)] ml-1">{service.priceNote}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">Sob consulta</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Sobre / Equipe ============ */}
      {MOCK_SETTINGS.enableTeam && (
        <section id="sobre" className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 text-center">Quem vai cuidar da sua empresa</h2>
            <p className="text-[var(--text-secondary)] text-center mb-10 max-w-xl mx-auto">
              Conheça a equipe que responde seus emails e atende no WhatsApp.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {MOCK_TEAM.map(member => (
                <article key={member.id} className="card p-6 text-center">
                  <span className="w-20 h-20 mx-auto rounded-full bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] flex items-center justify-center text-2xl font-bold mb-4">
                    {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </span>
                  <h3 className="font-bold text-[var(--text-primary)]">{member.name}</h3>
                  <p className="text-sm text-[var(--brand-cyan)] mb-2">{member.role}</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{member.bio}</p>
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex text-[var(--text-muted)] hover:text-[var(--brand-cyan)]" aria-label={`LinkedIn de ${member.name}`}>
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ Blog ============ */}
      {MOCK_SETTINGS.enableBlog && (
        <section id="blog" className="border-t border-[var(--border-default)]">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 text-center">Blog</h2>
            <p className="text-[var(--text-secondary)] text-center mb-10">Notícias e dicas para o seu negócio</p>
            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {MOCK_POSTS.map(post => (
                <article key={post.id} className="card p-6 hover:border-[var(--brand-cyan)]/50 transition-all">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(post.publishedAt!)}
                    <span>• {getReadingTime(post.content)} min de leitura</span>
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">{post.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span key={tag} className="badge badge-outline text-xs">#{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ Contato ============ */}
      <section id="contato" className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3 text-center">Fale Conosco</h2>
          <p className="text-[var(--text-secondary)] text-center mb-10">Tire suas dúvidas — respondemos em até 24h úteis</p>

          <div className="grid lg:grid-cols-5 gap-8 max-w-4xl mx-auto">
            {/* Dados de contato */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-5 flex items-start gap-3">
                <Mail className="w-5 h-5 text-[var(--brand-cyan)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Email</p>
                  <p className="text-sm text-[var(--text-secondary)]">{MOCK_SETTINGS.contactEmail}</p>
                </div>
              </div>
              <div className="card p-5 flex items-start gap-3">
                <Phone className="w-5 h-5 text-[var(--brand-cyan)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Telefone / WhatsApp</p>
                  <p className="text-sm text-[var(--text-secondary)]">{MOCK_SETTINGS.contactPhone}</p>
                </div>
              </div>
              <div className="card p-5 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--brand-cyan)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Endereço</p>
                  <p className="text-sm text-[var(--text-secondary)]">{MOCK_SETTINGS.address}</p>
                  <p className="text-sm text-[var(--text-muted)]">{MOCK_SETTINGS.city}/{MOCK_SETTINGS.state}</p>
                </div>
              </div>
              <div className="card p-5 flex items-start gap-3">
                <Clock className="w-5 h-5 text-[var(--brand-cyan)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Horário</p>
                  <p className="text-sm text-[var(--text-secondary)]">Seg–Sex, 9h às 18h</p>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="lg:col-span-3">
              <ContactSection />
            </div>
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-[var(--border-default)] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
            <p>© 2026 {MOCK_SETTINGS.companyName} • {MOCK_SETTINGS.footerText}</p>
            <div className="flex gap-4">
              {Object.entries(MOCK_SETTINGS.socialLinks).map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--brand-cyan)] capitalize">
                  {name}
                </a>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">Powered by Nexis Digital</p>
        </div>
      </footer>
    </div>
  );
}

// =========================================================
// Formulário de contato (seção dedicada)
// =========================================================

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="card p-8 text-center h-full flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Mensagem enviada!</h3>
        <p className="text-[var(--text-secondary)]">Respondemos no seu email em até 24h úteis.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ct-name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome *</label>
          <input id="ct-name" name="name" required className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="Seu nome" />
        </div>
        <div>
          <label htmlFor="ct-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email *</label>
          <input id="ct-email" name="email" type="email" required className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none" placeholder="voce@email.com" />
        </div>
      </div>
      <div>
        <label htmlFor="ct-subject" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Assunto</label>
        <select id="ct-subject" name="subject" className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none">
          <option>Quero trocar de contador</option>
          <option>Quero abrir um CNPJ</option>
          <option>Dúvida sobre impostos</option>
          <option>Folha de pagamento</option>
          <option>Outro assunto</option>
        </select>
      </div>
      <div>
        <label htmlFor="ct-message" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Mensagem *</label>
        <textarea id="ct-message" name="message" required rows={5} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none resize-none" placeholder="Conte um pouco sobre a sua empresa e o que você precisa..." />
      </div>
      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
        {isSubmitting ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
