"use client";

import { CheckCircle, Package, CreditCard, Mail, Truck, Calendar } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface OrderSuccessPageProps {
  orderId: string;
  orderTotal: number;
  estimatedDelivery: Date;
}

export default function OrderSuccessPage({ orderId = "NXS-2024-001234", orderTotal = 14990, estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }: OrderSuccessPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--text-success)]/10 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[var(--text-success)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Pedido Confirmado!</h1>
          <p className="text-[var(--text-secondary)]">Obrigado pela sua compra. Seu pedido foi recebido e está sendo processado.</p>
        </div>

        {/* Order Details */}
        <div className="card p-6 text-left mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--brand-cyan)]" />
            Detalhes do Pedido
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Número do Pedido</span>
              <span className="font-mono font-medium text-[var(--text-primary)]">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className="badge badge-success">Confirmado</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Total</span>
              <span className="font-bold text-[var(--brand-cyan)] text-lg">{formatCurrency(orderTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Pagamento</span>
              <span className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Cartão de Crédito • Aprovado
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Entrega Estimada</span>
              <span className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {estimatedDelivery.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card p-6 text-left mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--brand-cyan)]" />
            O que acontece agora?
          </h2>

          <ol className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--brand-cyan)] text-white flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Confirmação por e-mail</p>
                <p className="text-[var(--text-muted)]">Enviamos os detalhes para seu e-mail cadastrado</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Preparação do pedido</p>
                <p className="text-[var(--text-muted)]">Separamos e embalamos seus livros com cuidado</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Envio e rastreamento</p>
                <p className="text-[var(--text-muted)]">Você receberá o código de rastreio por e-mail e SMS</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Entrega</p>
                <p className="text-[var(--text-muted)]">Seus livros chegam no endereço indicado</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/conta/pedidos" className="btn btn-primary w-full sm:w-auto">
            Ver Meus Pedidos
          </a>
          <a href="/" className="btn btn-outline w-full sm:w-auto">
            Continuar Comprando
          </a>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
          <p>Precisa de ajuda? <a href="#" className="text-[var(--brand-cyan)] hover:underline">Fale conosco</a></p>
          <p className="mt-1">Envie um e-mail para <a href="mailto:contato@livrarianexis.com.br" className="text-[var(--brand-cyan)] hover:underline">contato@livrarianexis.com.br</a></p>
        </div>
      </div>
    </div>
  );
}