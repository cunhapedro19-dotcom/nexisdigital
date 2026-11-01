import { test, expect } from "@playwright/test";

test.describe("Demo Pousadas - Disponibilidade e Reserva", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/solucoes/pousadas");
    await expect(page.locator("h1")).toContainText(/Pousada/);
  });

  test("seleciona tipo de acomodação e mostra disponibilidade", async ({ page }) => {
    // Seleciona um tipo
    await page.selectOption('select[name="type"]', "suite-master");
    // Aguarda verificação de disponibilidade
    await expect(page.locator('text=/Disponível|Indisponível/')).toBeVisible({ timeout: 5000 });
  });

  test("preenche formulário de reserva", async ({ page }) => {
    await page.selectOption('select[name="type"]', "suite-master");
    await page.waitForTimeout(500);

    const today = new Date();
    const checkin = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const checkout = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    await page.fill('input[name="checkin"]', checkin);
    await page.fill('input[name="checkout"]', checkout);
    await page.fill('input[name="name"]', "João Silva");
    await page.fill('input[name="email"]', "joao@teste.com");
    await page.fill('input[name="phone"]', "(11) 99999-9999");
    await page.fill('textarea[name="notes"]', "Teste automatizado");

    await expect(page.locator('text=/Disponível/')).toBeVisible({ timeout: 5000 });

    // Clica em enviar - deve abrir WhatsApp
    await page.click('button:has-text("Enviar pelo WhatsApp")');
    // Verifica se tenta abrir WhatsApp (nova aba ou redirect)
    // Não testamos a navegação real do WhatsApp em CI
  });

  test("mostra erro para datas inválidas", async ({ page }) => {
    await page.selectOption('select[name="type"]', "suite-master");
    await page.fill('input[name="checkin"]', "2020-01-01"); // passado
    await page.fill('input[name="checkout"]', "2020-01-05");
    await page.fill('input[name="name"]', "Teste");
    await page.fill('input[name="email"]', "teste@teste.com");
    await page.click('button:has-text("Enviar pelo WhatsApp")');
    await expect(page.locator('text=/inválida|passado|erro/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin Panel - Pousadas", () => {
  test("abre painel e navega entre abas", async ({ page }) => {
    await page.goto("/solucoes/pousadas");
    await page.click('button:has-text("Painel de demonstração")');
    await expect(page.locator('text=/Acomodações|Comodidades|Reservas/')).toBeVisible();

    // Testa abas
    await page.click('button[role="tab"]:has-text("Acomodações")');
    await expect(page.locator('text=/Acomodações/')).toBeVisible();

    await page.click('button[role="tab"]:has-text("Comodidades")');
    await expect(page.locator('text=/Comodidades/')).toBeVisible();

    await page.click('button[role="tab"]:has-text("Reservas")');
    await expect(page.locator('text=/Reservas/')).toBeVisible();
  });
});