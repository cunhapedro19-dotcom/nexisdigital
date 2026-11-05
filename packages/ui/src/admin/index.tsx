"use client";

import type { ReactNode, ForwardRefExoticComponent, RefAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes, ChangeEvent, ChangeEventHandler } from "react";
import { forwardRef, useState, useRef, useEffect, useCallback, createPortal, createContext, useContext } from "react";
import { cn } from "../utils/cn";

/* =========================================================
   AdminKit — Componentes para painéis administrativos
   Design: Tech Minimal (flat, 1px borders, Inter ≥11px)
   ========================================================= */

// ---------------------------
// Utilidades internas
// ---------------------------
function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
}

// ---------------------------
// AdminOverlay — backdrop + portal container
// ---------------------------
export interface AdminOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const AdminOverlay = forwardRef<HTMLDivElement, AdminOverlayProps>(
  ({ open, onClose, children, className }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    useClickOutside(overlayRef, onClose, open);

    if (!open) return null;

    return createPortal(
      <div
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-[1300] bg-black/50 backdrop-blur-sm",
          "animate-fade-in",
          className
        )}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-overlay-title"
      >
        <div
          className="relative z-[1400] max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }
);
AdminOverlay.displayName = "AdminOverlay";

// ---------------------------
// AdminEditorModal — modal padrão para edição
// ---------------------------
export interface AdminEditorModalField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  description?: string;
  error?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  help?: string;
  disabled?: boolean;
}

export interface AdminEditorModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  fields?: AdminEditorModalField[];
  onSave?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  showCancelOnly?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

const SIZE_CLASSES: Record<"sm" | "md" | "lg" | "xl" | "full", string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-[95vw]",
};

