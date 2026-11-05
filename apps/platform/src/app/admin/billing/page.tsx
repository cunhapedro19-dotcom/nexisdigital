import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Billing</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Assinaturas, faturas e pagamentos.
      </p>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-[var(--text-secondary)] mb-2 font-medium">Módulo em implementação</p>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Conecte as chaves do Stripe (STRIPE_SECRET_KEY) ou Mercado Pago
          (MERCADOPAGO_ACCESS_TOKEN) no .env.local para ativar. A lógica está em{" "}
          <code className="text-[var(--text-accent)]">@nexis/billing</code>.
        </p>
      </div>
    </div>
  );
}
