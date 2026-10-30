# Análise do projeto — Site Nexis Digital

*Análise realizada em 27/10/2026 sobre o código do último commit (`ba70c4a`), que contém a versão completa do site em Next.js.*

---

## 1. Situação atual da pasta (importante)

Durante a análise, a pasta foi sobrescrita por engano com o conteúdo de outro projeto (um app em Vite: `App.tsx`, `main.tsx`, `index.css`, `src/data/site.ts`, `src/utils/`). Você disse que está arrumando. No último estado que consegui ler, faltavam ainda os arquivos do site (que estão salvos no git) e sobravam alguns arquivos do projeto errado.

**Nada foi perdido** — a versão completa do site está no commit `ba70c4a`. Para restaurar tudo exatamente como estava, rode na pasta do projeto:

```bash
git restore .
git clean -fd -e ANALISE-DO-PROJETO.md
```

O `git restore .` recupera todos os arquivos do site. O `git clean -fd` apaga os arquivos do projeto Vite que ficaram sobrando (inclui também o zip `nexis-digital-website-development (1).zip` e o `package-lock.json` gerado pelo projeto errado — **não commit esse package-lock**, ele não corresponde a este projeto). O `-e ANALISE-DO-PROJETO.md` preserva este relatório.

Depois da restauração, rode `npm install` para regenerar um `package-lock.json` válido e o envie ao git (o CI hoje usa `npm install`; com lockfile válido vale trocar para `npm ci` — mais previsível).

---

## 2. Visão geral do projeto

| Aspecto | Avaliação |
|---|---|
| Stack | Next.js 16 (App Router) · React 19 · TypeScript estrito · Tailwind CSS 4 · Drizzle ORM (instalado, não usado) |
| Estrutura | 3 páginas institucionais (Início, Soluções, Contato) + 7 páginas de demonstração de soluções + 404 |
| Qualidade do código | Boa. TypeScript passa sem erros (`tsc --noEmit` = 0 erros). Hooks bem escritos, cleanup correto, `prefers-reduced-motion` respeitado |
| Deploy | GitHub Pages (export estático, basePath `/nexisdigital`) via workflow; config também pronta para Vercel |
| Estado do build | **Quebra localmente** (erro `DATABASE_URL is required`) — detalhado abaixo |

O conceito do site é bom e bem executado: em vez de só descrever serviços, ele mostra **demonstrações funcionais** (cardápio com carrinho, catálogo, gestão, RH etc.) que conduzem para o WhatsApp. A identidade visual é consistente (tokens em `globals.css`, tema escuro, acessórios de UI reutilizados em `Frames.tsx`).

---

## 3. O que foi verificado

- Leitura de todos os arquivos de `src/`, configs, workflow e script de build.
- `tsc --noEmit`: **passou sem erros**.
- `eslint`: não foi possível executar no meu ambiente (limite de tempo do sandbox); recomendo rodar `npm run lint` aí — não há indícios de problemas graves na leitura manual.
- Conferência do build exportado em `out/` (de 25/10): basePath aplicado corretamente; confirmando que a página `/contato` publicada usa o **título genérico** do layout (prova do problema de SEO por página, item P1).
- `git diff` das modificações pendentes: só diferenças de quebra de linha (CRLF/LF), nada substancial.

---

## 4. Problemas encontrados

### 🔴 P0 — Críticos (corrigir antes de divulgar o site)

**P0-1 · Todos os botões de WhatsApp apontam para um número fictício.**
`src/config.ts` usa o fallback `5511999990000` e a variável `whatsappConfigured` é calculada com esse mesmo fallback, então **sempre** retorna `true`. Resultado: o site inteiro (contato, CTA final, rodapé, páginas de demonstração) abre `wa.me/5511999990000` — um número que não é o seu. O mecanismo de fallback para e-mail, que o código prevê, nunca é acionado.
**Correção:** configure `NEXT_PUBLIC_WHATSAPP` com o número real (e mantenha o fallback como texto vazio, para o fallback para e-mail passar a funcionar de verdade): `whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? ""`.

**P0-2 · O site não compila sem banco de dados — e não usa banco.**
`src/db/index.ts` lança erro na inicialização se `DATABASE_URL` não existir, e a rota `src/app/api/health/route.ts` importa o banco. Na etapa "Collecting page data" do `next build`, o módulo é avaliado e o build morre (é exatamente o erro do seu `build-error.txt`). Nenhuma página usa o banco — o `schema.ts` está vazio; só o health check o usa.
**Correção mais simples:** apagar `src/db/` e `src/app/api/health/` (rota inútil para um site estático), ou tornar o import preguiçoso (`await import`) dentro do handler. O script `build-pages.mjs` já contorna isso no CI renomeando a rota — mas o build local continua quebrado.

