# Nexis Digital — Arquitetura Multi-Tenant (Core + Plugins)

## Visão Geral

Transformar os demonstrativos atuais em **plugins** de uma plataforma SaaS onde cada cliente (tenant) tem seu(s) site(s) funcionais, isolados, com admin unificado e billing centralizado.

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXIS CORE                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Auth    │ │ Tenants  │ │ Billing  │ │  Plugin  │        │
│  │  (NextAuth│ │  (CRUD,  │ │ (Stripe/ │ │ Registry │        │
│  │  /Custom)│ │  limites)│ │  Mercado)│ │          │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  TENANT A     │    │  TENANT B     │    │  TENANT C     │
│  (Pousada)    │    │  (Livraria)   │    │  (Restaurante)│
│               │    │               │    │               │
│ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │
│ │ Plugin    │ │    │ │ Plugin    │ │    │ │ Plugin    │ │
│ │ Pousadas  │ │    │ │ Livrarias │ │    │ │ Cardápio  │ │
│ └───────────┘ │    │ └───────────┘ │    │ └───────────┘ │
│ ┌───────────┐ │    │ ┌───────────┐ │    │ ┌───────────┐ │
│ │ Plugin    │ │    │ │ Plugin    │ │    │ │ Plugin    │ │
│ │ Site Inst │ │    │ │ Site Inst │ │    │ │ Site Inst │ │
│ └───────────┘ │    │ └───────────┘ │    │ └───────────┘ │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 1. Core (Nexis Kernel)

### Pacotes/Namespace
```
@nexis/core          # Kernel compartilhado
@nexis/auth          # Autenticação (NextAuth + RBAC)
@nexis/tenant        # Gestão de tenants, planos, limites
@nexis/billing       # Integração Stripe/Mercado Pago
@nexis/plugin        # Registry, loader, types, hooks
@nexis/ui            # Design system (Tech Minimal) + AdminKit
@nexis/db            # Prisma client + schema base + migrations
```

### Responsabilidades do Core
| Módulo | Responsabilidade |
|--------|------------------|
| **Auth** | Login, registro, magic link, SSO, roles (owner, admin, staff, viewer), sessão JWT/cookie |
| **Tenants** | CRUD tenant, slug único, domínio customizado, plano (free/starter/pro/enterprise), limites (sites, usuários, storage, API calls) |
| **Billing** | Assinaturas, trials, upgrades/downgrades, webhooks Stripe/MP, faturas, portal do cliente |
| **Plugin Registry** | Descoberta, validação, carregamento dinâmico, versionamento, marketplace futuro |
| **UI/Design System** | Tokens (cores, spacing, tipografia), componentes base, AdminKit, DemoArt, tema por tenant |
| **DB** | Prisma schema base (User, Tenant, Plan, Subscription, AuditLog), multi-schema ou row-level security |

---

## 2. Plugin System (Cada Demo = Plugin)

### Estrutura de um Plugin
```
plugins/
├── pousadas/
│   ├── package.json          # name: "@nexis/plugin-pousadas", version, peerDependencies
│   ├── plugin.ts             # Entry point: metadata, routes, admin, db, hooks
│   ├── prisma/
│   │   └── schema.prisma     # Models específicos (Room, Reservation, Amenity)
│   ├── app/
│   │   ├── (public)/         # Rotas públicas do site da pousada
│   │   └── (admin)/          # Rotas admin do plugin
│   ├── components/           # Componentes específicos (AvailabilityCalendar, etc.)
│   ├── hooks/                # useAvailability, useReservations
│   ├── types/                # Types TypeScript exportados
│   └── seeds/                # Dados demo para novo tenant
├── livrarias/
├── cardapio-digital/
├── catalogo-digital/
├── site-institucional/
├── gestao-empresarial/
└── gestao-rh/
```