export const AdminEditorModal = forwardRef<HTMLDivElement, AdminEditorModalProps>(
  ({ open, onClose, title, description, children, fields, onSave, initialData = {}, showCancelOnly = false, className, size = "lg", showCloseButton = true }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    useClickOutside(modalRef, onClose, open);

    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
      setFormData(initialData);
    }, [initialData]);

    const validateField = (field: AdminEditorModalField, value: any): string | null => {
      if (field.required && (value === undefined || value === null || value === "")) {
        return `${field.label} é obrigatório`;
      }
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Email inválido";
      }
      if (field.type === "number" && value !== undefined && value !== "") {
        const num = Number(value);
        if (isNaN(num)) return "Deve ser um número";
        if (field.min !== undefined && num < field.min) return `Mínimo: ${field.min}`;
        if (field.max !== undefined && num > field.max) return `Máximo: ${field.max}`;
      }
      return null;
    };

    const handleChange = (name: string, value: any) => {
      setFormData(prev => ({ ...prev, [name]: value }));
      const field = fields?.find(f => f.name === name);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [name]: error || "" }));
      }
    };

    const handleBlur = (name: string) => {
      const field = fields?.find(f => f.name === name);
      if (field) {
        const error = validateField(field, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error || "" }));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!fields) return;

      let hasError = false;
      const newErrors: Record<string, string> = {};

      fields.forEach(field => {
        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          hasError = true;
        }
      });

      setErrors(newErrors);

      if (!hasError && onSave) {
        onSave(formData);
      }
    };

    const renderField = (field: AdminEditorModalField) => {
      const error = errors[field.name];
      const value = formData[field.name];

      const commonInputProps = {
        id: `admin-field-${field.name}`,
        name: field.name,
        value: value ?? "",
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          let val: any = e.target.value;
          if (field.type === "number") val = val === "" ? undefined : Number(val);
          if (field.type === "checkbox") val = (e.target as HTMLInputElement).checked;
          handleChange(field.name, val);
        },
        onBlur: () => handleBlur(field.name),
        required: field.required,
        disabled: field.disabled,
        "aria-invalid": error ? "true" as const : "false" as const,
        "aria-describedby": error ? `${field.name}-error` : field.description ? `${field.name}-desc` : undefined,
      };

      switch (field.type) {
        case "textarea":
          return (
            <div key={field.name} className="w-full">
              <label htmlFor={commonInputProps.id} className="block text-[var(--admin-sm)] font-medium text-[var(--text-primary)] mb-1.5">
                {field.label} {field.required && <span className="text-[var(--text-danger)]">*</span>}
              </label>
              <textarea
                {...commonInputProps}
                rows={field.rows || 4}
                className={cn(
                  "w-full px-3 py-2.5",
                  "bg-[var(--bg-primary)] border border-[var(--border-default)]",
                  "rounded-lg",
                  "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                  "text-[var(--admin-sm)] font-mono",
                  "transition-colors duration-150 resize-y min-h-[80px]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:border-[var(--border-accent)]",
                  error && "border-[var(--text-danger)] focus:ring-[var(--text-danger)]"
                )}
              />
              {error && <p id={`${field.name}-error`} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-danger)]" role="alert">{error}</p>}
              {field.description && !error && <p id={`${field.name}-desc`} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">{field.description}</p>}
              {field.help && <p className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">{field.help}</p>}
            </div>
          );
        case "select":
          return (
            <div key={field.name} className="w-full">
              <label htmlFor={commonInputProps.id} className="block text-[var(--admin-sm)] font-medium text-[var(--text-primary)] mb-1.5">
                {field.label} {field.required && <span className="text-[var(--text-danger)]">*</span>}
              </label>
              <select
                {...commonInputProps}
                className={cn(
                  "w-full px-3 py-2.5",
                  "bg-[var(--bg-primary)] border border-[var(--border-default)]",
                  "rounded-lg",
                  "text-[var(--text-primary)]",
                  "text-[var(--admin-sm)]",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:border-[var(--border-accent)]",
                  error && "border-[var(--text-danger)] focus:ring-[var(--text-danger)]"
                )}
              >
                <option value="">Selecione...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {error && <p id={`${field.name}-error`} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-danger)]" role="alert">{error}</p>}
              {field.description && !error && <p id={`${field.name}-desc`} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">{field.description}</p>}
            </div>
          );
        case "checkbox":
          return (
            <div key={field.name} className="w-full flex items-center gap-2">
              <input
                {...commonInputProps}
                type="checkbox"
                className={cn(
                  "w-4 h-4 rounded border-[var(--border-default)]",
                  "text-[var(--brand-cyan)]",
                  "focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
              <label htmlFor={commonInputProps.id} className="text-[var(--admin-sm)] text-[var(--text-primary)] cursor-pointer">
                {field.label}
              </label>
              {field.description && <p className="text-[var(--admin-xs)] text-[var(--text-muted)]">{field.description}</p>}
            </div>
          );
        default:
          return (
            <div key={field.name} className="w-full">
              <label htmlFor={commonInputProps.id} className="block text-[var(--admin-sm)] font-medium text-[var(--text-primary)] mb-1.5">
                {field.label} {field.required && <span className="text-[var(--text-danger)]">*</span>}
              </label>
              <div className="relative">
                <input
                  {...commonInputProps}
                  type={field.type || "text"}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  className={cn(
                    "w-full px-3 py-2.5",
                    "bg-[var(--bg-primary)] border border-[var(--border-default)]",
                    "rounded-lg",
                    "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                    "text-[var(--admin-sm)]",
                    "transition-colors duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:border-[var(--border-accent)]",
                    error && "border-[var(--text-danger)] focus:ring-[var(--text-danger)]"
                  )}
                />
              </div>
              {error && <p id={`${field.name}-error`} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-danger)]" role="alert">{error}</p>}
              {field.description && !error && <p id={`${field.name}-desc`} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">{field.description}</p>}
              {field.help && <p className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">{field.help}</p>}
            </div>
          );
      }
    };

    if (!open) return null;

    return createPortal(
      <AdminOverlay open={true} onClose={onClose}>
        <div
          ref={modalRef}
          className={cn(
            "bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl",
            "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]",
            "animate-slide-up",
            SIZE_CLASSES[(size ?? "lg") as keyof typeof SIZE_CLASSES],
            "w-full mx-auto",
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          aria-describedby={description ? "admin-modal-desc" : undefined}
        >
          <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
            <div>
              <h2 id="admin-modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
                {title}
              </h2>
              {description && (
                <p id="admin-modal-desc" className="text-[var(--admin-xs)] text-[var(--text-muted)] mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-tertiary)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]"
                )}
                aria-label="Fechar modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </header>
          <form ref={formRef} onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-140px)] overflow-auto">
            {fields ? (
              <>
                <div className="space-y-6">
                  {fields.map(field => renderField(field))}
                </div>
                {!showCancelOnly && (
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border-default)]">
                    <button type="button" onClick={onClose} className="btn btn-ghost">
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salvar
                    </button>
                  </div>
                )}
              </>
            ) : (
              children
            )}
          </form>
        </div>
      </AdminOverlay>,
      document.body
    );
  }
);
AdminEditorModal.displayName = "AdminEditorModal";

