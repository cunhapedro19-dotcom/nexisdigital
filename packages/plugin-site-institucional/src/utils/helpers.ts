import type { PageBlock, SitePage, Testimonial } from "../types";

/**
 * @nexis/plugin-site-institucional — Utilitários
 */

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Renderiza estrelas de avaliação
 */
export function renderStars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

/**
 * Gera iniciais para avatar sem foto
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Estima tempo de leitura do post (200 palavras/min)
 */
export function getReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Ordena blocos da página (já vem ordenado da API; helper p/ reordenar no admin)
 */
export function moveBlock(blocks: PageBlock[], from: number, to: number): PageBlock[] {
  const result = [...blocks];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

/**
 * Gera sumário (anchors) a partir dos blocos com heading
 */
export function getTableOfContents(page: SitePage): Array<{ id: string; label: string }> {
  return page.blocks
    .filter((b): b is Extract<PageBlock, { type: "text" | "features" | "testimonials" }> =>
      "heading" in b && !!b.heading)
    .map((b, i) => ({
      id: `section-${i}`,
      label: b.heading as string,
    }));
}

export function isBlockType(block: PageBlock, type: PageBlock["type"]): boolean {
  return block.type === type;
}

export function getPublishedTestimonials(testimonials: Testimonial[]): Testimonial[] {
  return testimonials.filter(t => t.isPublished);
}