### Interface do Plugin (`plugin.ts`)
```typescript
import type { Plugin } from "@nexis/plugin";

export const pousadasPlugin: Plugin = {
  // Metadados
  id: "pousadas",
  name: "Sistema para Pousadas",
  version: "1.0.0",
  description: "Disponibilidade, reservas, hóspedes, relatórios",
  category: "hospitality",
  icon: "🏨",
  
  // Requisitos
  requires: ["@nexis/core", "@nexis/ui"],
  permissions: ["db:write", "api:public", "admin:access"],
  
  // Schema Prisma (merge automático no tenant)
  prisma: {
    models: ["Room", "Reservation", "Amenity", "Guest"],
    seed: "./seeds/pousadas.ts",
  },
  
  // Rotas públicas (site do tenant)
  publicRoutes: [
    { path: "/", component: "HomePage" },
    { path: "/quartos", component: "RoomsPage" },
    { path: "/reserva", component: "BookingPage" },
    { path: "/disponibilidade", component: "AvailabilityPage" },
  ],
  
  // Rotas admin (painel do tenant)
  adminRoutes: [
    { path: "/quartos", component: "RoomsAdmin", nav: "Acomodações" },
    { path: "/reservas", component: "ReservationsAdmin", nav: "Reservas" },
    { path: "/hospedes", component: "GuestsAdmin", nav: "Hóspedes" },
    { path: "/relatorios", component: "ReportsAdmin", nav: "Relatórios" },
  ],
  
  // Configuração padrão por tenant
  defaultConfig: {
    checkInTime: "14:00",
    checkOutTime: "11:00",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
  },
  
  // Hooks de ciclo de vida
  hooks: {
    onInstall: async (tenantId) => { /* cria dados seed */ },
    onUninstall: async (tenantId) => { /* limpa dados */ },
    onTenantCreate: async (tenant) => { /* config inicial */ },
  },
};
```

---

## 3. Database Schema (Multi-Tenant)

### Estratégia: **Row-Level Security (RLS) + Tenant ID em todas as tabelas**
> Prisma não suporta RLS nativo → implementamos via middleware Prisma + policies Postgres, ou single-schema com `tenantId` obrigatório.

