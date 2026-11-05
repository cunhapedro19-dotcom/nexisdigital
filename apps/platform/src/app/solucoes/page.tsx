import { Metadata } from "next";
import Link from "next/link";
import { DemoArt } from "@nexis/ui/demo-art";

export const metadata: Metadata = {
  title: "Soluções",
  description: "Conheça todas as soluções disponíveis na plataforma Nexis Digital: Pousadas, Livrarias, Cardápio, Catálogo, Site Institucional, Gestão Empresarial e Gestão RH.",
};

const SOLUTIONS = [
  {
    key: "pousadas",
    name: "Pousadas & Hotéis",
    shortDesc: "Sistema completo de reservas e gestão hoteleira",
    fullDesc: "Gerencie quartos, disponibilidade em tempo real, reservas online, check-in/check-out, hóspedes, relatórios de ocupação e receita. Integração com canais (Booking.com, Airbnb) via webhooks.",
    features: [
      "Mapa de disponibilidade visual",
      "Reservas online com pagamento",
      "Check-in/out digital",
      "Gestão de hóspedes e histórico",
      "Relatórios de ocupação e ADR",
      "Integração canais (OTA)",
      "Preços dinâmicos por temporada",
      "Comunicação automática (email/WhatsApp)",
    ],
    icon: "bed",
    variant: "room" as const,
    color: "from-amber-500/20 to-orange-500/20",
    demoRoute: "/pousadas/demo",
    adminRoute: "/admin/pousadas",
  },
  {
    key: "livrarias",
    name: "Livrarias & E-commerce",
    shortDesc: "E-commerce especializado para livrarias",
    fullDesc: "Catálogo com ISBN, categorias hierárquicas, estoque em tempo real, carrinho, checkout com frete, pedidos, clientes, programa de fidelidade e integração com marketplaces.",
    features: [
      "Catálogo com busca por ISBN/autor/título",
      "Categorias e sub-categorias ilimitadas",
      "Controle de estoque com alerta de mínimo",
      "Carrinho e checkout otimizado",
      "Frete por CEP (Correios/transportadoras)",
      "Gestão de pedidos (separação, envio, devolução)",
      "Clientes com histórico e wishlist",
      "Integração Mercado Livre/Amazon",
    ],
    icon: "book",
    variant: "store" as const,
    color: "from-blue-500/20 to-cyan-500/20",
    demoRoute: "/livrarias/demo",
    adminRoute: "/admin/livrarias",
  },
  {
    key: "cardapio",
    name: "Cardápio Digital & Pedidos",
    shortDesc: "QR Code na mesa, pedidos direto na cozinha",
    fullDesc: "Cardápio digital acessado por QR Code na mesa. Pedidos vão direto para tela da cozinha (KDS). Suporte a mesa, retirada e delivery. Gestão de mesas, comandas, fechamento de conta e split de pagamento.",
    features: [
      "QR Code por mesa/sessão",
      "KDS (Kitchen Display System) tempo real",
      "Modos: Mesa, Retirada, Delivery",
      "Gestão de mesas e comandas",
      "Fechamento de conta com split",
      "Cardápio com alérgenos e tags",
      "Promoções por horário (happy hour)",
      "Integração iFood/Rappi (webhook)",
    ],
    icon: "utensils",
    variant: "burger" as const,
    color: "from-red-500/20 to-orange-500/20",
    demoRoute: "/cardapio/demo",
    adminRoute: "/admin/cardapio",
  },
  {
    key: "catalogo",
    name: "Catálogo de Produtos",
    shortDesc: "Vitrine virtual com variantes e SEO",
    fullDesc: "Catálogo público de produtos com variantes (cor, tamanho, etc.), filtros avançados, comparação, SEO otimizado, solicitação de orçamento via WhatsApp/email, integração com ERP para preços e estoque.",
    features: [
      "Produtos com variantes ilimitadas",
      "Filtros dinâmicos (categoria, atributos, preço)",
      "SEO automático (JSON-LD Product)",
      "Solicitação de orçamento (WhatsApp/Email)",
      "Comparação de produtos",
      "Lista de favoritos",
      "Modo B2B (preço sob login)",
      "Integração ERP via API",
    ],
    icon: "package",
    variant: "tee" as const,
    color: "from-green-500/20 to-emerald-500/20",
    demoRoute: "/catalogo/demo",
    adminRoute: "/admin/catalogo",
  },
  {
    key: "site-institucional",
    name: "Site Institucional (CMS)",
    shortDesc: "CMS visual para sites institucionais e blogs",
    fullDesc: "Construtor de páginas visual (blocos: hero, features, gallery, testimonials, cta, contact, rich-text). Blog com categorias, tags, SEO, comentários. Multi-idioma. Formulários com webhook. Publicação agendada.",
    features: [
      "Editor visual de páginas (drag & drop blocks)",
      "Blocos: Hero, Features, Gallery, Depoimentos, CTA, Contato, Rich Text",
      "Blog completo (categorias, tags, autor, SEO)",
      "Multi-idioma (i18n nativo)",
      "Formulários com validação e webhook",
      "SEO técnico (sitemap, robots, JSON-LD)",
      "Publicação agendada e versionamento",
      "Domínio customizado + SSL",
    ],
    icon: "layout",
    variant: "dashboard" as const,
    color: "from-purple-500/20 to-pink-500/20",
    demoRoute: "/site-institucional/demo",
    adminRoute: "/admin/site",
  },
  {
    key: "gestao-empresarial",
    name: "Gestão Empresarial (ERP Lite)",
    shortDesc: "Vendas, NF-e, financeiro, clientes, relatórios",
    fullDesc: "ERP simplificado para PMEs: cadastro de clientes/produtos, pedidos de venda, emissão de NF-e/NFC-e (homologação/produção), contas a receber/pagar, fluxo de caixa, relatórios gerenciais, backup automático.",
    features: [
      "Cadastro de clientes (PF/PJ) e produtos/serviços",
      "Pedidos de venda com aprovação",
      "Emissão NF-e/NFC-e (certificado A1/A3)",
      "Contas a receber/pagar com baixa automática",
      "Fluxo de caixa e DRE simplificado",
      "Relatórios: vendas, inadimplência, curva ABC",
      "Backup automático diário (S3/R2)",
      "API para integração contábil",
    ],
    icon: "briefcase",
    variant: "chart" as const,
    color: "from-indigo-500/20 to-blue-500/20",
    demoRoute: "/gestao-empresarial/demo",
    adminRoute: "/admin/gestao",
  },
  {
    key: "gestao-rh",
    name: "Gestão de RH & Folha",
    shortDesc: "Folha de pagamento, ponto, férias, eSocial",
    fullDesc: "Gestão completa de colaboradores: admissão, ficha cadastral, folha de pagamento (CLT, PJ, estagiário), ponto eletrônico (web/mobile), férias e licenças, benefícios, eSocial, relatórios legais, holerite digital.",
    features: [
      "Cadastro completo (documentos, bancários, dependentes)",
      "Folha: CLT 44h/40h/36h, PJ, estagiário, horistas",
      "Ponto: web, mobile, geolocalização, QR Code",
      "Férias: aquisição, gozo, venda, abono, programação",
      "Licenças: médica, maternidade, paternidade, luto, etc",
      "Benefícios: VR/VA, VT, plano saúde, previdência",
      "eSocial: S-1200, S-2200, S-2300, etc",
      "Holerite digital + assinatura eletrônica",
    ],
    icon: "users",
    variant: "users" as const,
    color: "from-teal-500/20 to-cyan-500/20",
    demoRoute: "/gestao-rh/demo",
    adminRoute: "/admin/rh",
  },
] as const;

