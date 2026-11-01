import { test, expect } from "@playwright/test";

test.describe("Demo Livrarias - Carrinho, Estoque e Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/solucoes/livrarias");
    await expect(page.locator("h1")).toContainText(/Livraria/);
  });

  test("adiciona livro ao carrinho", async ({ page }) => {
    const firstBook = page.locator('article').first();
    await firstBook.locator('button:has-text("+ Carrinho")').click();

    // Verifica badge do carrinho
    await expect(page.locator('button:has-text("🛒 Carrinho") >> span')).toContainText("1");
  });

  test("abre carrinho e mostra itens", async ({ page }) => {
    const firstBook = page.locator('article').first();
    await firstBook.locator('button:has-text("+ Carrinho")').click();

    await page.click('button:has-text("🛒 Carrinho")');
    await expect(page.locator('text=/Seu carrinho/')).toBeVisible();
    await expect(page.locator('text=/Total/')).toBeVisible();
  });

  test("abre checkout e valida campos obrigatórios", async ({ page }) => {
    const firstBook = page.locator('article').first();
    await firstBook.locator('button:has-text("+ Carrinho")').click();
    await page.click('button:has-text("Finalizar pedido")');

    await expect(page.locator('text=/Finalizar pedido/')).toBeVisible();

    // Tenta enviar sem preencher - deve mostrar erros
    await page.click('button:has-text("Confirmar e abrir WhatsApp")');
    await expect(page.locator('text=/Informe seu nome/')).toBeVisible();
    await expect(page.locator('text=/Informe seu e-mail/')).toBeVisible();
  });

  test("checkout completo com dados válidos", async ({ page }) => {
    const firstBook = page.locator('article').first();
    await firstBook.locator('button:has-text("+ Carrinho")').click();
    await page.click('button:has-text("Finalizar pedido")');

    await page.fill('input[placeholder*="João"]', "João Silva");
    await page.fill('input[placeholder*="joao@email"]', "joao@teste.com");
    await page.fill('input[placeholder*="(11)"]', "(11) 99999-9999");
    await page.fill('textarea[placeholder*="Endereço"]', "Rua Teste, 123");

    // Clica confirmar - deve abrir WhatsApp
    await page.click('button:has-text("Confirmar e abrir WhatsApp")');
    // Não testamos navegação real do WhatsApp
  });

  test("respeita limite de estoque", async ({ page }) => {
    // Procura livro com estoque baixo ou esgotado
    const books = page.locator('article');
    const count = await books.count();

    for (let i = 0; i < count; i++) {
      const book = books.nth(i);
      const addBtn = book.locator('button:has-text("+ Carrinho")');
      const esgotado = book.locator('text=Esgotado');

      if (await esgotado.isVisible()) {
        await expect(addBtn).not.toBeVisible();
        break;
      }
    }
  });

  test("lista de interesse (wishlist)", async ({ page }) => {
    const firstBook = page.locator('article').first();
    const heartBtn = firstBook.locator('button:has-text("♡")');

    await heartBtn.click();
    await expect(page.locator('button:has-text("♡ Lista (1)")')).toBeVisible();

    await heartBtn.click();
    await expect(page.locator('button:has-text("♡ Lista (0)")')).toBeVisible();
  });
});

test.describe("Admin Panel - Livrarias", () => {
  test("abre painel e acessa aba Pedidos", async ({ page }) => {
    await page.goto("/solucoes/livrarias");
    await page.click('button:has-text("Painel de demonstração")');
    await expect(page.locator('text=/Livros|Categorias|Pedidos/')).toBeVisible();

    await page.click('button[role="tab"]:has-text("Pedidos")');
    await expect(page.locator('text=/Pedidos/')).toBeVisible();

    // Verifica elementos da tabela
    await expect(page.locator('th:has-text("Código")')).toBeVisible();
    await expect(page.locator('th:has-text("Cliente")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });
});