```prisma
// packages/db/prisma/schema.prisma

// ===== CORE =====
model Tenant {
  id            String   @id @default(cuid())
  slug          String   @unique          // pousada-arandis
  name          String   @db.VarChar(120)
  domain        String?  @unique          // pousadaarandis.com.br
  planId        String
  plan          Plan     @relation(fields: [planId], references: [id])
  status        TenantStatus @default(ACTIVE)
  settings      Json     @default("{}")   // config global do tenant
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  users         User[]
  sites         Site[]
  plugins       TenantPlugin[]
  subscriptions Subscription[]
  
  @@index([slug])
  @@index([domain])
}

model Plan {
  id          String   @id @default(cuid())
  key         String   @unique             // free, starter, pro, enterprise
  name        String
  priceMonthly Int     // em centavos
  priceYearly  Int?
  limits      Json     // { sites: 1, users: 5, storageMb: 100, apiCalls: 10000 }
  features    String[] // ["custom-domain", "white-label", "api-access"]
  stripePriceId String?
  activo      Boolean  @default(true)
  
  tenants     Tenant[]
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  passwordHash  String?
  role          UserRole @default(STAFF)      // OWNER, ADMIN, STAFF, VIEWER
  avatarUrl     String?
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([tenantId])
  @@index([email])
}

enum TenantStatus { ACTIVE, SUSPENDED, TRIAL, CANCELLED }
enum UserRole { OWNER, ADMIN, STAFF, VIEWER }

// ===== PLUGIN: POUSADAS =====
model Room {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name        String
  slug        String
  description String?
  priceCents  Int
  capacity    Int
  sizeSqm     Int?
  artVariant  String?  // "room", "room-warm", "beach-wide"
  amenities   String[] // ["wifi", "breakfast", "pool"]
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reservations Reservation[]
  
  @@unique([tenantId, slug])
  @@index([tenantId, active])
}

model Reservation {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  roomId        String
  room          Room     @relation(fields: [roomId], references: [id])
  guestName     String
  guestEmail    String
  guestPhone    String?
  checkIn       DateTime
  checkOut      DateTime
  adults        Int
  children      Int      @default(0)
  totalCents    Int
  status        ReservationStatus @default(PENDING)
  source        String   @default("direct") // direct, whatsapp, booking.com
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([tenantId, status])
  @@index([tenantId, checkIn, checkOut])
  @@index([roomId, checkIn, checkOut])
}

enum ReservationStatus { PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW }

model Amenity {
  id        String @id @default(cuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  key       String // "wifi", "breakfast", "pool"
  label     String
  icon      String
  sortOrder Int    @default(0)
  
  @@unique([tenantId, key])
}

model Guest {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name      String
  email     String
  phone     String?
  document  String?  // CPF
  notes     String?
  stays     Int      @default(0)
  totalSpentCents Int @default(0)
  lastStay  DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([tenantId, email])
  @@index([tenantId, name])
}

// ===== PLUGIN: LIVRARIAS =====
model Book {
  id          String @id @default(cuid())
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  title       String
  author      String
  isbn        String?
  category    String
  priceCents  Int
  stock       Int    @default(0)
  coverUrl    String?
  colors      String[] // gradiente da capa
  synopsis    String?
  year        Int?
  active      Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  orderItems  OrderItem[]
  
  @@index([tenantId, category, active])
}

model Category {
  id        String @id @default(cuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name      String
  slug      String
  sortOrder Int    @default(0)
  
  @@unique([tenantId, slug])
}

model Order {
  id            String @id @default(cuid())
  tenantId      String
  tenant        Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  code          String // "LC-ABC12"
  customerName  String
  customerEmail String
  customerPhone String?
  items         OrderItem[]
  totalCents    Int
  status        OrderStatus @default(NEW)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([tenantId, code])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
}

enum OrderStatus { NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED }

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  bookId    String
  book      Book   @relation(fields: [bookId], references: [id])
  qty       Int
  priceCents Int   // snapshot do preço no momento
  
  @@unique([orderId, bookId])
}

// ===== PLUGIN: CARDÁPIO DIGITAL =====
model Table {
  id        String @id @default(cuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  number    Int
  name      String? // "Varanda", "Salão Principal"
  qrCode    String @unique // token único para URL pública
  capacity  Int    @default(4)
  active    Boolean @default(true)
  
  orders    Order[]
  
  @@unique([tenantId, number])
}

model MenuCategory {
  id        String @id @default(cuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name      String
  slug      String
  sortOrder Int    @default(0)
  active    Boolean @default(true)
  
  items     MenuItem[]
  
  @@unique([tenantId, slug])
}

model MenuItem {
  id          String @id @default(cuid())
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  categoryId  String
  category    MenuCategory @relation(fields: [categoryId], references: [id])
  name        String
  description String?
  priceCents  Int
  imageUrl    String?
  allergens   String[] // ["gluten", "lactose", "nuts"]
  vegan       Boolean @default(false)
  vegetarian  Boolean @default(false)
  spicy       Boolean @default(false)
  available   Boolean @default(true)
  sortOrder   Int    @default(0)
  
  orderItems  OrderItem[]
  
  @@index([tenantId, categoryId, available])
}

model TableOrder {
  id          String @id @default(cuid())
  tenantId    String
  tenant      Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tableId     String
  table       Table  @relation(fields: [tableId], references: [id])
  code        String // "MESA-12-ABC"
  items       TableOrderItem[]
  totalCents  Int
  status      TableOrderStatus @default(RECEIVED)
  customerName String?
  customerPhone String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tenantId, status])
  @@index([tenantId, tableId, createdAt])
}

enum TableOrderStatus { RECEIVED, PREPARING, READY, DELIVERED, CANCELLED }

model TableOrderItem {
  id          String @id @default(cuid())
  orderId     String
  order       TableOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId  String
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id])
  qty         Int
  priceCents  Int
  notes       String? // "sem cebola", "bem passado"
}

// ===== AUDITORIA =====
model AuditLog {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String   // "room.created", "reservation.confirmed"
  entity    String   // "Room", "Reservation"
  entityId  String
  before    Json?
  after     Json?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
  
  @@index([tenantId, createdAt])
  @@index([tenantId, entity, entityId])
}
```

---

## 4. API Routes Unificadas (App Router)

