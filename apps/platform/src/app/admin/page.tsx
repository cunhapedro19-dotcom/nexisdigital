import type { Metadata } from "next";
import { Building2, Users, CreditCard, Puzzle } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Dashboard da plataforma — KPIs gerais.
 * Dados reais chegam quando o Prisma estiver conectado (DATABASE_URL).
 */
export default function AdminDashboardPage() {
  const kpis = [
    { label: "Tenants ativos", value: "—", icon: Building2, hint: "conecte o banco para ver" },
    { label: "Usuários", value: "—", icon: Users, hint: "conecte o banco para ver" },
    { label: "MRR", value: "—", icon: CreditCard, hint: "conecte o Stripe" },
    { label: "Plugins instalados", value: "—", icon: Puzzle, hint: "conecte o banco para ver" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Visão geral da plataforma Nexis Digital.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <kpi.icon className="h-5 w-5 text-[var(--text-accent)]" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{kpi.value}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{kpi.label}</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">{kpi.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
