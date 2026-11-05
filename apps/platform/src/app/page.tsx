import { Metadata } from "next";
import Link from "next/link";
import { DemoArt } from "@nexis/ui/demo-art";

export const metadata: Metadata = {
  title: "Plataforma Multi-Tenant para Negócios",
  description: "Nexis Digital - Soluções completas para pousadas, livrarias, restaurantes, catálogos, sites institucionais, ERP e RH. White-label, billing integrado, multi-tenant.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <DemoArt variant="dashboard" className="opacity-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-cyan)]/10 border border-[var(--brand-cyan)]/20 text-[var(--brand-cyan)] text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-cyan)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-cyan)]"></span>
              </span>
              Plataforma em desenvolvimento • Beta privado
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
              Plataforma Multi-Tenant
              <br />
              <span className="text-[var(--brand-cyan)]">para seu negócio</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Gerencie pousadas, livrarias, restaurantes, catálogos, sites institucionais, ERP e RH
              em uma única plataforma. White-label, billing integrado, domínios customizados.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/auth/signin"
                className="btn btn-primary px-8 py-3 text-base w-full sm:w-auto"
              >
                Acessar Dashboard
              </Link>
              <Link
                href="/solucoes"
                className="btn btn-secondary px-8 py-3 text-base w-full sm:w-auto"
              >
                Ver Soluções
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-[var(--text-muted)] text-sm">
              <span>🔒 Seguro</span>
              <span>⚡ Rápido</span>
              <span>🇧🇷 Brasileiro</span>
              <span>📱 Responsivo</span>
            </div>
          </div>
        </div>

        {/* Decorative bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </section>

      {/* Solutions Grid */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Soluções para cada negócio
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Cada solução é um plugin instalável. Ative apenas o que precisa, configure para seu tenant.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOLUTIONS.map((sol) => (
              <SolutionCard key={sol.key} solution={sol} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Por que Nexis Digital?
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Arquitetura moderna pensada para escalar com seu negócio.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feat) => (
              <FeatureCard key={feat.title} feature={feat} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto text-center">
          <DemoArt variant="chart" className="w-32 h-32 mx-auto opacity-10 mb-8" />
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Pronto para começar?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Entre na lista de espera para acesso antecipado à plataforma.
          </p>
          <Link
            href="/auth/signin"
            className="btn btn-primary px-8 py-3 text-base inline-flex"
          >
            Solicitar Acesso
          </Link>
        </div>
      </section>
    </main>
  );
}

const SOLUTIONS = [
  {
    key: "pousadas",
    name: "Pousadas & Hotéis",
    description: "Reservas, disponibilidade, check-in/out, gestão de quartos e hóspedes",
    icon: "bed",
    variant: "room" as const,
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    key: "livrarias",
    name: "Livrarias",
    description: "Catálogo, estoque, carrinho, checkout, pedidos e gestão de clientes",
    icon: "book",
    variant: "store" as const,
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    key: "cardapio",
    name: "Cardápio Digital",
    description: "QR Code na mesa, pedidos na cozinha, delivery, gestão de mesas",
    icon: "utensils",
    variant: "burger" as const,
    color: "from-red-500/20 to-orange-500/20",
  },
  {
    key: "catalogo",
    name: "Catálogo de Produtos",
    description: "Vitrine virtual, variantes, SEO, orçamentos, WhatsApp integration",
    icon: "package",
    variant: "tee" as const,
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    key: "site-institucional",
    name: "Site Institucional",
    description: "CMS visual, páginas, blog, SEO, formulários, multi-idioma",
    icon: "layout",
    variant: "dashboard" as const,
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    key: "gestao-empresarial",
    name: "Gestão Empresarial",
    description: "Vendas, NF-e, financeiro, clientes, relatórios, backup automático",
    icon: "briefcase",
    variant: "chart" as const,
    color: "from-indigo-500/20 to-blue-500/20",
  },
  {
    key: "gestao-rh",
    name: "Gestão de RH",
    description: "Folha, ponto, férias, benefícios, eSocial, colaboradores",
    icon: "users",
    variant: "users" as const,
    color: "from-teal-500/20 to-cyan-500/20",
  },
] as const;

function SolutionCard({ solution }: { solution: (typeof SOLUTIONS)[number] }) {
  return (
    <Link
      href={`/solucoes/${solution.key}`}
      className="card card-interactive group p-6 h-full flex flex-col"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gradient-to-br" style={{ background: solution.color }}>
        <DemoArt variant={solution.variant} className="opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{solution.name}</h3>
      <p className="text-[var(--text-secondary)] text-sm flex-1 mb-4">{solution.description}</p>
      <span className="text-[var(--brand-cyan)] text-sm font-medium group-hover:underline">
        Ver detalhes →
      </span>
    </Link>
  );
}

const FEATURES = [
  {
    title: "Multi-Tenant Nativo",
    description: "Um banco, múltiplos tenants isolados via RLS. Cada cliente tem seus dados, configurações e domínio.",
    icon: "users",
  },
  {
    title: "Plugin Architecture",
    description: "Cada solução é um plugin independente. Instale, configure e atualize sem afetar outros tenants.",
    icon: "puzzle",
  },
  {
    title: "Billing Integrado",
    description: "Stripe + Mercado Pago. Assinaturas, pagamentos avulsos, portal do cliente, webhooks automáticos.",
    icon: "credit-card",
  },
  {
    title: "Admin Unificado",
    description: "Painel único para gerenciar todos os plugins do tenant. RBAC: Owner, Admin, Staff, Viewer.",
    icon: "layout-dashboard",
  },
  {
    title: "Domínios Customizados",
    description: "Cada tenant usa seu próprio domínio. SSL automático, verificação DNS, white-label completo.",
    icon: "globe",
  },
  {
    title: "Real-time Sync",
    description: "SSE para sincronização admin ↔ site público. Mudanças aparecem instantaneamente sem refresh.",
    icon: "zap",
  },
] as const;

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center text-[var(--brand-cyan)] mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          {feature.icon === "users" && (
            <>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
          )}
          {feature.icon === "puzzle" && (
            <>
              <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 18H6a2 2 0 0 1-2-2v-4" />
            </>
          )}
          {feature.icon === "credit-card" && (
            <>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </>
          )}
          {feature.icon === "layout-dashboard" && (
            <>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
          )}
          {feature.icon === "globe" && (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </>
          )}
          {feature.icon === "zap" && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />}
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
      <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
    </div>
  );
}