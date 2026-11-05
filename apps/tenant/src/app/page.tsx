import Link from "next/link";

/**
 * Raiz do tenant app — sem tenant resolvido.
 * Com middleware em produção, domínios custom caem aqui e são reescritos.
 */
export default function RootPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-accent)] mb-4">Nexis Digital</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Bem-vindo à sua plataforma
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          Este endereço hospeda os sites dos clientes Nexis. Acesse pela URL do seu
          site (ex.: <code className="text-[var(--text-accent)]">/meu-negocio</code>) ou pelo seu
          domínio próprio.
        </p>
        <Link
          href="https://nexisdigital.com.br"
          className="inline-flex items-center rounded-lg bg-[var(--semantic-primary-bg)] px-6 py-3 text-sm font-medium text-[var(--semantic-primary-text)] transition-colors hover:bg-[var(--semantic-primary-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
        >
          Conhecer a Nexis
        </Link>
      </div>
    </main>
  );
}
