"use client";

import Link from "next/link";
import { Bed, BookOpen, UtensilsCrossed, LayoutGrid, Building2, Users, Globe } from "lucide-react";

/**
 * Home genérica do tenant — hub de navegação para os plugins ativos.
 * Substituída pelo CMS (plugin site-institucional) quando instalado.
 */

const PLUGIN_META: Record<
  string,
  { label: string; description: string; href: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pousadas: {
    label: "Acomodações",
    description: "Conheça nossos quartos e faça sua reserva online.",
    href: "/pousadas",
    icon: Bed,
  },
  livrarias: {
    label: "Loja",
    description: "Nosso catálogo completo, com entrega em toda região.",
    href: "/livraria",
    icon: BookOpen,
  },
  cardapio: {
    label: "Cardápio",
    description: "Peça pelo cardápio digital direto da sua mesa.",
    href: "/cardapio",
    icon: UtensilsCrossed,
  },
  catalogo: {
    label: "Catálogo",
    description: "Solicite um orçamento pelos nossos produtos.",
    href: "/catalogo",
    icon: LayoutGrid,
  },
  "site-institucional": {
    label: "Sobre nós",
    description: "Nossa história, serviços e formas de contato.",
    href: "/institucional",
    icon: Globe,
  },
  "gestao-empresarial": {
    label: "Área do cliente",
    description: "Acompanhe pedidos e financeiro (acesso restrito).",
    href: "/gestao",
    icon: Building2,
  },
  "gestao-rh": {
    label: "Portal do colaborador",
    description: "Ponto, holerite e férias (acesso restrito).",
    href: "/rh",
    icon: Users,
  },
};

export function TenantHome({
  tenant,
  plugins,
}: {
  tenant: { slug: string; name: string; primaryColor: string; secondaryColor: string };
  plugins: string[];
}) {
  const active = plugins.map((key) => PLUGIN_META[key]).filter(Boolean);
  const hasPublicSite = plugins.includes("site-institucional");

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-[var(--text-primary)]">
              {tenant.name}
            </Link>
            <nav className="flex items-center gap-6" aria-label="Navegação principal">
              {active.slice(0, 4).map((p) => (
                <Link
                  key={p.href}
                  href={`/${tenant.slug}${p.href}`}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p
            className="text-sm font-medium mb-4"
            style={{ color: tenant.primaryColor }}
          >
            Bem-vindo
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            {tenant.name}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Tudo o que você precisa em um só lugar — escolha uma das áreas abaixo para começar.
          </p>
        </div>
      </section>

      {/* Plugins ativos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {active.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)]">
              Nenhum módulo ativado ainda. Instale plugins no painel admin para vê-los aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  href={`/${tenant.slug}${p.href}`}
                  className="group block rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-8 transition-all hover:border-[var(--border-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
                >
                  <Icon className="h-8 w-8 mb-4 text-[var(--text-accent)]" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {p.label}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {p.description}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Feito com{" "}
            <a
              href="https://nexisdigital.com.br"
              className="hover:text-[var(--text-accent)] transition-colors"
              rel="noopener noreferrer"
            >
              Nexis Digital
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