**P0-3 · As 9 imagens do site não existem.**
As páginas referenciam 9 arquivos em `/images/` (`menu-burger.jpg`, `catalog-tee.jpg`, `inn-beach.jpg` etc.), mas **a pasta `public/` não existe** — nenhuma imagem está no projeto. Todos os cards da home, páginas de cardápio/catálogo/pousadas e o hero aparecem com fundos vazios.
**Correção:** criar `public/images/` e adicionar as imagens (ou trocar por ilustrações CSS/gradientes como já é feito em alguns previews). Também vale gerar um `favicon.ico` (hoje não há ícone definido no layout — só o app Vite acidental tinha).

**P0-4 · As imagens quebrarão no GitHub Pages mesmo depois de adicionadas.**
Nenhum componente usa `NEXT_PUBLIC_BASE_PATH` (definido no `next.config.ts` justamente para isso). Tags `<img src="/images/...">` e `background-image: url(/images/...)` apontam para a raiz do domínio, ignorando o basePath `/nexisdigital`. No Pages, o navegador pediria `seu-dominio/images/...` em vez de `.../nexisdigital/images/...`.
**Correção:** usar `${process.env.NEXT_PUBLIC_BASE_PATH}/images/...` nos locais com caminho fixo, ou um helper `imgPath()` central.

### 🟠 P1 — Importantes (afetam resultado e manutenção)

**P1-1 · SEO: 8 das 10 páginas não têm título/descrição próprios.**
As 7 páginas de soluções e a de contato são `"use client"` e não exportam `metadata` — todas publicam o mesmo título genérico (comprovado no `out/`). **Correção:** para cada página, quebrar em `page.tsx` (server, com `export const metadata`) + componente cliente; é uma mudança pequena por página.

**P1-2 · Faltam sitemap, robots e imagem de compartilhamento.**
Não existem `app/sitemap.ts` nem `app/robots.ts`; não há `og:image` (o card do Twitter pede imagem que não existe). Sem `og:image`, o link compartilhado no WhatsApp — justamente o canal do negócio — aparece sem preview. **Correção:** criar os dois arquivos (Next gera os XMLs no export) e uma imagem 1200×630 em `public/` referenciada no `openGraph` do layout.

**P1-3 · `metadataBase` não bate com o destino atual.**
Está `https://nexisdigital.com.br`, mas o deploy atual é GitHub Pages (`usuario.github.io/nexisdigital`). Canonicais e OG saem com o domínio errado. **Correção:** parametrizar por variável (`NEXT_PUBLIC_SITE_URL`) e alinhar com onde realmente vai publicar.

**P1-4 · `package-lock.json` ausente do repositório + CI com `npm install`.**
Sem lockfile, cada build do Actions resolve versões do zero — builds não reprodutíveis e sujeitos a quebra silenciosa. **Correção:** commitar o lockfile gerado pelo projeto Next (não o do acidente) e trocar para `npm ci`.

**P1-5 · Classe CSS montada dinamicamente não compila.**
Em `src/app/solucoes/page.tsx` (preview de RH): `` from-${c}-400 to-${c}-700 ``. O Tailwind analisa o texto dos arquivos; classes montadas por template string não existem no CSS final — os avatares ficam sem gradiente. **Correção:** usar classes literais num mapa (como `DemoShell.toneMap` já faz corretamente).

**P1-6 · HTML inválido na seção de processo.**
`ProcessSection` renderiza `<div>` (o `Reveal`) e um `<div aria-hidden>` como filhos diretos de `<ol>`, onde só `<li>` é permitido. **Correção:** mover a linha decorativa para fora do `<ol>` e usar o `as="li"` que o próprio `Reveal` suporta.

**P1-7 · Formulário de contato: erros não são anunciados a leitores de tela.**
Os campos mostram a mensagem de erro visualmente, mas sem `aria-invalid` nem `aria-describedby`. **Correção:** adicionar os dois atributos nos campos com erro. (Observação de copy: o texto "dados usados apenas para este contato" convive com o envio dos dados via WhatsApp — vale reformular para mencionar o WhatsApp explicitamente.)

### 🟡 P2 — Polimento

