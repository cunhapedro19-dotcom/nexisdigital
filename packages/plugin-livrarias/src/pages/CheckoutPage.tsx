"use client";

import { formatCurrency } from "../utils/formatters";
import { CreditCard, Truck, Shield, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface CheckoutPageProps {
  cart: any;
  onSubmit: (data: any) => void;
}

const STEPS = [
  { id: "shipping", label: "Entrega", icon: Truck },
  { id: "payment", label: "Pagamento", icon: CreditCard },
  { id: "review", label: "Revisão", icon: Shield },
];

export default function CheckoutPage({ cart, onSubmit }: CheckoutPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    cpf: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
    shippingMethod: "sedex",
    paymentMethod: "credit_card",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const subtotal = 12490;
  const shipping = 2500;
  const total = subtotal + shipping;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  idx < currentStep
                    ? "bg-[var(--text-success)] text-white"
                    : idx === currentStep
                    ? "bg-[var(--brand-cyan)] text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                )}>
                  {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={clsx(
                    "w-24 h-1 mx-2",
                    idx < currentStep ? "bg-[var(--text-success)]" : "bg-[var(--bg-tertiary)]"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            {STEPS.map(step => (
              <span key={step.id} className="w-24 text-center">{step.label}</span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Shipping */}
              {currentStep === 0 && (
                <div className="space-y-6" role="step" aria-label="Entrega">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Informações de Entrega</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">E-mail *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Telefone *</label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome *</label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Sobrenome *</label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CPF</label>
                    <input
                      id="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={e => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                      className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-4">Endereço de Entrega</h3>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CEP *</label>
                    <input
                      id="zipCode"
                      type="text"
                      required
                      value={formData.address.zipCode}
                      onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
                      className="w-full max-w-xs px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Rua *</label>
                      <input
                        id="street"
                        type="text"
                        required
                        value={formData.address.street}
                        onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Número *</label>
                      <input
                        id="number"
                        type="text"
                        required
                        value={formData.address.number}
                        onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="complement" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Complemento</label>
                    <input
                      id="complement"
                      type="text"
                      value={formData.address.complement}
                      onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, complement: e.target.value } }))}
                      className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      placeholder="Apto, bloco, etc."
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Bairro *</label>
                      <input
                        id="neighborhood"
                        type="text"
                        required
                        value={formData.address.neighborhood}
                        onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, neighborhood: e.target.value } }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cidade *</label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={formData.address.city}
                        onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Estado *</label>
                      <select
                        id="state"
                        required
                        value={formData.address.state}
                        onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                        className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                      >
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

                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-4">Frete</h3>
                  <div className="space-y-2">
                    {[
                      { id: "sedex", name: "Sedex", price: 2500, days: "1-3 dias úteis" },
                      { id: "pac", name: "PAC", price: 1500, days: "3-10 dias úteis" },
                      { id: "pickup", name: "Retirar na loja", price: 0, days: "Disponível em 2h" },
                    ].map(method => (
                      <label key={method.id} className={clsx(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.shippingMethod === method.id
                          ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/5"
                          : "border-[var(--border-default)] hover:border-[var(--brand-cyan)]/50"
                      )}>
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={formData.shippingMethod === method.id}
                          onChange={e => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                          className="w-4 h-4 text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-[var(--text-primary)]">{method.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">{method.days}</p>
                        </div>
                        <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(method.price)}</span>
                      </label>
                    ))}
                  </div>

                  <button type="button" onClick={handleNext} className="btn btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2">
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 1 && (
                <div className="space-y-6" role="step" aria-label="Pagamento">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Pagamento</h2>

                  <div className="space-y-2">
                    {[
                      { id: "credit_card", name: "Cartão de Crédito", icon: CreditCard },
                      { id: "pix", name: "PIX", icon: "💰" },
                      { id: "boleto", name: "Boleto Bancário", icon: "📄" },
                    ].map(method => (
                      <label key={method.id} className={clsx(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.paymentMethod === method.id
                          ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/5"
                          : "border-[var(--border-default)] hover:border-[var(--brand-cyan)]/50"
                      )}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-4 h-4 text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]"
                        />
                        <span className="text-lg">{typeof method.icon === "string" ? method.icon : <method.icon className="w-5 h-5" />}</span>
                        <span className="font-medium text-[var(--text-primary)]">{method.name}</span>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === "credit_card" && (
                    <div className="space-y-4 border-t border-[var(--border-default)] pt-6">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Dados do Cartão</h3>
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Número do Cartão</label>
                        <input
                          id="cardNumber"
                          type="text"
                          value={formData.cardNumber}
                          onChange={e => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nome no Cartão</label>
                          <input
                            id="cardName"
                            type="text"
                            value={formData.cardName}
                            onChange={e => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                            className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                          />
                        </div>
                        <div>
                          <label htmlFor="cardExpiry" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Validade</label>
                          <input
                            id="cardExpiry"
                            type="text"
                            value={formData.cardExpiry}
                            onChange={e => setFormData(prev => ({ ...prev, cardExpiry: e.target.value }))}
                            className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-[var(--text-primary)] mb-1">CVV</label>
                        <input
                          id="cardCvv"
                          type="text"
                          value={formData.cardCvv}
                          onChange={e => setFormData(prev => ({ ...prev, cardCvv: e.target.value }))}
                          className="w-full max-w-xs px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={handleBack} className="btn btn-ghost flex-1 py-3">
                      Voltar
                    </button>
                    <button type="button" onClick={handleNext} className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                      Continuar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 2 && (
                <div className="space-y-6" role="step" aria-label="Revisão">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Revisar Pedido</h2>

                  <div className="card p-4 space-y-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Endereço de Entrega</h3>
                    <address className="text-[var(--text-secondary)] not-italic">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address.street}, {formData.address.number}</p>
                      {formData.address.complement && <p>{formData.address.complement}</p>}
                      <p>{formData.address.neighborhood}, {formData.address.city} - {formData.address.state}</p>
                      <p>CEP: {formData.address.zipCode}</p>
                    </address>
                  </div>

                  <div className="card p-4 space-y-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Pagamento</h3>
                    <p className="text-[var(--text-secondary)]">
                      {formData.paymentMethod === "credit_card" ? "Cartão de Crédito" :
                       formData.paymentMethod === "pix" ? "PIX" : "Boleto Bancário"}
                    </p>
                  </div>

                  <div className="card p-4 space-y-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Itens do Pedido</h3>
                    <p className="text-[var(--text-secondary)]">1x Dom Casmurro - Edição Comentada</p>
                    <p className="text-[var(--text-secondary)]">1x O Senhor dos Anéis: A Sociedade do Anel</p>
                  </div>

                  <div className="card p-4 space-y-2 border-t border-[var(--border-default)] pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Subtotal</span>
                      <span className="font-medium text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Frete</span>
                      <span className="font-medium text-[var(--text-primary)]">{formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--border-default)]">
                      <span className="font-bold text-[var(--text-primary)] text-lg">Total</span>
                      <span className="font-bold text-[var(--brand-cyan)] text-xl">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={handleBack} className="btn btn-ghost flex-1 py-3">
                      Voltar
                    </button>
                    <button type="submit" className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                      Confirmar Pedido
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 card p-6 space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Resumo</h2>

              <div className="space-y-3 border-t border-[var(--border-default)] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Frete</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-default)]">
                  <span className="font-bold text-[var(--text-primary)] text-lg">Total</span>
                  <span className="font-bold text-[var(--brand-cyan)] text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Shield className="w-4 h-4" />
                <span>Compra segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}