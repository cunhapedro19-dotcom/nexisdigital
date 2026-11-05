"use client";

import { useState, useCallback } from "react";
import { Mail, Phone, User, Calendar, Users, CreditCard, Shield, Loader2 } from "lucide-react";
import { DateRangePicker } from "./AvailabilityCalendar";
import type { Guest, BookingCreateInput } from "../types";

interface BookingFormProps {
  initialData?: Partial<Guest>;
  onSubmit: (data: BookingCreateInput) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
}

export function BookingForm({
  initialData = {},
  onSubmit,
  onCancel,
  disabled = false,
  className = "",
}: BookingFormProps) {
  const [formData, setFormData] = useState<Partial<Guest>>({
    fullName: "",
    email: "",
    phone: "",
    document: "",
    nationality: "",
    birthDate: "",
    notes: "",
    marketingConsent: false,
    ...initialData,
  });
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Guest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateField = useCallback((name: keyof Guest, value: string) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Nome completo é obrigatório";
        if (value.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
        break;
      case "email":
        if (!value.trim()) return "Email é obrigatório";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
        break;
      case "phone":
        if (!value.trim()) return "Telefone é obrigatório";
        if (value.replace(/\D/g, "").length < 10) return "Telefone inválido";
        break;
      case "document":
        // Opcional, mas se preenchido validar CPF simples
        if (value && value.replace(/\D/g, "").length !== 11) return "CPF inválido";
        break;
    }
    return null;
  }, []);

  const handleChange = useCallback((name: keyof Guest, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleBlur = useCallback((name: keyof Guest) => {
    const error = validateField(name, formData[name] || "");
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [formData, validateField]);

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof Guest, string>> = {};
    let hasError = false;

    (["fullName", "email", "phone"] as const).forEach(field => {
      const error = validateField(field, formData[field] || "");
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    if (!checkIn) {
      newErrors.checkIn = "Data de check-in é obrigatória";
      hasError = true;
    }
    if (!checkOut) {
      newErrors.checkOut = "Data de check-out é obrigatória";
      hasError = true;
    }
    if (checkIn && checkOut && checkIn >= checkOut) {
      newErrors.checkOut = "Check-out deve ser posterior ao check-in";
      hasError = true;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return !hasError;
  }, [formData, checkIn, checkOut, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const bookingData: BookingCreateInput = {
        roomId: "", // Será preenchido pelo componente pai
        guest: {
          fullName: formData.fullName!,
          email: formData.email!,
          phone: formData.phone!,
          document: formData.document || undefined,
          nationality: formData.nationality || undefined,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
          notes: formData.notes || undefined,
          marketingConsent: formData.marketingConsent,
        },
        checkIn,
        checkOut,
        adults,
        children,
        specialRequests,
        source: "DIRECT",
      };

      await onSubmit(bookingData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao processar reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${className} space-y-6`} noValidate>
      {/* Datas e hóspedes */}
      <fieldset className="space-y-4">
        <legend className="font-medium text-[var(--text-primary)]">Datas e hóspedes</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(ci, co) => { setCheckIn(ci || ""); setCheckOut(co || ""); }}
            minDate={new Date()}
            placeholder="Check-in - Check-out"
            disabled={disabled}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="adults" className="label">Adultos</label>
              <select
                id="adults"
                value={adults}
                onChange={e => setAdults(Number(e.target.value))}
                disabled={disabled}
                className="input"
                aria-describedby="adults-help"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <p id="adults-help" className="text-xs text-[var(--text-muted)]">Maiores de 12 anos</p>
            </div>

            <div>
              <label htmlFor="children" className="label">Crianças</label>
              <select
                id="children"
                value={children}
                onChange={e => setChildren(Number(e.target.value))}
                disabled={disabled}
                className="input"
                aria-describedby="children-help"
              >
                {[...Array(6)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <p id="children-help" className="text-xs text-[var(--text-muted)]">Até 12 anos</p>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Dados do hóspede */}
      <fieldset className="space-y-4">
        <legend className="font-medium text-[var(--text-primary)]">Dados do hóspede principal</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="label">Nome completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                id="fullName"
                value={formData.fullName || ""}
                onChange={e => handleChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                disabled={disabled}
                className={`input pl-10 ${errors.fullName ? "border-[var(--text-danger)]" : ""}`}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                autoComplete="name"
              />
            </div>
            {errors.fullName && <p id="fullName-error" className="text-xs text-[var(--text-danger)] mt-1" role="alert">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="email"
                id="email"
                value={formData.email || ""}
                onChange={e => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                disabled={disabled}
                className={`input pl-10 ${errors.email ? "border-[var(--text-danger)]" : ""}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
              />
            </div>
            {errors.email && <p id="email-error" className="text-xs text-[var(--text-danger)] mt-1" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="label">Telefone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="tel"
                id="phone"
                value={formData.phone || ""}
                onChange={e => handleChange("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                disabled={disabled}
                className={`input pl-10 ${errors.phone ? "border-[var(--text-danger)]" : ""}`}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                autoComplete="tel"
                placeholder="(11) 99999-9999"
              />
            </div>
            {errors.phone && <p id="phone-error" className="text-xs text-[var(--text-danger)] mt-1" role="alert">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="document" className="label">CPF / Passaporte</label>
            <input
              type="text"
              id="document"
              value={formData.document || ""}
              onChange={e => handleChange("document", e.target.value)}
              onBlur={() => handleBlur("document")}
              disabled={disabled}
              className={`input ${errors.document ? "border-[var(--text-danger)]" : ""}`}
              aria-invalid={!!errors.document}
              aria-describedby={errors.document ? "document-error" : undefined}
              placeholder="000.000.000-00"
            />
            {errors.document && <p id="document-error" className="text-xs text-[var(--text-danger)] mt-1" role="alert">{errors.document}</p>}
          </div>

          <div>
            <label htmlFor="nationality" className="label">Nacionalidade</label>
            <input
              type="text"
              id="nationality"
              value={formData.nationality || ""}
              onChange={e => handleChange("nationality", e.target.value)}
              disabled={disabled}
              className="input"
              placeholder="Brasileira"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="label">Data de nascimento</label>
            <input
              type="date"
              id="birthDate"
              value={formData.birthDate || ""}
              onChange={e => handleChange("birthDate", e.target.value)}
              disabled={disabled}
              className="input"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="label">Observações / Pedidos especiais</label>
          <textarea
            id="notes"
            value={formData.notes || ""}
            onChange={e => handleChange("notes", e.target.value)}
            disabled={disabled}
            rows={3}
            className="input resize-y"
            placeholder="Ex: quarto silencioso, andar térreo, alergias, etc."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="marketingConsent"
            checked={formData.marketingConsent}
            onChange={e => handleChange("marketingConsent", e.target.checked.toString())}
            disabled={disabled}
            className="checkbox"
          />
          <label htmlFor="marketingConsent" className="text-sm text-[var(--text-secondary)] cursor-pointer">
            Aceito receber comunicações promocionais por email
          </label>
        </div>
      </fieldset>

      {/* Pedidos especiais da reserva */}
      <fieldset className="space-y-2">
        <legend className="font-medium text-[var(--text-primary)]">Pedidos especiais para esta reserva</legend>
        <textarea
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          disabled={disabled}
          rows={2}
          className="input resize-y"
          placeholder="Ex: cama extra, berço, late check-out, etc."
        />
      </fieldset>

      {/* Segurança */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] p-4 bg-[var(--bg-secondary)] rounded-lg">
        <Shield className="w-4 h-4 shrink-0" />
        <p>Seus dados estão protegidos por criptografia SSL. Não compartilhamos suas informações com terceiros.</p>
      </div>

      {/* Erro de submissão */}
      {submitError && (
        <div className="p-3 bg-[var(--text-danger)]/10 border border-[var(--text-danger)]/20 rounded-lg text-[var(--text-danger)] text-sm" role="alert">
          {submitError}
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost flex-1" disabled={isSubmitting}>
            Voltar
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processando...
            </>
          ) : (
            "Continuar para pagamento"
          )}
        </button>
      </div>
    </form>
  );
}