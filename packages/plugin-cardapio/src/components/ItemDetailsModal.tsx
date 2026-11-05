"use client";

import type { MenuItem, MenuItemModifier } from "../types";
import { formatCurrency } from "../utils/helpers";
import { X, Plus, Minus, Leaf, Wheat, Clock, Flame } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface ItemDetailsModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    modifiers: Array<{ modifierId: string; optionId: string; name: string; additionalPrice: number }>,
    notes?: string
  ) => void;
}

export function ItemDetailsModal({ item, onClose, onAddToCart }: ItemDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, string[]>>(new Map());
  const [notes, setNotes] = useState("");

  if (!item) return null;

  const hasPromo = item.promotionalPrice != null && item.promotionalPrice < item.price;
  const basePrice = hasPromo ? item.promotionalPrice! : item.price;

  // Calcular total dos modificadores selecionados
  const modifiersTotal = item.modifiers.reduce((sum, modifier) => {
    const selected = selectedOptions.get(modifier.id) || [];
    return sum + selected.reduce((optionSum, optionId) => {
      const option = modifier.options.find(o => o.id === optionId);
      return optionSum + (option?.additionalPrice || 0);
    }, 0);
  }, 0);

  const unitPrice = basePrice + modifiersTotal;
  const total = unitPrice * quantity;

  const toggleOption = (modifierId: string, optionId: string, type: "single" | "multiple") => {
    setSelectedOptions(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(modifierId) || [];

      if (type === "single") {
        newMap.set(modifierId, current.includes(optionId) ? [] : [optionId]);
      } else {
        newMap.set(
          modifierId,
          current.includes(optionId)
            ? current.filter(id => id !== optionId)
            : [...current, optionId]
        );
      }
      return newMap;
    });
  };

  const handleAdd = () => {
    const modifiers = item.modifiers.flatMap(modifier => {
      const selected = selectedOptions.get(modifier.id) || [];
      return selected.map(optionId => {
        const option = modifier.options.find(o => o.id === optionId)!;
        return {
          modifierId: modifier.id,
          optionId: option.id,
          name: option.name,
          additionalPrice: option.additionalPrice,
        };
      });
    });

    onAddToCart(item, quantity, modifiers, notes || undefined);
    onClose();
  };

  // Verificar se modificadores obrigatórios estão preenchidos
  const missingRequired = item.modifiers.some(m => {
    if (!m.required) return false;
    const selected = selectedOptions.get(m.id) || [];
    const min = m.minSelections ?? 1;
    return selected.length < min;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] bg-[var(--bg-primary)] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header com imagem */}
        <div className="relative flex-shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-32 bg-[var(--bg-secondary)] flex items-center justify-center text-5xl">🍽️</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 btn p-2 rounded-full bg-[var(--bg-primary)] shadow-md"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              {item.isVegetarian && <span className="badge badge-success text-xs">Vegetariano</span>}
              {item.isVegan && <span className="badge badge-success text-xs">Vegano</span>}
              {item.isGlutenFree && <span className="badge badge-outline text-xs">Sem glúten</span>}
              {getSpicyBadge(item.spicyLevel)}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{item.name}</h2>
            <p className="text-[var(--text-secondary)] mt-1">{item.description}</p>

            <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ~{item.preparationTime} min</span>
              {item.servings > 1 && <span>Serve {item.servings} pessoas</span>}
              {item.calories && <span>{item.calories} kcal</span>}
            </div>
          </div>

          {/* Modificadores */}
          {item.modifiers.map(modifier => (
            <div key={modifier.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">{modifier.name}</h3>
                <span className="text-xs text-[var(--text-muted)]">
                  {modifier.required ? "Obrigatório" : "Opcional"}
                  {modifier.maxSelections && ` • máx. ${modifier.maxSelections}`}
                </span>
              </div>
              <div className="space-y-1.5">
                {modifier.options.filter(o => o.isActive).map(option => {
                  const selected = (selectedOptions.get(modifier.id) || []).includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={clsx(
                        "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                        selected
                          ? "border-[var(--brand-cyan)] bg-[var(--brand-cyan)]/5"
                          : "border-[var(--border-default)] hover:border-[var(--brand-cyan)]/50"
                      )}
                    >
                      <input
                        type={modifier.type === "single" ? "radio" : "checkbox"}
                        name={modifier.id}
                        checked={selected}
                        onChange={() => toggleOption(modifier.id, option.id, modifier.type)}
                        className="w-4 h-4 text-[var(--brand-cyan)] focus:ring-[var(--brand-cyan)]"
                      />
                      <span className="flex-1 text-sm text-[var(--text-primary)]">{option.name}</span>
                      {option.additionalPrice > 0 && (
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          +{formatCurrency(option.additionalPrice)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Observações */}
          <div>
            <label htmlFor="item-notes" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Alguma observação?
            </label>
            <textarea
              id="item-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, ponto da carne, etc."
              rows={2}
              maxLength={200}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)] resize-none"
            />
          </div>

          {/* Alérgenos e ingredientes */}
          {(item.allergens.length > 0 || item.ingredients.length > 0) && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-[var(--text-secondary)]">Ingredientes e alérgenos</summary>
              <div className="mt-2 space-y-2 text-[var(--text-muted)]">
                {item.ingredients.length > 0 && (
                  <p><strong>Ingredientes:</strong> {item.ingredients.join(", ")}</p>
                )}
                {item.allergens.length > 0 && (
                  <p><strong>Contém:</strong> {item.allergens.join(", ")}</p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Footer com total e botão */}
        <div className="border-t border-[var(--border-default)] p-4 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="btn btn-ghost p-2 rounded-lg"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-[var(--text-primary)]">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="btn btn-ghost p-2 rounded-lg"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={missingRequired}
            className="btn btn-primary flex-1 flex items-center justify-between px-4 py-3 disabled:opacity-50"
          >
            <span>Adicionar</span>
            <span>{formatCurrency(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function getSpicyBadge(level: string) {
  const labels: Record<string, string> = {
    mild: "🌶️ Leve",
    medium: "🌶️🌶️ Médio",
    hot: "🌶️🌶️🌶️ Picante",
    "extra-hot": "🌶️🌶️🌶️🌶️ Extra picante",
  };
  return labels[level] ? <span className="badge badge-warning text-xs">{labels[level]}</span> : null;
}