// ---------------------------
// AdminSection — seção colapsável de formulário
// ---------------------------
export interface AdminSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: ReactNode;
}

export const AdminSection = forwardRef<HTMLDetailsElement, AdminSectionProps>(
  ({ title, description, children, defaultOpen = true, className, icon }, ref) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <details
        ref={ref}
        open={open}
        onToggle={() => setOpen(!open)}
        className={cn(
          "bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg",
          "overflow-hidden transition-all duration-200",
          className
        )}
      >
        <summary
          className={cn(
            "flex items-center gap-3 px-4 py-3 cursor-pointer",
            "list-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-inset",
            "select-none"
          )}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("button, a, input, select, textarea")) {
              e.preventDefault();
            }
          }}
        >
          {icon && <span className="text-[var(--text-accent)] shrink-0">{icon}</span>}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[var(--text-primary)] truncate">{title}</h3>
            {description && (
              <p className="text-[var(--admin-xs)] text-[var(--text-muted)] mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
          <svg
            className={cn(
              "w-5 h-5 text-[var(--text-muted)] transition-transform",
              "shrink-0",
              open && "rotate-90"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </summary>
        <div className={cn("px-4 pb-4", open ? "animate-slide-down" : "")}>
          {children}
        </div>
      </details>
    );
  }
);
AdminSection.displayName = "AdminSection";

// ---------------------------
// AdminField — wrapper consistente para inputs
// ---------------------------
export interface AdminFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
}

export const AdminField = forwardRef<HTMLInputElement, AdminFieldProps>(
  (
    {
      label,
      description,
      error,
      required = false,
      type = "text",
      leftIcon,
      rightIcon,
      className,
      inputClassName,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useRef(`admin-field-${Math.random().toString(36).slice(2, 9)}`);
    const fieldId = id || generatedId.current;
    const errorId = `${fieldId}-error`;
    const descId = `${fieldId}-desc`;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={cn("w-full", className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            "block text-[var(--admin-sm)] font-medium text-[var(--text-primary)]",
            "mb-1.5",
            required && "after:content-['*'] after:ml-1 after:text-[var(--text-danger)]"
          )}
        >
          {label}
        </label>
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={fieldId}
            type={type}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : description ? descId : undefined}
            className={cn(
              "w-full px-3 py-2.5",
              "bg-[var(--bg-primary)] border border-[var(--border-default)]",
              "rounded-lg",
              "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
              "text-[var(--admin-sm)]",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:border-[var(--border-accent)]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[var(--border-danger)] focus:ring-[var(--text-danger)]",
              inputClassName
            )}
            onChange={handleInputChange}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-danger)]" role="alert">
            {error}
          </p>
        )}
        {description && !error && (
          <p id={descId} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
    );
  }
);
AdminField.displayName = "AdminField";

// ---------------------------
// AdminTextarea — textarea consistente
// ---------------------------
export interface AdminTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "onChange"> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  onChange?: (value: string) => void;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  (
    {
      label,
      description,
      error,
      required = false,
      rows = 4,
      className,
      textareaClassName,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useRef(`admin-textarea-${Math.random().toString(36).slice(2, 9)}`);
    const fieldId = id || generatedId.current;
    const errorId = `${fieldId}-error`;
    const descId = `${fieldId}-desc`;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={cn("w-full", className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            "block text-[var(--admin-sm)] font-medium text-[var(--text-primary)]",
            "mb-1.5",
            required && "after:content-['*'] after:ml-1 after:text-[var(--text-danger)]"
          )}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          rows={rows}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : description ? descId : undefined}
          className={cn(
            "w-full px-3 py-2.5",
            "bg-[var(--bg-primary)] border border-[var(--border-default)]",
            "rounded-lg",
            "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
            "text-[var(--admin-sm)] font-mono",
            "transition-colors duration-150 resize-y min-h-[80px]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:border-[var(--border-accent)]",
            error && "border-[var(--border-danger)] focus:ring-[var(--text-danger)]",
            textareaClassName
          )}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-danger)]" role="alert">
            {error}
          </p>
        )}
        {description && !error && (
          <p id={descId} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
    );
  }
);
AdminTextarea.displayName = "AdminTextarea";