```
app/
├── api/
│   ├── auth/                    # NextAuth handlers
│   ├── tenants/
│   │   ├── [tenantId]/
│   │   │   ├── route.ts         # GET/PUT/DELETE tenant
│   │   │   ├── plugins/         # Instala/remove plugins
│   │   │   ├── users/           # Gestão de usuários do tenant
│   │   │   ├── settings/        # Configurações do tenant
│   │   │   └── billing/         # Portal Stripe, faturas
│   ├── plugins/
│   │   ├── [pluginId]/
│   │   │   ├── route.ts         # Metadados do plugin
│   │   │   ├── install/         # POST - instala no tenant
│   │   │   └── uninstall/       # POST - remove do tenant
│   └── webhooks/
│       ├── stripe/
│       └── mercadopago/
├── (platform)/                  # Plataforma Nexis (super-admin)
│   ├── dashboard/
│   ├── tenants/
│   ├── billing/
│   └── plugins/
├── (tenant)/                    # Sites dos tenants (slug-based)
│   ├── [slug]/
│   │   ├── layout.tsx           # Carrega tenant + plugins ativos
│   │   ├── page.tsx             # Home do site
│   │   ├── [...slug]/           # Rotas dos plugins públicos
│   │   └── admin/               # Admin do tenant (protegido)
│   │       ├── layout.tsx       # Verifica permissão + carrega plugins admin
│   │       ├── page.tsx         # Dashboard
│   │       └── [...plugin]/     # Rotas admin dos plugins
```

### Middleware de Tenant (`middleware.ts`)
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTenantBySlug, getTenantByDomain } from "@nexis/tenant";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  
  // Plataforma (nexisdigital.com.br) → pula tenant resolution
  if (hostname === process.env.PLATFORM_DOMAIN) {
    return NextResponse.next();
  }
  
  // Subdomínio: tenant.nexisdigital.com.br
  const subdomain = hostname.replace(`.${process.env.PLATFORM_DOMAIN}`, "");
  if (subdomain !== hostname) {
    const tenant = await getTenantBySlug(subdomain);
    if (tenant) return rewriteToTenant(request, tenant.slug);
  }
  
  // Domínio customizado: pousadaarandis.com.br
  const tenant = await getTenantByDomain(hostname);
  if (tenant) return rewriteToTenant(request, tenant.slug);
  
  // Fallback: path-based /pousada-arandis/...
  const slugMatch = pathname.match(/^\/([^/]+)/);
  if (slugMatch) {
    const tenant = await getTenantBySlug(slugMatch[1]);
    if (tenant) return rewriteToTenant(request, tenant.slug);
  }
  
  // Não encontrado → landing page da plataforma
  return NextResponse.rewrite(new URL("/", request.url));
}

