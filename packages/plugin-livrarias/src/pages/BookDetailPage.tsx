"use client";

import { Book } from "../types";
import { formatCurrency } from "../utils/formatters";
import { ShoppingCart, Star, Tag, Share2, Heart, Truck, RotateCcw, CheckCircle } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface BookDetailPageProps {
  book: Book;
  onAddToCart?: (book: Book, format: string) => void;
  relatedBooks?: Book[];
}

const MOCK_BOOK: Book = {
  id: "book-1",
  tenantId: "demo",
  isbn: "978-85-359-1234-5",
  title: "Dom Casmurro",
  subtitle: "Edição Comentada",
  author: "Machado de Assis",
  publisher: "Penguin Companhia",
  publishedDate: new Date("2020-01-15"),
  category: "fiction",
  format: "paperback",
  language: "pt-BR",
  pages: 256,
  description: "Obra-prima do realismo brasileiro, Dom Casmurro narra a história de Bentinho e sua obsessão por Capitu. Esta edição comentada traz notas e análises que enriquecem a leitura.",
  shortDescription: "Clássico da literatura brasileira em edição especial comentada.",
  coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
  galleryImages: [],
  price: 4490,
  compareAtPrice: 5990,
  costPrice: 2200,
  sku: "DOM-CAS-001",
  barcode: "9788535912345",
  tags: ["clássico", "literatura brasileira", "realismo"],
  isActive: true,
  isFeatured: true,
  isNewRelease: false,
  isBestseller: true,
  stockQuantity: 50,
  reservedQuantity: 3,
  lowStockThreshold: 5,
  trackInventory: true,
  allowBackorder: true,
  seoTitle: "Dom Casmurro - Machado de Assis | Edição Comentada",
  seoDescription: "Compre Dom Casmurro de Machado de Assis com edição comentada. Frete grátis acima de R$ 99.",
  seoKeywords: ["machado de assis", "dom casmurro", "literatura brasileira", "clássico"],
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
};

