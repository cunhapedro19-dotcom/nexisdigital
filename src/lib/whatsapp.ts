import { BRAND } from "@/config";

/**
 * Gera uma URL do WhatsApp com mensagem pré-preenchida.
 * Retorna null quando o número não está configurado.
 */
export function buildWhatsAppUrl(message: string): string | null {
  if (!BRAND.whatsappConfigured) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${BRAND.whatsapp}?text=${encoded}`;
}

/**
 * Formata um número de telefone brasileiro para exibição legível.
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13) {
    // 55 11 99999-0000
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return raw;
}

/**
 * Abre o WhatsApp numa nova aba. Se o número não estiver configurado,
 * retorna false para que o caller possa exibir uma alternativa de contato.
 */
export function openWhatsApp(message: string): boolean {
  const url = buildWhatsAppUrl(message);
  if (!url) return false;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return true;
}
