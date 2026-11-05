"use client";

import Image from "next/image";
import { Users, Star, Wifi, Car, Coffee, Bath, Tv, Waves, Utensils, Bed, Wifi as WifiIcon, ParkingCircle, CoffeeIcon, BathIcon, TvIcon, WavesIcon } from "lucide-react";
import { formatCurrency } from "../utils/pricing";
import type { Room } from "../types";

const AMENITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  wifi: WifiIcon,
  parking: ParkingCircle,
  breakfast: CoffeeIcon,
  "private-bathroom": BathIcon,
  tv: TvIcon,
  pool: WavesIcon,
  "air-conditioning": Wifi,
  minibar: Coffee,
  safe: Bath,
};

interface RoomCardProps {
  room: Room;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  totalPrice?: number;
  onSelect?: (room: Room) => void;
  selected?: boolean;
  showPrice?: boolean;
  className?: string;
}

export function RoomCard({
  room,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  onSelect,
  selected = false,
  showPrice = true,
  className = "",
}: RoomCardProps) {
  const amenities = room.amenities || [];
  const images = room.images || [];

  return (
    <article
      className={`
        card card-interactive relative overflow-hidden h-full flex flex-col
        ${selected ? "ring-2 ring-[var(--brand-cyan)]" : ""}
        ${className}
      `}
      onClick={() => onSelect?.(room)}
    >
      {/* Imagens */}
      <div className="relative aspect-video overflow-hidden bg-[var(--bg-secondary)]">
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Bed className="w-16 h-16 text-[var(--text-muted)]" />
          </div>
        )}

        {selected && (
          <div className="absolute top-3 right-3">
            <span className="bg-[var(--brand-cyan)] text-white text-xs font-medium px-2 py-1 rounded-full">
              Selecionado
            </span>
          </div>
        )}

        {room.capacity && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            <Users className="w-3 h-3" />
            <span>{room.capacity} hóspede{room.capacity !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-[var(--text-primary)] text-lg flex-1">{room.name}</h3>
          {showPrice && room.basePrice && (
            <span className="text-[var(--brand-cyan)] font-bold text-lg whitespace-nowrap">
              {formatCurrency(room.basePrice)}/noite
            </span>
          )}
        </div>

        {room.description && (
          <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">{room.description}</p>
        )}

        {/* Comodidades */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Comodidades">
            {amenities.slice(0, 6).map((amenity) => {
              const Icon = AMENITY_ICONS[amenity.toLowerCase().replace(/\s+/g, "-")] || Wifi;
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] px-2 py-1 bg-[var(--bg-secondary)] rounded-full"
                  role="listitem"
                >
                  <Icon className="w-3 h-3" />
                  {amenity}
                </span>
              );
            })}
            {amenities.length > 6 && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] px-2 py-1 bg-[var(--bg-secondary)] rounded-full">
                +{amenities.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Preço total da estadia */}
        {showPrice && checkIn && checkOut && totalPrice && nights && (
          <div className="mt-auto pt-4 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">{nights} noite{nights !== 1 ? "s" : ""}</span>
              <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Preço base</span>
              <span>{formatCurrency(room.basePrice * nights)}</span>
            </div>
          </div>
        )}

        {onSelect && !selected && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(room); }}
            className="btn btn-primary w-full mt-4"
          >
            Selecionar
          </button>
        )}
      </div>
    </article>
  );
}

/* Grid de quartos */
export function RoomGrid({
  rooms,
  checkIn,
  checkOut,
  nights,
  onSelect,
  selectedRoomId,
  pricingMap,
  className = "",
}: {
  rooms: Room[];
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  onSelect?: (room: Room) => void;
  selectedRoomId?: string;
  pricingMap?: Map<string, { total: number }>;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`} role="list">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          totalPrice={pricingMap?.get(room.id)?.total}
          onSelect={onSelect}
          selected={selectedRoomId === room.id}
          role="listitem"
        />
      ))}
      {rooms.length === 0 && (
        <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
          <p>Nenhum quarto disponível para as datas selecionadas.</p>
          <p className="text-sm mt-1">Tente alterar as datas ou o número de hóspedes.</p>
        </div>
      )}
    </div>
  );
}