export default function BookDetailPage({ book = MOCK_BOOK, onAddToCart, relatedBooks = [] }: BookDetailPageProps) {
  const [selectedFormat, setSelectedFormat] = useState("paperback");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  const formats = ["paperback", "hardcover", "ebook"];
  const images = book.coverImage ? [book.coverImage, ...book.galleryImages] : [];
  const discount = book.compareAtPrice && book.compareAtPrice > book.price
    ? Math.round(((book.compareAtPrice - book.price) / book.compareAtPrice) * 100)
    : 0;

  const isLowStock = book.stockQuantity - book.reservedQuantity > 0 && book.stockQuantity - book.reservedQuantity <= book.lowStockThreshold;
  const isOutOfStock = book.stockQuantity - book.reservedQuantity <= 0 && !book.allowBackorder;
  const available = book.stockQuantity - book.reservedQuantity;

  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(book, selectedFormat);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Breadcrumb */}
      <nav className="border-b border-[var(--border-default)] py-4" aria-label="Navegação">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <li><a href="/" className="hover:text-[var(--brand-cyan)]">Início</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/livros" className="hover:text-[var(--brand-cyan)]">Livros</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="#" className="hover:text-[var(--brand-cyan)]">{book.category}</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--text-primary)] truncate max-w-[200px]">{book.title}</li>
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)]">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={`${book.title} - Imagem ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">📖</div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge badge-danger text-sm px-3 py-1">-{discount}%</span>
                </div>
              )}
              {book.isNewRelease && (
                <div className="absolute top-4 right-4">
                  <span className="badge badge-primary text-sm px-3 py-1">Lançamento</span>
                </div>
              )}
              {book.isBestseller && (
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <span className="badge badge-amber text-sm px-3 py-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Mais Vendido
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Imagens do livro">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={clsx(
                      "flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === idx
                        ? "border-[var(--brand-cyan)]"
                        : "border-transparent hover:border-[var(--border-default)]"
                    )}
                    aria-label={`Ver imagem ${idx + 1}`}
                    aria-current={selectedImage === idx ? "true" : "false"}
                    role="listitem"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[var(--brand-cyan)]" />
                <span>Frete grátis acima de R$ 99</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[var(--brand-cyan)]" />
                <span>Troca grátis em 7 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--brand-cyan)]" />
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>

          {/* Info & Buy */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{book.category}</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1 mb-2">{book.title}</h1>
              {book.subtitle && <h2 className="text-xl text-[var(--text-secondary)] font-normal mb-4">{book.subtitle}</h2>}
            </div>

            {/* Author & Rating */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-cyan)]/10 flex items-center justify-center text-[var(--brand-cyan)] font-medium">
                  {book.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Autor</p>
                  <p className="font-medium text-[var(--text-primary)]">{book.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[var(--brand-amber)] text-[var(--brand-amber)]" />
                <span className="font-medium text-[var(--text-primary)]">4.8</span>
                <span className="text-sm text-[var(--text-muted)]">(247 avaliações)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-[var(--brand-cyan)]">{formatCurrency(book.price)}</span>
              {book.compareAtPrice && book.compareAtPrice > book.price && (
                <span className="text-xl text-[var(--text-muted)] line-through">{formatCurrency(book.compareAtPrice)}</span>
              )}
              {discount > 0 && (
                <span className="badge badge-danger px-3 py-1 text-sm">Economize {discount}%</span>
              )}
            </div>

            {/* Format Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Formato</label>
              <div className="flex gap-2" role="radiogroup" aria-label="Selecionar formato">
                {formats.map(format => (
                  <button
                    key={format}
                    type="button"
                    role="radio"
                    aria-checked={selectedFormat === format}
                    onClick={() => setSelectedFormat(format)}
                    className={clsx(
                      "px-4 py-2 rounded-lg border transition-all",
                      selectedFormat === format
                        ? "bg-[var(--brand-cyan)] border-[var(--brand-cyan)] text-white"
                        : "bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-cyan)]"
                    )}
                  >
                    {format.charAt(0).toUpperCase() + format.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Quantidade</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-ghost p-2"
                  aria-label="Diminuir quantidade"
                >
                  <span className="w-5 h-5">−</span>
                </button>
                <input
                  type="number"
                  min="1"
                  max={book.allowBackorder ? 99 : available}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 text-center py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:border-[var(--brand-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-cyan)]"
                  aria-label="Quantidade"
                />
                <button
                  onClick={() => setQuantity(q => Math.min(book.allowBackorder ? 99 : available, q + 1))}
                  className="btn btn-ghost p-2"
                  aria-label="Aumentar quantidade"
                >
                  <span className="w-5 h-5">+</span>
                </button>
                <span className="text-sm text-[var(--text-muted)] ml-2">
                  {isOutOfStock ? "Indisponível" : isLowStock ? `Apenas ${available} em estoque` : `${available} disponíveis`}
                </span>
              </div>
            </div>

            {/* Add to Cart / Buy Now */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn btn-primary py-3 text-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? "Indisponível" : "Adicionar ao Carrinho"}
              </button>
              <button className="btn btn-outline py-3 px-6 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Share2 className="w-5 h-5 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-secondary)]">Compartilhar:</span>
              <div className="flex gap-2">
                <a href="#" className="btn btn-ghost p-2" aria-label="Compartilhar no WhatsApp">📱</a>
                <a href="#" className="btn btn-ghost p-2" aria-label="Compartilhar no Facebook">📘</a>
                <a href="#" className="btn btn-ghost p-2" aria-label="Compartilhar no Twitter">🐦</a>
                <a href="#" className="btn btn-ghost p-2" aria-label="Copiar link">🔗</a>
              </div>
            </div>

            {/* Details Tabs */}
            <div className="border-t border-[var(--border-default)] pt-6">
              <div className="flex gap-1 mb-4 border-b border-[var(--border-default)]" role="tablist">
                {[
                  { id: "description", label: "Descrição" },
                  { id: "details", label: "Detalhes" },
                  { id: "reviews", label: `Avaliações (247)` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={showReviews && tab.id === "reviews" || !showReviews && tab.id === "description"}
                    className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
                    style={{
                      borderColor: (showReviews && tab.id === "reviews") || (!showReviews && tab.id === "description") ? "var(--brand-cyan)" : "transparent",
                      color: (showReviews && tab.id === "reviews") || (!showReviews && tab.id === "description") ? "var(--brand-cyan)" : "var(--text-muted)",
                    }}
                    onClick={() => setShowReviews(tab.id === "reviews")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div role="tabpanel">
                {showReviews ? (
                  <div className="space-y-4">
                    <p className="text-center text-[var(--text-muted)] py-8">Seção de avaliações em desenvolvimento</p>
                  </div>
                ) : (
                  <>
                    <div className="prose text-[var(--text-secondary)] mb-6">
                      <p>{book.description}</p>
                    </div>

                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Detalhes do Produto</h3>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-[var(--text-muted)]">ISBN</dt><dd className="font-medium">{book.isbn}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Editora</dt><dd className="font-medium">{book.publisher}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Publicação</dt><dd className="font-medium">{book.publishedDate?.toLocaleDateString("pt-BR")}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Páginas</dt><dd className="font-medium">{book.pages}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Idioma</dt><dd className="font-medium">{book.language}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Formato</dt><dd className="font-medium">{book.format}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Dimensões</dt><dd className="font-medium">{book.dimensions || "—"}</dd></div>
                      <div><dt className="text-[var(--text-muted)]">Peso</dt><dd className="font-medium">{book.weight ? `${book.weight}g` : "—"}</dd></div>
                    </dl>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map(b => (
                <article key={b.id} className="card group">
                  <div className="aspect-[2/3] bg-[var(--bg-secondary)] relative overflow-hidden">
                    {b.coverImage ? (
                      <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-[var(--text-primary)] line-clamp-1 mb-1">{b.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-2">{b.author}</p>
                    <span className="font-bold text-[var(--brand-cyan)]">{formatCurrency(b.price)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}