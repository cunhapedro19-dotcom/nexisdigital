"use client";

import { useParams } from "next/navigation";
import { MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Bath, Tv, Waves, Bed, ChevronLeft, ChevronRight, Share2, Heart, MapPin as MapPinIcon } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "../utils/pricing";
import type { Room } from "../types";

// Demo room data (em produção viria da API)
const ROOMS: Record<string, Room> = {
  "suite-master": {
    id: "room-1",
    tenantId: "demo",
    name: "Suíte Master com Varanda",
    description: "Suíte espaçosa com varanda privativa, vista para o jardim, cama king size, banheira de hidromassagem e mini-bar. Perfeita para casais que buscam conforto e romantismo.",
    capacity: 2,
    basePrice: 45000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Banheira", "Varanda", "Cofre", "Secador", "Roupão", "Chinelos"],
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80",
    ],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "deluxe-vista-mar": {
    id: "room-2",
    tenantId: "demo",
    name: "Quarto Deluxe Vista Mar",
    description: "Quarto elegante com vista panorâmica para o mar, cama queen, área de estar e banheiro moderno com chuveiro duplo. Acorde com o nascer do sol no horizonte.",
    capacity: 3,
    basePrice: 38000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Vista mar", "Área de estar", "Cofre", "Secador", "Roupão"],
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
    ],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "familia-superior": {
    id: "room-3",
    tenantId: "demo",
    name: "Quarto Família Superior",
    description: "Ideal para famílias, com dois ambientes: quarto de casal e ante-sala com sofá-cama, duas TVs e banheiro amplo. Espaço e conforto para todos.",
    capacity: 4,
    basePrice: 52000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Sofá-cama", "Duas TVs", "Banheira", "Varanda", "Cofre", "Secador"],
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "bangalo-premium": {
    id: "room-4",
    tenantId: "demo",
    name: "Bangalô Premium",
    description: "Bangalô privativo com piscina exclusiva, deck, sala de estar, cozinha compacta e suíte master. Experiência única de privacidade e luxo.",
    capacity: 2,
    basePrice: 89000,
    amenities: ["Wi-Fi", "Ar-condicionado", "TV a cabo", "Frigobar", "Piscina privativa", "Deck", "Cozinha", "Banheira", "Varanda", "Cofre", "Secador", "Roupão", "Chinelos"],
    images: [
      "https://images.unsplash.com/photo-1584132915606-3c7a2b8c4a5b?w=1200&q=80",
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export default function PousadaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const room = ROOMS[slug];

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Quarto não encontrado</h1>
          <p className="text-[var(--text-secondary)] mb-6">O quarto que você procura não existe ou foi removido.</p>
          <a href="/pousadas" className="btn btn-primary">Voltar para busca</a>
        </div>
      </div>
    );
  }

  const [currentImage, setCurrentImage] = useState(0);
  const images = room.images || [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Gallery Hero */}
      <section className="relative h-[60vh] min-h-[400px]">
        <div className="absolute inset-0">
          {images.length > 0 ? (
            <Image
              src={images[currentImage]}
              alt={room.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Bed className="w-32 h-32 text-[var(--text-muted)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-ghost p-2 bg-white/10 backdrop-blur hover:bg-white/20"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentImage((currentImage + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost p-2 bg-white/10 backdrop-blur hover:bg-white/20"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                  i === currentImage ? "border-[var(--brand-cyan)]" : "border-white/30 hover:border-white/50"
                }`}
                aria-label={`Ver imagem ${i + 1}`}
                aria-current={i === currentImage ? "true" : "false"}
              >
                <Image src={images[i]} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}

        {/* Header info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-sm text-white/90 bg-white/10 backdrop-blur px-3 py-1 rounded-full mb-2">
                  <MapPinIcon className="w-3 h-3" />
                  Pousada Nexis - Centro Histórico
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{room.name}</h1>
                <p className="text-white/90 text-lg max-w-2xl">{room.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl sm:text-4xl font-bold text-white">{formatCurrency(room.basePrice)}</p>
                  <p className="text-white/80 text-sm">por noite</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main content */}
            <main className="lg:col-span-2 space-y-8">
              {/* Comodidades */}
              <article className="card p-6">
                <header className="mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Comodidades</h2>
                  <p className="text-[var(--text-secondary)] mt-1">Tudo para sua estadia ser perfeita</p>
                </header>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-[var(--brand-cyan)]" />
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{amenity}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* Descrição detalhada */}
              <article className="card p-6">
                <header className="mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Sobre este quarto</h2>
                </header>
                <div className="prose prose-[var(--text-secondary)] max-w-none">
                  <p>{room.description}</p>
                  <ul className="list-disc list-inside space-y-2 mt-4">
                    <li>Capacidade para até {room.capacity} hóspede{room.capacity !== 1 ? "s" : ""}</li>
                    <li>Check-in a partir das 14:00 | Check-out até 11:00</li>
                    <li>Café da manhã incluso na diária</li>
                    <li>Wi-Fi de alta velocidade em todas as áreas</li>
                    <li>Estacionamento gratuito (sujeito a disponibilidade)</li>
                    <li>Recepção 24 horas</li>
                    <li>Serviço de quarto das 7h às 22h</li>
                  </ul>
                </div>
              </article>

              {/* Políticas */}
              <article className="card p-6">
                <header className="mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Políticas da Pousada</h2>
                </header>
                <dl className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <Calendar className="w-5 h-5 text-[var(--brand-cyan)] shrink-0 mt-0.5" />
                    <div>
                      <dt className="font-medium text-[var(--text-primary)]">Check-in / Check-out</dt>
                      <dd className="text-[var(--text-secondary)]">Check-in a partir das 14:00. Check-out até 11:00. Early check-in e late check-out sujeitos a disponibilidade e taxa extra.</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <Users className="w-5 h-5 text-[var(--brand-cyan)] shrink-0 mt-0.5" />
                    <div>
                      <dt className="font-medium text-[var(--text-primary)]">Crianças e camas extras</dt>
                      <dd className="text-[var(--text-secondary)]">Crianças até 5 anos grátis na cama dos pais. Cama extra: R$ 80/noite. Berço: gratuito (sob consulta).</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <Star className="w-5 h-5 text-[var(--brand-cyan)] shrink-0 mt-0.5" />
                    <div>
                      <dt className="font-medium text-[var(--text-primary)]">Cancelamento</dt>
                      <dd className="text-[var(--text-secondary)]">Política moderada: cancelamento grátis até 5 dias antes. Após isso, 50% de reembolso até 1 dia antes. Sem reembolso no dia do check-in.</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <Heart className="w-5 h-5 text-[var(--brand-cyan)] shrink-0 mt-0.5" />
                    <div>
                      <dt className="font-medium text-[var(--text-primary)]">Animais de estimação</dt>
                      <dd className="text-[var(--text-secondary)]">Pets de pequeno porte permitidos com taxa de R$ 50/dia. Necessário aviso prévio.</dd>
                    </div>
                  </div>
                </dl>
              </article>

              {/* Localização */}
              <article className="card p-6">
                <header className="mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Localização</h2>
                </header>
                <div className="aspect-video bg-[var(--bg-secondary)] rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
                    <MapPin className="w-12 h-12" />
                    <p className="ml-2">Mapa interativo (Google Maps / Mapbox)</p>
                  </div>
                </div>
                <address className="mt-4 not-italic text-[var(--text-secondary)] space-y-1">
                  <p><strong>Pousada Nexis</strong></p>
                  <p>Rua das Flores, 123 - Centro Histórico</p>
                  <p>CEP 12345-678 - Cidade Exemplo, SP</p>
                  <p className="mt-2">Próximo a: Praça Principal (200m), Restaurantes (100m), Praia (500m)</p>
                </address>
              </article>
            </main>

            {/* Sidebar - Reserva */}
            <aside className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Reserve agora</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Diária</span>
                    <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(room.basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Taxas estimadas</span>
                    <span className="text-[var(--text-primary)]">{formatCurrency(Math.round(room.basePrice * 0.1))}</span>
                  </div>
                  <div className="border-t border-[var(--border-default)] pt-2 flex justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">Total estimado</span>
                    <span className="font-bold text-lg text-[var(--brand-cyan)]">{formatCurrency(Math.round(room.basePrice * 1.1))}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] text-center">* Valor final depende das datas e número de hóspedes</p>
                </div>

                <a
                  href="/pousadas"
                  className="btn btn-primary w-full py-3 text-lg"
                >
                  Ver disponibilidade e reservar
                </a>

                <p className="text-center text-xs text-[var(--text-muted)] mt-4">
                  Melhor preço garantido • Cancelamento flexível • Pagamento seguro
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Outros quartos */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">Outros quartos disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(ROOMS)
              .filter(r => r.id !== room.id)
              .map((otherRoom) => (
                <article key={otherRoom.id} className="card card-interactive overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    {otherRoom.images?.[0] ? (
                      <Image
                        src={otherRoom.images[0]}
                        alt={otherRoom.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <Bed className="w-16 h-16 text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{otherRoom.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{otherRoom.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--brand-cyan)] font-bold">{formatCurrency(otherRoom.basePrice)}/noite</span>
                      <a href={`/pousadas/${otherRoom.id}`} className="btn btn-ghost text-sm">Ver detalhes</a>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}