function rewriteToTenant(request: NextRequest, slug: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
```

---

## 5. Admin Unificado (Por Tenant)

### Layout Admin (`app/(tenant)/[slug]/admin/layout.tsx`)
```tsx
import { TenantAdminLayout } from "@nexis/ui/admin";
import { getActivePlugins } from "@nexis/plugin/server";

export default async function AdminLayout({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const plugins = await getActivePlugins(slug); // ["pousadas", "site-institucional"]
  
  const navItems = plugins.flatMap((pluginId) => {
    const plugin = pluginRegistry.get(pluginId);
    return plugin?.adminRoutes.map((r) => ({
      ...r,
      href: `/${slug}/admin/${r.path}`,
      plugin: pluginId,
    })) || [];
  });
  
  return (
    <TenantAdminLayout
      tenantSlug={slug}
      navItems={navItems}
      user={await getCurrentUser()}
    >
      {children}
    </TenantAdminLayout>
  );
}
```

### Plugin Registry (Carregamento Dinâmico)
```typescript
// @nexis/plugin/registry.ts
const pluginRegistry = new Map<string, Plugin>();

export async function loadPlugin(pluginId: string): Promise<Plugin> {
  if (pluginRegistry.has(pluginId)) return pluginRegistry.get(pluginId)!;
  
  // Dynamic import (webpack/next.js chunk splitting)
  const module = await import(`@nexis/plugin-${pluginId}/plugin`);
  const plugin = module.default || module[`${pluginId}Plugin`];
  
  validatePlugin(plugin);
  pluginRegistry.set(pluginId, plugin);
  return plugin;
}

export async function getActivePlugins(tenantSlug: string): Promise<string[]> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { plugins: { where: { active: true }, select: { pluginId: true } } },
  });
  return tenant?.plugins.map((p) => p.pluginId) || [];
}
```

---

## 6. Deploy Strategy

### Opção A: **Monorepo (Turborepo) + Vercel** — Recomendado para começar
```
nexisdigital/
├── apps/
│   ├── platform/          # Next.js app (platform.nexisdigital.com.br)
│   └── tenant/            # Next.js app (sites dos tenants)
├── packages/
│   ├── core/
│   ├── auth/
│   ├── tenant/
│   ├── billing/
│   ├── plugin/
│   ├── ui/
│   └── db/
├── plugins/               # Cada plugin = package independente
│   ├── pousadas/
│   ├── livrarias/
│   └── ...
├── turbo.json
└── package.json
```

- **Vercel**: Deploy `platform` + `tenant` como projetos separados
- **Domínios**: `platform.nexisdigital.com.br` + wildcard `*.nexisdigital.com.br` + domínios customizados
- **Banco**: Postgres (Neon / Supabase / Railway) com connection pooling
- **Cache**: Redis (Upstash) para sessões, rate limiting, plugin registry

### Opção B: **Kubernetes (self-hosted)** — Para escala enterprise
- Cada tenant = namespace isolado
- Plugin registry = Helm charts / ArgoCD
- Multi-cluster para multi-region

---

## 7. Roadmap de Implementação

| Fase | Entregável | Esforço |
|------|------------|---------|
| **0. Fundação** | Monorepo Turborepo, `@nexis/db` (Prisma), `@nexis/auth` (NextAuth), `@nexis/ui` (Design System) | 2-3 semanas |
| **1. Core Multi-Tenant** | Tenant CRUD, middleware slug/domain, RLS básico, Planos/Limites | 2 semanas |
| **2. Plugin System** | Registry, dynamic import, install/uninstall hooks, seed automático | 2 semanas |
| **3. Migração Plugins** | Converter 7 demos atuais → plugins (pousadas, livrarias, cardapio, catalogo, site, gestao-emp, gestao-rh) | 3-4 semanas |
| **4. Admin Unificado** | Layout dinâmico, navegação por plugin, RBAC, auditoria | 2 semanas |
| **5. Billing** | Stripe + Mercado Pago, webhooks, portal cliente, trials, upgrades | 2 semanas |
| **6. Domínios Custom** | DNS validation, SSL auto (Vercel/Cloudflare), redirect www/apex | 1 semana |
| **7. Observabilidade** | Logs estruturados, métricas (Prometheus/Grafana), alertas, Sentry | 1 semana |
| **8. Marketplace (futuro)** | Plugin store, reviews, versionamento, revenue share | — |

---

## 8. Decisões Técnicas Pendentes

| Tópico | Opções | Recomendação |
|--------|--------|--------------|
| **Isolamento DB** | RLS (Postgres) vs Schema por tenant vs Database por tenant | **RLS + tenantId** (simples, custo baixo, escala bem até ~10k tenants) |
| **Auth** | NextAuth v5 (Auth.js) vs Clerk vs Custom JWT | **NextAuth v5** (já no ecossistema, flexível, gratuito) |
| **Plugin Loading** | Dynamic `import()` (build-time chunks) vs Module Federation (runtime) | **Dynamic import** (simples, Next.js nativo, chunk splitting automático) |
| **State Sync (Admin ↔ Site)** | Polling vs SSE vs WebSocket vs tRPC subscriptions | **SSE** (simples, HTTP/2, funciona no edge, reconexão nativa) |
| **File Storage** | S3/R2 (signed URLs) vs Vercel Blob vs Local (dev) | **S3/R2** (portável, barato, signed URLs para upload direto) |
| **Queue/Jobs** | Inngest vs BullMQ (Redis) vs Vercel Cron | **Inngest** (serverless, durável, tipo TypeScript, gratuito até 1M/mês) |

---

## 9. Próximos Passos Imediatos

1. **Criar monorepo Turborepo** com estrutura `apps/` + `packages/` + `plugins/`
2. **Extrair `@nexis/ui`** (Design System + AdminKit + DemoArt) para package compartilhado
3. **Criar `@nexis/db`** com schema Prisma base (Tenant, User, Plan, AuditLog)
4. **Implementar `@nexis/auth`** com NextAuth v5 + RBAC + middleware de tenant
4. **Converter `pousadas`** para primeiro plugin (prova de conceito)
5. **Validar fluxo completo**: cria tenant → instala plugin → acessa site + admin

---

> **Nota:** Este documento é vivo. Atualize conforme decisões técnicas forem tomadas.