import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "./whatsapp";

describe("whatsapp.ts - buildWhatsAppUrl", () => {
  it("gera URL válida do WhatsApp com mensagem codificada", () => {
    const url = buildWhatsAppUrl("Olá, mundo!");
    expect(url).toContain("https://wa.me/");
    expect(url).toContain("text=");
    expect(url).toContain("Ol%C3%A1%2C%20mundo%21"); // "Olá, mundo!" encoded
  });

  it("inclui número de telefone quando configurado", () => {
    const url = buildWhatsAppUrl("Teste", "5511999999999");
    expect(url).toContain("5511999999999");
  });

  it("retorna null para mensagem vazia", () => {
    expect(buildWhatsAppUrl("")).toBeNull();
    expect(buildWhatsAppUrl("   ")).toBeNull();
  });

  it("codifica caracteres especiais", () => {
    const url = buildWhatsAppUrl("João & Maria: 50% off!");
    expect(url).toContain("Jo%C3%A3o%20%26%20Maria%3A%2050%25%20off%21");
  });

  it("aceita mensagens multilinha", () => {
    const msg = "Linha 1\nLinha 2\nLinha 3";
    const url = buildWhatsAppUrl(msg);
    expect(url).toContain("Linha%201%0ALinha%202%0ALinha%203");
  });
});