// ---------------------------
// AdminSelect — select consistente
// ---------------------------
export interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AdminSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange"> {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  options: AdminSelectOption[];
  placeholder?: string;
  className?: string;
  selectClassName?: string;
  onChange?: (value: string) => void;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      label,
      description,
      error,
      required = false,
      options,
      placeholder,
      className,
      selectClassName,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useRef(`admin-select-${Math.random().toString(36).slice(2, 9)}`);
    const fieldId = id || generatedId.current;
    const errorId = `${fieldId}-error`;
    const descId = `${fieldId}-desc`;

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={cn("w-full", className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            "block text-[var(--admin-sm)] font-medium text-[var(--text-primary)]",
            "mb-1.5",
            required && "after:content-['*'] after:ml-1 after:text-[var(--text-danger)]"
          )}
        >
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : description ? descId : undefined}
            className={cn(
              "w-full px-3 py-2.5 pr-10",
              "bg-[var(--bg-primary)] border border-[var(--border-default)]",
              "rounded-lg",
              "text-[var(--text-primary)]",
              "text-[var(--admin-sm)]",
              "transition-colors duration-150 appearance-none",
              "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:border-[var(--border-accent)]",
              error && "border-[var(--border-danger)] focus:ring-[var(--text-danger)]",
              selectClassName
            )}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Seta customizada */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-danger)]" role="alert">
            {error}
          </p>
        )}
        {description && !error && (
          <p id={descId} className="mt-1.5 text-[var(--admin-xs)] text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
    );
  }
);
AdminSelect.displayName = "AdminSelect";

// ---------------------------
// AdminSwitch — toggle acessível
// ---------------------------
export interface AdminSwitchProps {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
}

export const AdminSwitch = forwardRef<HTMLButtonElement, AdminSwitchProps>(
  ({ label, description, checked, defaultChecked = false, onChange, className, id }, ref) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;
    const generatedId = useRef(`admin-switch-${Math.random().toString(36).slice(2, 9)}`);
    const switchId = id || generatedId.current;
    const descId = `${switchId}-desc`;

    const handleChange = useCallback(
      (newChecked: boolean) => {
        if (!isControlled) setInternalChecked(newChecked);
        onChange?.(newChecked);
      },
      [isControlled, onChange]
    );

    const handleClick = () => {
      handleChange(!currentChecked);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleChange(!currentChecked);
      }
    };

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <button
          ref={ref}
          role="switch"
          aria-checked={currentChecked}
          aria-describedby={description ? descId : undefined}
          id={switchId}
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
            currentChecked ? "bg-[var(--brand-cyan)]" : "bg-[var(--border-default)]",
            "hover:opacity-90"
          )}
          aria-label={label}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm",
              "transition-transform duration-200",
              currentChecked ? "translate-x-5" : "translate-x-0"
            )}
            aria-hidden="true"
          />
        </button>
        <div className="pt-1 min-w-0">
          <label htmlFor={switchId} className="cursor-pointer select-none">
            <span className="block text-[var(--admin-sm)] font-medium text-[var(--text-primary)]">
              {label}
            </span>
            {description && (
              <p id={descId} className="text-[var(--admin-xs)] text-[var(--text-muted)] mt-0.5">
                {description}
              </p>
            )}
          </label>
        </div>
      </div>
    );
  }
);
AdminSwitch.displayName = "AdminSwitch";

// ---------------------------
// AdminSearch — busca com debounce
// ---------------------------
export interface AdminSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
  clearable?: boolean;
}

export const AdminSearch = forwardRef<HTMLInputElement, AdminSearchProps>(
  ({ placeholder = "Buscar...", value, onChange, debounceMs = 200, className, clearable = true, ...props }, ref) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        onChange(value);
      }, debounceMs);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [value, onChange, debounceMs]);

    return (
      <div className={cn("relative w-full", className)}>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-2",
            "bg-[var(--bg-primary)] border border-[var(--border-default)]",
            "rounded-lg",
            "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
            "text-[var(--admin-sm)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)] focus:border-transparent",
            "hover:border-[var(--border-accent)]"
          )}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Limpar busca"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
