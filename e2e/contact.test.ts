import { test, expect } from "@playwright/test";

test.describe("Página de Contato", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contato");
    await expect(page.locator("h1")).toContainText(/Contato/);
  });

  test("formulário valida campos obrigatórios", async ({ page }) => {
    await page.click('button:has-text("Enviar")');
    await expect(page.locator('text=/Informe seu nome/')).toBeVisible();
    await expect(page.locator('text=/Informe seu e-mail/')).toBeVisible();
    await expect(page.locator('text=/Informe sua mensagem/')).toBeVisible();
  });

  test("formulário valida e-mail inválido", async ({ page }) => {
    await page.fill('input[name="name"]', "Teste");
    await page.fill('input[name="email"]', "email-invalido");
    await page.fill('textarea[name="message"]', "Mensagem de teste");
    await page.click('button:has-text("Enviar")');
    await expect(page.locator('text=/E-mail inválido/')).toBeVisible();
  });

  test("formulário envia com dados válidos (abre WhatsApp)", async ({ page }) => {
    await page.fill('input[name="name"]', "João Silva");
    await page.fill('input[name="email"]', "joao@teste.com");
    await page.fill('input[name="phone"]', "(11) 99999-9999");
    await page.fill('textarea[name="message"]', "Gostaria de um orçamento.");
    await page.click('button:has-text("Enviar pelo WhatsApp")');
    // Não testamos navegação real do WhatsApp
  });
});