export default function SolucoesPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 opacity-5">
          <DemoArt variant="dashboard" className="h-full w-full" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            Nossas <span className="text-[var(--brand-cyan)]">Soluções</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            Cada solução é um plugin independente. Instale apenas o que seu negócio precisa,
            configure para sua marca e comece a usar em minutos.
          </p>
        </div>
      </header>

      {/* Solutions Grid */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS.map((sol) => (
              <SolutionCard key={sol.key} solution={sol} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Comparativo de Capacidades
            </h2>
            <p className="text-[var(--text-secondary)]">
              Todas as soluções compartilham a mesma base: multi-tenant, RBAC, billing, domínios customizados.
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-left text-[var(--text-muted)]">
                  <th className="p-4 font-medium w-48">Recurso</th>
                  {SOLUTIONS.map((sol) => (
                    <th key={sol.key} className="p-4 font-medium text-center">
                      {sol.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-[var(--border-muted)]">
                    <td className="p-4 font-medium text-[var(--text-primary)]">{row.feature}</td>
                    {SOLUTIONS.map((sol) => (
                      <td key={sol.key} className="p-4 text-center">
                        {row.supported[sol.key] ? (
                          <span className="inline-flex items-center justify-center gap-1 text-[var(--text-success)]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Sim
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Não encontrou o que precisa?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Desenvolvemos plugins customizados para seu negócio. Fale com nossa equipe.
          </p>
          <Link href="/contato" className="btn btn-primary px-8 py-3 text-base inline-flex">
            Solicitar Plugin Customizado
          </Link>
        </div>
      </section>
    </main>
  );
}

function SolutionCard({ solution }: { solution: (typeof SOLUTIONS)[number] }) {
  return (
    <article className="card card-interactive group p-6 h-full flex flex-col">
      <div className="relative aspect-video mb-4 overflow-hidden rounded-lg bg-gradient-to-br" style={{ background: solution.color }}>
        <DemoArt variant={solution.variant} className="h-full w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{solution.name}</h3>
        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">{solution.shortDesc}</p>

        <ul className="space-y-2 mb-6 flex-1">
          {solution.features.slice(0, 4).map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--text-success)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {feat}
            </li>
          ))}
        </ul>

        <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
          <Link
            href={solution.demoRoute}
            className="btn btn-ghost flex-1 text-sm py-2"
          >
            Ver Demo
          </Link>
          <Link
            href={solution.adminRoute}
            className="btn btn-primary flex-1 text-sm py-2"
          >
            Admin Demo
          </Link>
        </div>
      </div>
    </article>
  );
}

const COMPARISON_ROWS = [
  { feature: "Multi-tenant (RLS)", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "Domínio customizado + SSL", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "RBAC (Owner/Admin/Staff/Viewer)", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "Billing (Stripe + MP)", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": false, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "Admin unificado", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "Sync real-time (SSE)", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: false, "site-institucional": true, "gestao-empresarial": false, "gestao-rh": false } },
  { feature: "Plugin configurável", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "Webhooks de eventos", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "API REST pública", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
  { feature: "White-label", supported: { pousadas: true, livrarias: true, cardapio: true, catalogo: true, "site-institucional": true, "gestao-empresarial": true, "gestao-rh": true } },
] as const;