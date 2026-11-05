"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Formulário de criação de tenant (onboarding).
 * TODO: quando auth estiver ligada, enviar ownerUserId da sessão.
 */
export default function NovoTenantPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      slug: String(form.get("slug") || "").trim().toLowerCase(),
      name: String(form.get("name") || "").trim(),
      planId: String(form.get("planId") || "").trim(),
      ownerUserId: String(form.get("ownerUserId") || "").trim(),
    };

    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar tenant");
      router.push("/admin/tenants");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]";
  const labelCls = "block text-sm font-medium text-[var(--text-secondary)] mb-1.5";

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Novo tenant</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Crie a conta de um cliente. Ele começa em trial de 14 dias.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className={labelCls}>Nome do negócio</label>
          <input id="name" name="name" required minLength={2} maxLength={120}
            placeholder="Pousada do João" className={inputCls} />
        </div>

        <div>
          <label htmlFor="slug" className={labelCls}>Slug (subdomínio)</label>
          <input id="slug" name="slug" required pattern="[a-z0-9-]+" minLength={2} maxLength={63}
            placeholder="pousada-do-joao" className={`${inputCls} font-mono`} />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Será o endereço: pousada-do-joao.nexisdigital.com.br
          </p>
        </div>

        <div>
          <label htmlFor="planId" className={labelCls}>ID do plano</label>
          <input id="planId" name="planId" required
            placeholder="cuid do plano (veja no banco, tabela Plan)" className={`${inputCls} font-mono`} />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Dica: rode o seed (npm run db:push + seed) para criar os planos starter/professional/enterprise.
          </p>
        </div>

        <div>
          <label htmlFor="ownerUserId" className={labelCls}>ID do usuário owner</label>
          <input id="ownerUserId" name="ownerUserId" required
            placeholder="cuid do usuário (tabela User)" className={`${inputCls} font-mono`} />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-[var(--border-danger)] px-3 py-2 text-sm text-[var(--text-danger)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--semantic-primary-bg)] px-6 py-2.5 text-sm font-medium text-[var(--semantic-primary-text)] transition-colors hover:bg-[var(--semantic-primary-bg-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
        >
          {saving ? "Criando…" : "Criar tenant"}
        </button>
      </form>
    </div>
  );
}
