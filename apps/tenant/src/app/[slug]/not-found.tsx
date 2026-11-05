import Link from "next/link";

export default function TenantNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-accent)] mb-4">404</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Página não encontrada
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          O endereço que você tentou acessar não existe neste site.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-[var(--semantic-primary-bg)] px-6 py-3 text-sm font-medium text-[var(--semantic-primary-text)] transition-colors hover:bg-[var(--semantic-primary-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