AdminSearch.displayName = "AdminSearch";

// ---------------------------
// ColorDuoPicker — seletor de dupla de cores (bg + text)
// ---------------------------
export interface ColorDuoPickerProps {
  label: string;
  bgColor: string;
  textColor: string;
  onBgChange: (color: string) => void;
  onTextChange: (color: string) => void;
  description?: string;
  className?: string;
  presets?: Array<{ bg: string; text: string; label: string }>;
}

export const ColorDuoPicker = forwardRef<HTMLDivElement, ColorDuoPickerProps>(
  (
    {
      label,
      bgColor,
      textColor,
      onBgChange,
      onTextChange,
      description,
      className,
      presets = [
        { bg: "#0c0a09", text: "#f5f3f0", label: "Dark" },
        { bg: "#1d3765", text: "#ffffff", label: "Azul" },
        { bg: "#3d2416", text: "#f5f3f0", label: "Marrom" },
        { bg: "#22332e", text: "#ffffff", label: "Verde" },
        { bg: "#332a20", text: "#f5f3f0", label: "Terroso" },
        { bg: "#2b3040", text: "#f5f3f0", label: "Slate" },
        { bg: "#faf9f7", text: "#0c0a09", label: "Light" },
      ],
    },
    ref
  ) => {
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [showTextPicker, setShowTextPicker] = useState(false);
    const bgPickerRef = useRef<HTMLDivElement>(null);
    const textPickerRef = useRef<HTMLDivElement>(null);
    useClickOutside(bgPickerRef, () => setShowBgPicker(false), showBgPicker);
    useClickOutside(textPickerRef, () => setShowTextPicker(false), showTextPicker);

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        <label className="block text-[var(--admin-sm)] font-medium text-[var(--text-primary)]">
          {label}
        </label>
        {description && (
          <p className="text-[var(--admin-xs)] text-[var(--text-muted)]">{description}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {/* Background picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBgPicker(!showBgPicker)}
              className={cn(
                "relative h-10 w-20 rounded-lg border-2",
                "transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]",
                "overflow-hidden"
              )}
              style={{ backgroundColor: bgColor, borderColor: textColor }}
              aria-label={`Cor de fundo: ${bgColor}`}
              aria-expanded={showBgPicker}
              aria-haspopup="listbox"
            >
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-mono"
                style={{ color: textColor }}
              >
                BG
              </span>
            </button>
            {showBgPicker && (
              <div
                ref={bgPickerRef}
                className="absolute z-[1600] mt-2 min-w-[180px] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl p-2 animate-fade-in"
                role="listbox"
                aria-label="Escolher cor de fundo"
              >
                {presets.map((p) => (
                  <button
                    key={p.bg}
                    type="button"
                    role="option"
                    aria-selected={p.bg === bgColor}
                    onClick={() => {
                      onBgChange(p.bg);
                      setShowBgPicker(false);
                    }}
                    className={cn(
                      "w-full h-8 rounded-md flex items-center gap-2 px-2",
                      "transition-colors",
                      "hover:bg-[var(--bg-tertiary)]",
                      p.bg === bgColor && "bg-[var(--bg-tertiary)] outline outline-1 outline-[var(--brand-cyan)]"
                    )}
                    style={{ backgroundColor: p.bg, color: p.text }}
                  >
                    <span className="w-6 h-6 rounded border border-[var(--border-default)] flex-shrink-0" />
                    <span className="text-[var(--admin-xs)] font-medium truncate">{p.label}</span>
                  </button>
                ))}
                <hr className="my-2 border-[var(--border-default)]" />
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 p-0 border-0 bg-transparent focus:ring-0"
                    value={bgColor}
                    onChange={(e) => {
                      onBgChange(e.target.value);
                      setShowBgPicker(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text color picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTextPicker(!showTextPicker)}
              className={cn(
                "relative h-10 w-20 rounded-lg border-2",
                "transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]",
                "overflow-hidden"
              )}
              style={{ backgroundColor: textColor, borderColor: bgColor }}
              aria-label={`Cor do texto: ${textColor}`}
              aria-expanded={showTextPicker}
              aria-haspopup="listbox"
            >
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-mono"
                style={{ color: bgColor }}
              >
                TXT
              </span>
            </button>
            {showTextPicker && (
              <div
                ref={textPickerRef}
                className="absolute z-[1600] mt-2 min-w-[180px] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-xl p-2 animate-fade-in"
                role="listbox"
                aria-label="Escolher cor do texto"
              >
                {presets.map((p) => (
                  <button
                    key={p.text}
                    type="button"
                    role="option"
                    aria-selected={p.text === textColor}
                    onClick={() => {
                      onTextChange(p.text);
                      setShowTextPicker(false);
                    }}
                    className={cn(
                      "w-full h-8 rounded-md flex items-center gap-2 px-2",
                      "transition-colors",
                      "hover:bg-[var(--bg-tertiary)]",
                      p.text === textColor && "bg-[var(--bg-tertiary)] outline outline-1 outline-[var(--brand-cyan)]"
                    )}
                    style={{ backgroundColor: p.bg, color: p.text }}
                  >
                    <span className="w-6 h-6 rounded border border-[var(--border-default)] flex-shrink-0" />
                    <span className="text-[var(--admin-xs)] font-medium truncate">{p.label}</span>
                  </button>
                ))}
                <hr className="my-2 border-[var(--border-default)]" />
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 p-0 border-0 bg-transparent focus:ring-0"
                    value={textColor}
                    onChange={(e) => {
                      onTextChange(e.target.value);
                      setShowTextPicker(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div
          className="h-16 w-full rounded-lg border border-[var(--border-default)] flex items-center justify-center"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <span className="font-medium">Preview: {label}</span>
        </div>
      </div>
    );
  }
);
ColorDuoPicker.displayName = "ColorDuoPicker";

// ---------------------------
// DangerButton — botão de ação destrutiva
// ---------------------------
export interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  confirmText?: string;
  children: ReactNode;
}

export const DangerButton = forwardRef<HTMLButtonElement, DangerButtonProps>(
  ({ loading = false, confirmText, children, className, onClick, disabled, ...props }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmText && !showConfirm) {
        e.preventDefault();
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 3000);
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2.5",
          "rounded-lg font-medium text-[var(--admin-sm)]",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-[var(--text-danger)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          loading
            ? "bg-[var(--text-danger)]/50 cursor-wait"
            : showConfirm
            ? "bg-[var(--text-danger)] hover:bg-[var(--text-danger)]/90 text-white"
            : "bg-transparent border border-[var(--border-danger)] text-[var(--text-danger)] hover:bg-[var(--text-danger)]/10",
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        )}
        {showConfirm && confirmText ? (
          <>
            <span>⚠</span>
            {confirmText}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
DangerButton.displayName = "DangerButton";

// ---------------------------
// useAdminToast — sistema de toasts
// ---------------------------
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 10);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration ?? 4000);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[1700] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <AdminToast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface AdminToastProps {
  key?: string | number;
  toast: Toast;
  onClose: () => void;
}

function AdminToast({ toast, onClose }: AdminToastProps) {
  const typeStyles = {
    success: "border-[var(--text-success)] bg-[var(--text-success)]/10",
    error: "border-[var(--text-danger)] bg-[var(--text-danger)]/10",
    warning: "border-[var(--text-warning)] bg-[var(--text-warning)]/10",
    info: "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/10",
  };

  const typeIcons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 px-4 py-3",
        "rounded-lg border shadow-xl",
        "min-w-[280px] max-w-md",
        "animate-slide-in-right",
        typeStyles[toast.type]
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn("shrink-0 flex-shrink-0", "text-[var(--text-" + toast.type + ")]")}>
        {typeIcons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--admin-sm)] text-[var(--text-primary)]">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[var(--admin-xs)] text-[var(--text-secondary)] mt-0.5">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onClose();
            }}
            className="mt-2 text-[var(--admin-xs)] font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Fechar notificação"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast deve ser usado dentro de AdminToastProvider");
  }

  const { addToast, removeToast, toasts } = context;

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, description?: string) => addToast({ type: "success", title, description }),
    error: (title: string, description?: string) => addToast({ type: "error", title, description }),
    warning: (title: string, description?: string) => addToast({ type: "warning", title, description }),
    info: (title: string, description?: string) => addToast({ type: "info", title, description }),
  };
}