1. **Código morto:** `src/components/ui/Button.tsx` e `ui/Primitives.tsx` não são importados em lugar nenhum. Remover ou passar a usar (hoje os botões são escritos com classes soltas, repetidas em ~15 locais).
2. **`src/lib/cn.ts` virou caixa de utilitários** (`cn`, `currencyBRL`, `formatDate`). Renomear para `lib/format.ts` ou separar.
3. **Página gigante:** `solucoes/gestao-empresarial/page.tsx` tem 1.158 linhas com dados embarcados. Extrair dados para `src/data/` e seções em componentes — facilita manutenção futura.
4. **Fontes via `<link>` do Google** (`layout.tsx`): bloqueiam a primeira pintura. `next/font` (self-hosted no build) melhora performance e elimina o problema de privacidade/latência — funciona no export do Pages.
5. **Contraste baixo em textos decorativos:** `--color-nx-dim: #5e5e73` sobre o fundo `#06060a` dá ~3,4:1 (WCAG AA pede 4,5:1 para texto pequeno). Afeta os microtextos em maiúsculas. Subir para `#767689`+ resolve.
6. **Animação do contador em `Hero`/números e `site-scroll`:** o `ParticleField` e o `Reveal` respeitam `prefers-reduced-motion`, mas vale conferir os demais efeitos um a um.
7. **README vazio** (`"# nexisdigital"` com BOM) e `build-error.txt` commitado na raiz. Escrever instruções mínimas (setup, env vars, deploy) e apagar o arquivo de erro (já está no `.gitignore`).
8. **`drizzle.config.json` com credenciais commitadas** (`postgres:postgres@127.0.0.1`) — inofensivo por ser local, mas é lixo de template: remover junto com o Drizzle (item P0-2) ou mover para env.
9. **Anos dinâmico no rodapé:** `new Date().getFullYear()` é avaliado no build no export estático — em janeiro o site pode mostrar o ano velho até o próximo deploy. Fixar ou buscar via componente dinâmico.
10. **Analytics ausente:** para um site de captação, instalar GA4 ou alternativa (Plausible etc.) para medir de onde vêm os contatos.

---

## 5. Resumo por prioridade

| # | Problema | Impacto | Esforço |
|---|---|---|---|
| P0-1 | WhatsApp com número fictício em todo o site | Perde todo contato do canal principal | 5 min |
| P0-2 | Build quebra (`DATABASE_URL`) | Impede build local e confiabilidade do CI | 15 min |
| P0-3 | 9 imagens inexistentes (`public/` vazio) | Site visualmente quebrado | 1–2 h |
| P0-4 | Caminhos de imagem ignoram basePath | Imagens quebram no GitHub Pages | 30 min |
| P1-1 | Sem metadata por página (8 páginas) | SEO fraco, títulos genéricos | 1–2 h |
| P1-2 | Sem sitemap/robots/og:image | Indexação e preview no WhatsApp prejudicados | 1 h |
| P1-3 | `metadataBase` divergente do destino | Canonicais errados | 15 min |
| P1-4 | Sem lockfile + `npm install` no CI | Builds não reprodutíveis | 15 min |
| P1-5 | Classe Tailwind dinâmica não compila | Preview de RH sem gradiente | 10 min |
| P1-6 | HTML inválido em `ProcessSection` | Validez/acessibilidade | 10 min |
| P1-7 | Erros de formulário sem ARIA | Acessibilidade | 20 min |
| P2 | 10 itens de polimento (ver seção 4) | Qualidade e manutenção | variado |

---

## 6. Pontos fortes (para manter)

A base é bem melhor do que a lista de problemas sugere. Vale destacar: TypeScript estrito passando limpo; design system próprio coeso (`globals.css` com tokens, `Frames`, `Reveal`, `DemoShell`) em vez de copies soltas; animações com `IntersectionObserver` e respeito a `prefers-reduced-motion`; hook de localStorage com hidratação segura; fallback e-mail/WhatsApp pensado na arquitetura (só precisa do número real para funcionar); demos interativas de verdade (carrinho com adicionais, filtros, persistência) que diferenciam o site de uma landing page comum; e a estratégia de deploy duplo (Pages + Vercel) já configurada com basePath.

---

## 7. Ordem de trabalho sugerida

1. Restaurar a pasta (comandos da seção 1) e confirmar `npm run build` compilando.
2. P0-1 + P0-2 (número real e remover banco) — desbloqueia tudo.
3. P0-3 + P0-4 (imagens + basePath) — site volta a "parecer pronto".
4. P1-1 a P1-4 (SEO + CI) — preencher metadata, sitemap, og:image, lockfile.
5. P1-5 a P1-7 e P2 conforme sobrar tempo.
6. Rodar `npm run lint` e `npm run build` antes de cada commit; testar o link do WhatsApp com o número real num celular antes de divulgar.
