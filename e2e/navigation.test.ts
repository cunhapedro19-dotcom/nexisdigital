import { test, expect } from "@playwright/test";

test.describe("Navegação geral", () => {
  test("home carrega e tem título correto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Nexis Digital/);
  });

  test("navega para /solucoes", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/solucoes"]');
    await expect(page).toHaveURL(/\/solucoes/);
    await expect(page.locator("h1")).toContainText(/Soluções/);
  });

  test("navega para /contato", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/contato"]');
    await expect(page).toHaveURL(/\/contato/);
    await expect(page.locator("h1")).toContainText(/Contato/);
  });

  test("footer tem links funcionais", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href^="mailto:"]')).toBeVisible();
  });
});

test.describe("Páginas de solução", () => {
  const solutions = [
    { path: "/solucoes/pousadas", title: "Pousada" },
    { path: "/solucoes/livrarias", title: "Livraria" },
    { path: "/solucoes/catalogo-digital", title: "Catálogo" },
    { path: "/solucoes/site-institucional", title: "Site Institucional" },
    { path: "/solucoes/gestao-empresarial", title: "Gestão" },
    { path: "/solucoes/gestao-rh", title: "RH" },
    { path: "/solucoes/cardapio-digital", title: "Cardápio" },
  ];

  solutions.forEach(({ path, title }) => {
    test(`${title} carrega corretamente`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
    });
  });
});