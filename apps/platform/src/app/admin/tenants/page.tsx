import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@nexis/db";

export const metadata: Metadata = { title: "Tenants" };

export const dynamic = "force-dynamic";

/**
 * Lista de tenants com status e plano.
 * Se o banco não estiver conectado, mostra instrução em vez de quebrar.
 */
export default async function TenantsPage() {
  let tenants: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    plan: { name: string } | null;
    createdAt: Date;
  }> = [];
  let dbError: string | null = null;

  try {
    tenants = await prisma.tenant.findMany({
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Banco indisponível";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tenants</h1>
        <Link
          href="/admin/tenants/novo"
          className="rounded-lg bg-[var(--semantic-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--semantic-primary-text)] transition-colors hover:bg-[var(--semantic-primary-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
        >
          Novo tenant
        </Link>
      </div>
      <p className="text-[var(--text-secondary)] mb-8">
        Clientes da plataforma, planos e status.
      </p>

      {dbError ? (
        <div className="rounded-xl border border-[var(--border-warning)] bg-[var(--bg-secondary)] p-6">
          <p className="text-[var(--text-warning)] font-medium mb-2">
            Banco de dados não conectado
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Configure <code className="text-[var(--text-accent)]">DATABASE_URL</code> no .env.local
            e rode <code className="text-[var(--text-accent)]">npm run db:push</code> para ver os dados.
          </p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-10 text-center">
          <p className="text-[var(--text-secondary)]">
            Nenhum tenant criado ainda. Crie o primeiro em “Novo tenant”.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] text-left">
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Nome</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Slug</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Plano</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border-muted)] last:border-0">
                  <td className="px-4 py-3 text-[var(--text-primary)]">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-[var(--text-accent)]">{t.slug}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{t.plan?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-[var(--border-default)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
