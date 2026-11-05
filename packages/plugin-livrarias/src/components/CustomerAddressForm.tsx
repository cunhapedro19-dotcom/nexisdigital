"use client";

import { MapPin, Trash2, Edit } from "lucide-react";

interface Address {
  id: string;
  type: "billing" | "shipping";
  isDefault: boolean;
  recipientName: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface CustomerAddressFormProps {
  addresses: Address[];
  onAdd?: (address: Omit<Address, "id">) => void;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string, type: "billing" | "shipping") => void;
}

export function CustomerAddressForm({ addresses, onAdd, onEdit, onDelete, onSetDefault }: CustomerAddressFormProps) {
  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Nenhum endereço cadastrado</h3>
          <p className="text-[var(--text-muted)] mb-4">Adicione um endereço para agilizar suas compras</p>
          {onAdd && (
            <button onClick={() => onAdd({ type: "shipping", isDefault: true, recipientName: "", street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "", country: "Brasil" })} className="btn btn-primary">
              Adicionar Endereço
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(address => (
            <div key={address.id} className="card p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-[var(--text-primary)]">{address.recipientName}</span>
                  {address.isDefault && <span className="badge badge-success text-xs">Principal</span>}
                  <span className="badge badge-outline text-xs capitalize">{address.type}</span>
                </div>
                <address className="text-[var(--text-secondary)] not-italic text-sm">
                  <p>{address.street}, {address.number}{address.complement ? ` - ${address.complement}` : ""}</p>
                  <p>{address.neighborhood}, {address.city} - {address.state}</p>
                  <p>CEP: {address.zipCode}</p>
                  {address.phone && <p>Tel: {address.phone}</p>}
                </address>
              </div>
              <div className="flex items-center gap-2">
                {!address.isDefault && onSetDefault && (
                  <button onClick={() => onSetDefault(address.id, address.type)} className="btn btn-ghost btn-sm">Definir como principal</button>
                )}
                {onEdit && <button onClick={() => onEdit(address)} className="btn btn-ghost btn-sm"><Edit className="w-4 h-4" /></button>}
                {onDelete && <button onClick={() => onDelete(address.id)} className="btn btn-ghost btn-sm text-[var(--text-danger)]"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {onAdd && addresses.length < 5 && (
        <button onClick={() => onAdd({ type: "shipping", isDefault: false, recipientName: "", street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "", country: "Brasil" })} className="btn btn-outline w-full">
          + Adicionar novo endereço
        </button>
      )}
    </div>
  );
}