"use client";

import { CreditCard, User, Mail, MapPin, Phone, Lock } from "lucide-react";
import { useState } from "react";

interface CheckoutFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function CheckoutForm({ onSubmit, initialData = {} }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    email: initialData.email || "",
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    phone: initialData.phone || "",
    cpf: initialData.cpf || "",
    address: {
      zipCode: initialData.address?.zipCode || "",
      street: initialData.address?.street || "",
      number: initialData.address?.number || "",
      complement: initialData.address?.complement || "",
      neighborhood: initialData.address?.neighborhood || "",
      city: initialData.address?.city || "",
      state: initialData.address?.state || "",
    },
    shippingMethod: "sedex",
    paymentMethod: "credit_card",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <User className="w-5 h-5" /> Dados Pessoais
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">E-mail *</label>
            <input id="email" type="email" required value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Telefone *</label>
            <input id="phone" type="tel" required value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome *</label>
            <input id="firstName" type="text" required value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Sobrenome *</label>
            <input id="lastName" type="text" required value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CPF</label>
          <input id="cpf" type="text" value={formData.cpf} onChange={e => setFormData(prev => ({ ...prev, cpf: e.target.value }))} className="w-full max-w-xs px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" placeholder="000.000.000-00" />
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <MapPin className="w-5 h-5" /> Endereço de Entrega
        </h2>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CEP *</label>
          <input id="zipCode" type="text" required value={formData.address.zipCode} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))} className="w-full max-w-xs px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" placeholder="00000-000" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Rua *</label>
            <input id="street" type="text" required value={formData.address.street} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Número *</label>
            <input id="number" type="text" required value={formData.address.number} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
        </div>
        <div>
          <label htmlFor="complement" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Complemento</label>
          <input id="complement" type="text" value={formData.address.complement} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, complement: e.target.value } }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" placeholder="Apto, bloco, etc." />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Bairro *</label>
            <input id="neighborhood" type="text" required value={formData.address.neighborhood} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, neighborhood: e.target.value } }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cidade *</label>
            <input id="city" type="text" required value={formData.address.city} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Estado *</label>
            <select id="state" required value={formData.address.state} onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]">
              <option value="">Selecione</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="PR">Paraná</option>
              <option value="SC">Santa Catarina</option>
              <option value="BA">Bahia</option>
              <option value="GO">Goiás</option>
              <option value="PE">Pernambuco</option>
              <option value="CE">Ceará</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <CreditCard className="w-5 h-5" /> Pagamento
        </h2>
        <div className="space-y-2">
          {["credit_card", "pix", "boleto"].map(method => (
            <label key={method} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all">
              <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} className="w-4 h-4 text-[var(--brand-cyan)]" />
              <span className="font-medium text-[var(--text-primary)]">{method === "credit_card" ? "Cartão de Crédito" : method === "pix" ? "PIX" : "Boleto Bancário"}</span>
            </label>
          ))}
        </div>

        {formData.paymentMethod === "credit_card" && (
          <div className="border-t border-[var(--border-default)] pt-4 space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Número do Cartão</label>
              <input id="cardNumber" type="text" value={formData.cardNumber} onChange={e => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" placeholder="0000 0000 0000 0000" maxLength={19} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome no Cartão</label>
                <input id="cardName" type="text" value={formData.cardName} onChange={e => setFormData(prev => ({ ...prev, cardName: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" />
              </div>
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Validade</label>
                <input id="cardExpiry" type="text" value={formData.cardExpiry} onChange={e => setFormData(prev => ({ ...prev, cardExpiry: e.target.value }))} className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" placeholder="MM/AA" maxLength={5} />
              </div>
            </div>
            <div>
              <label htmlFor="cardCvv" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CVV</label>
              <input id="cardCvv" type="text" value={formData.cardCvv} onChange={e => setFormData(prev => ({ ...prev, cardCvv: e.target.value }))} className="w-full max-w-xs px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]" placeholder="123" maxLength={4} />
            </div>
          </div>
        )}
      </section>

      <button type="submit" className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2">
        Finalizar Pedido
        <Lock className="w-5 h-5" />
      </button>
    </form>
  );
}