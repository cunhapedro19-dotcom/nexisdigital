import { PrismaClient, TenantStatus, PlanInterval, UserRole, SubscriptionProvider, SubscriptionStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Criar Planos
  const starterPlan = await prisma.plan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "Starter",
      slug: "starter",
      description: "Ideal para começar — 1 site, até 5 usuários",
      priceCents: 9900, // R$ 99,00/mês
      interval: PlanInterval.MONTHLY,
      features: {
        maxUsers: 5,
        maxPlugins: 2,
        customDomain: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
      },
      limits: {
        maxOrdersPerMonth: 500,
        maxStorageMB: 500,
        maxApiCallsPerDay: 1000,
      },
      sortOrder: 1,
    },
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { slug: "professional" },
    update: {},
    create: {
      name: "Professional",
      slug: "professional",
      description: "Para negócios em crescimento — 3 sites, até 20 usuários",
      priceCents: 29900, // R$ 299,00/mês
      interval: PlanInterval.MONTHLY,
      features: {
        maxUsers: 20,
        maxPlugins: 5,
        customDomain: true,
        apiAccess: true,
        prioritySupport: true,
        whiteLabel: false,
      },
      limits: {
        maxOrdersPerMonth: 5000,
        maxStorageMB: 5000,
        maxApiCallsPerDay: 50000,
      },
      sortOrder: 2,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      slug: "enterprise",
      description: "Para grandes operações — sites e usuários ilimitados",
      priceCents: 79900, // R$ 799,00/mês
      interval: PlanInterval.MONTHLY,
      features: {
        maxUsers: -1, // ilimitado
        maxPlugins: -1,
        customDomain: true,
        apiAccess: true,
        prioritySupport: true,
        whiteLabel: true,
        dedicatedSupport: true,
        sla: "99.9%",
      },
      limits: {
        maxOrdersPerMonth: -1,
        maxStorageMB: -1,
        maxApiCallsPerDay: -1,
      },
      sortOrder: 3,
    },
  });

  console.log("✅ Planos criados:", { starter: starterPlan.id, professional: professionalPlan.id, enterprise: enterprisePlan.id });

  // 2. Criar Tenant de demonstração
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      slug: "demo",
      name: "Nexis Demo",
      domain: "demo.nexisdigital.com.br",
      primaryColor: "#06b6d4",
      secondaryColor: "#fbbf24",
      settings: {
        features: {
          pousadas: true,
          livrarias: true,
          cardapio: true,
          catalogo: true,
          siteInstitucional: true,
          gestaoEmpresarial: true,
          gestaoRh: true,
        },
        layout: "modern",
        locale: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
      status: TenantStatus.ACTIVE,
      planId: professionalPlan.id,
    },
  });

  console.log("✅ Tenant demo criado:", demoTenant.id);

  // 3. Criar usuário admin demo
  const passwordHash = await hash("demo123456", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nexisdigital.com.br" },
    update: {},
    create: {
      email: "admin@nexisdigital.com.br",
      name: "Admin Nexis",
      passwordHash,
      role: UserRole.OWNER,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Usuário admin criado:", adminUser.id);

  // 4. Associar usuário ao tenant demo como OWNER
  await prisma.membership.upsert({
    where: {
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: demoTenant.id,
      },
    },
    update: { role: UserRole.OWNER },
    create: {
      userId: adminUser.id,
      tenantId: demoTenant.id,
      role: UserRole.OWNER,
    },
  });

  console.log("✅ Membership OWNER criada");

  // 5. Criar subscription ativa para tenant demo
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { providerSubId: "demo_sub_001" },
    update: {},
    create: {
      tenantId: demoTenant.id,
      planId: professionalPlan.id,
      provider: SubscriptionProvider.MANUAL,
      providerSubId: "demo_sub_001",
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  console.log("✅ Subscription ativa criada");

  // 6. Seed de dados de demonstração para Pousadas
  await seedPousadas(demoTenant.id);

  // 7. Seed de dados de demonstração para Livrarias
  await seedLivrarias(demoTenant.id);

  // 8. Seed de dados de demonstração para Cardápio
  await seedCardapio(demoTenant.id);

  // 9. Seed de dados de demonstração para Catálogo
  await seedCatalogo(demoTenant.id);

  // 10. Seed de dados para Site Institucional
  await seedSiteInstitucional(demoTenant.id);

  // 11. Seed de dados para Gestão Empresarial
  await seedGestaoEmpresarial(demoTenant.id);

  // 12. Seed de dados para Gestão RH
  await seedGestaoRH(demoTenant.id);

  console.log("🎉 Seed concluído com sucesso!");
}

async function seedPousadas(tenantId: string) {
  // Criar PluginData entries para quartos
  const room1PluginData = await prisma.pluginData.create({
    data: {
      tenantId,
      pluginKey: "pousadas",
      entity: "room",
      entityId: "room_001",
      data: {
        name: "Suíte Master Vista Mar",
        description: "Suíte ampla com varanda privativa e vista panorâmica para o mar. Cama king, banheira de hidromassagem, ar-condicionado split, smart TV 55\", frigobar e café da manhã incluso.",
        capacity: 2,
        basePriceCents: 68000, // R$ 680,00
        amenities: ["Vista mar", "Varanda privativa", "Hidromassagem", "Ar-condicionado", "Smart TV 55\"", "Frigobar", "Café da manhã", "Wi-Fi", "Roupão e chinelos"],
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
        ],
        isActive: true,
        sortOrder: 1,
      },
    },
  });

  const room2PluginData = await prisma.pluginData.create({
    data: {
      tenantId,
      pluginKey: "pousadas",
      entity: "room",
      entityId: "room_002",
      data: {
        name: "Bangalô Jardim",
        description: "Bangalô charmoso cercado por jardins tropicais. Cama queen, rede na varanda, ventilador de teto, TV, frigobar e café da manhã incluso.",
        capacity: 3,
        basePriceCents: 42000, // R$ 420,00
        amenities: ["Jardim tropical", "Varanda com rede", "Ventilador de teto", "TV", "Frigobar", "Café da manhã", "Wi-Fi"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        ],
        isActive: true,
        sortOrder: 2,
      },
    },
  });

  const room3PluginData = await prisma.pluginData.create({
    data: {
      tenantId,
      pluginKey: "pousadas",
      entity: "room",
      entityId: "room_003",
      data: {
        name: "Quarto Standard",
        description: "Quarto aconchegante com cama de casal, ar-condicionado, TV, frigobar e café da manhã incluso. Ideal para casais.",
        capacity: 2,
        basePriceCents: 28000, // R$ 280,00
        amenities: ["Cama de casal", "Ar-condicionado", "TV", "Frigobar", "Café da manhã", "Wi-Fi"],
        images: [
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
        ],
        isActive: true,
        sortOrder: 3,
      },
    },
  });

  // Criar modelos PousadaRoom referenciando PluginData
  await prisma.pousadaRoom.createMany({
    data: [
      { tenantId, pluginDataId: room1PluginData.id, name: "Suíte Master Vista Mar", description: "Suíte ampla com varanda privativa e vista panorâmica para o mar.", capacity: 2, basePriceCents: 68000, amenities: ["Vista mar", "Varanda privativa", "Hidromassagem", "Ar-condicionado", "Smart TV 55\"", "Frigobar", "Café da manhã", "Wi-Fi", "Roupão e chinelos"], images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800"], isActive: true, sortOrder: 1 },
      { tenantId, pluginDataId: room2PluginData.id, name: "Bangalô Jardim", description: "Bangalô charmoso cercado por jardins tropicais.", capacity: 3, basePriceCents: 42000, amenities: ["Jardim tropical", "Varanda com rede", "Ventilador de teto", "TV", "Frigobar", "Café da manhã", "Wi-Fi"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"], isActive: true, sortOrder: 2 },
      { tenantId, pluginDataId: room3PluginData.id, name: "Quarto Standard", description: "Quarto aconchegante com cama de casal.", capacity: 2, basePriceCents: 28000, amenities: ["Cama de casal", "Ar-condicionado", "TV", "Frigobar", "Café da manhã", "Wi-Fi"], images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"], isActive: true, sortOrder: 3 },
    ],
    skipDuplicates: true,
  });

  // Criar disponibilidade para os próximos 60 dias
  const rooms = await prisma.pousadaRoom.findMany({ where: { tenantId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const room of rooms) {
    const availabilities = [];
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      // Bloquear alguns dias aleatórios para demonstração
      const isBlocked = [5, 12, 19, 26, 33, 40, 47, 54].includes(i);
      availabilities.push({
        tenantId,
        roomId: room.id,
        date,
        isBlocked,
        priceOverrideCents: isBlocked ? null : room.basePriceCents + (i % 7 === 5 || i % 7 === 6 ? 5000 : 0), // fim de semana +R$50
      });
    }
    await prisma.availability.createMany({ data: availabilities, skipDuplicates: true });
  }

  console.log("✅ Pousadas seed: quartos e disponibilidade criados");
}

async function seedLivrarias(tenantId: string) {
  // Categorias
  const categories = await prisma.bookstoreCategory.createMany({
    data: [
      { tenantId, name: "Ficção Científica", slug: "ficcao-cientifica", sortOrder: 1 },
      { tenantId, name: "Fantasia", slug: "fantasia", sortOrder: 2 },
      { tenantId, name: "Romance", slug: "romance", sortOrder: 3 },
      { tenantId, name: "Não-Ficção", slug: "nao-ficcao", sortOrder: 4 },
      { tenantId, name: "Infantojuvenil", slug: "infantojuvenil", sortOrder: 5 },
      { tenantId, name: "Mangás & HQs", slug: "mangas-hqs", sortOrder: 6 },
    ],
    skipDuplicates: true,
  });

  const catMap = await prisma.bookstoreCategory.findMany({ where: { tenantId } });
  const catBySlug = Object.fromEntries(catMap.map((c) => [c.slug, c.id]));

  // Livros
  const books = [
    {
      isbn: "9788535914849",
      title: "Duna",
      author: "Frank Herbert",
      publisher: "Aleph",
      categoryId: catBySlug["ficcao-cientifica"],
      category: "Ficção Científica",
      description: "Clássico da ficção científica, vencedor dos prêmios Hugo e Nebula. Em um futuro distante, o controle da especiaria melange dita o destino do universo.",
      priceCents: 8990,
      costCents: 4500,
      stock: 15,
      minStock: 3,
      images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
    },
    {
      isbn: "9788533614849",
      title: "O Senhor dos Anéis: A Sociedade do Anel",
      author: "J.R.R. Tolkien",
      publisher: "HarperCollins",
      categoryId: catBySlug["fantasia"],
      category: "Fantasia",
      description: "Primeiro volume da trilogia épica que definiu a fantasia moderna. Frodo Bolseiro herda o Um Anel e deve levá-lo à Montanha da Perdição.",
      priceCents: 7990,
      costCents: 4000,
      stock: 22,
      minStock: 5,
      images: ["https://images.unsplash.com/photo-1543002588-bfa7400247e8?w=400"],
    },
    {
      isbn: "9788501115678",
      title: "Orgulho e Preconceito",
      author: "Jane Austen",
      publisher: "Penguin Classics",
      categoryId: catBySlug["romance"],
      category: "Romance",
      description: "Um dos romances mais amados da literatura inglesa. Elizabeth Bennet e Mr. Darcy navegam pelas convenções sociais da Inglaterra do século XIX.",
      priceCents: 5490,
      costCents: 2800,
      stock: 30,
      minStock: 5,
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
    },
    {
      isbn: "9788535929843",
      title: "Sapiens: Uma Breve História da Humanidade",
      author: "Yuval Noah Harari",
      publisher: "Companhia das Letras",
      categoryId: catBySlug["nao-ficcao"],
      category: "Não-Ficção",
      description: "Bestseller mundial que percorre a história da humanidade desde o surgimento do Homo sapiens até os dias atuais.",
      priceCents: 9490,
      costCents: 4800,
      stock: 18,
      minStock: 3,
      images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"],
    },
    {
      isbn: "9788574067890",
      title: "O Pequeno Príncipe",
      author: "Antoine de Saint-Exupéry",
      publisher: "Agir",
      categoryId: catBySlug["infantojuvenil"],
      category: "Infantojuvenil",
      description: "Clássico atemporal sobre amizade, amor e o essencial que é invisível aos olhos. Ilustrado pelo autor.",
      priceCents: 4290,
      costCents: 2200,
      stock: 40,
      minStock: 8,
      images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400"],
    },
    {
      isbn: "9788542621849",
      title: "One Piece Vol. 1",
      author: "Eiichiro Oda",
      publisher: "Panini",
      categoryId: catBySlug["mangas-hqs"],
      category: "Mangás & HQs",
      description: "O início da jornada de Monkey D. Luffy em busca do tesouro One Piece e do título de Rei dos Piratas.",
      priceCents: 3490,
      costCents: 1800,
      stock: 50,
      minStock: 10,
      images: ["https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400"],
    },
  ];

  for (const book of books) {
    await prisma.bookstoreBook.upsert({
      where: { isbn: book.isbn },
      update: { ...book, tenantId },
      create: { ...book, tenantId },
    });
  }

  console.log("✅ Livrarias seed: categorias e livros criados");
}

async function seedCardapio(tenantId: string) {
  // Categorias
  const categories = await prisma.menuCategory.createMany({
    data: [
      { tenantId, name: "Entradas", slug: "entradas", description: "Para começar bem a refeição", sortOrder: 1 },
      { tenantId, name: "Pratos Principais", slug: "pratos-principais", description: "Nossos pratos principais", sortOrder: 2 },
      { tenantId, name: "Sobremesas", slug: "sobremesas", description: "Finalize com doçura", sortOrder: 3 },
      { tenantId, name: "Bebidas", slug: "bebidas", description: "Refresque-se", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  const catMap = await prisma.menuCategory.findMany({ where: { tenantId } });
  const catBySlug = Object.fromEntries(catMap.map((c) => [c.slug, c.id]));

  // Itens do cardápio
  const items = [
    { categoryId: catBySlug["entradas"], name: "Bruschetta Clássica", description: "Pão italiano grelhado com tomate, manjericão, alho e azeite extra virgem", priceCents: 2800, image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400", isFeatured: true, allergens: ["gluten"], tags: ["vegetarian"], prepTimeMin: 10, sortOrder: 1 },
    { categoryId: catBySlug["entradas"], name: "Carpaccio de Carne", description: "Finas fatias de carne crua com rúcula, parmesão e molho mostarda e mel", priceCents: 4200, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400", allergens: ["lactose"], tags: [], prepTimeMin: 12, sortOrder: 2 },
    { categoryId: catBySlug["pratos-principais"], name: "Risoto de Camarão", description: "Arroz arbório cremoso com camarões frescos, limão siciliano e ervas", priceCents: 6800, image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400", isFeatured: true, allergens: ["crustaceans", "lactose"], tags: [], prepTimeMin: 25, sortOrder: 1 },
    { categoryId: catBySlug["pratos-principais"], name: "Filé Mignon com Molho Madeira", description: "Medalhão de filé mignon grelhado com molho madeira, batatas rústicas e legumes", priceCents: 7500, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", allergens: ["lactose"], tags: ["chef-special"], prepTimeMin: 30, sortOrder: 2 },
    { categoryId: catBySlug["pratos-principais"], name: "Moqueca Baiana", description: "Peixe branco cozido no dendê com pimentões, tomate, cebola, coentro e leite de coco. Acompanha arroz branco e farofa", priceCents: 7200, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400", allergens: ["fish"], tags: ["spicy", "regional"], prepTimeMin: 35, sortOrder: 3 },
    { categoryId: catBySlug["sobremesas"], name: "Petit Gateau", description: "Bolo de chocolate com centro cremoso, servido com sorvete de baunilha e calda de frutas vermelhas", priceCents: 2400, image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400", isFeatured: true, allergens: ["gluten", "lactose", "eggs"], tags: [], prepTimeMin: 15, sortOrder: 1 },
    { categoryId: catBySlug["sobremesas"], name: "Pudim de Leite Condensado", description: "Receita tradicional da casa, textura cremosa e calda de caramelo", priceCents: 1800, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", allergens: ["lactose", "eggs"], tags: ["traditional"], prepTimeMin: 5, sortOrder: 2 },
    { categoryId: catBySlug["bebidas"], name: "Caipirinha Tradicional", description: "Cachaça premium, limão, açúcar e gelo", priceCents: 1800, image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400", allergens: [], tags: ["alcoholic"], prepTimeMin: 3, sortOrder: 1 },
    { categoryId: catBySlug["bebidas"], name: "Suco Natural de Maracujá", description: "Polpa de maracujá fresco batida na hora", priceCents: 1200, image: "https://images.unsplash.com/photo-1613476222224-3b3899533d2a?w=400", allergens: [], tags: ["non-alcoholic", "healthy"], prepTimeMin: 2, sortOrder: 2 },
    { categoryId: catBySlug["bebidas"], name: "Cerveja Artesanal IPA", description: "India Pale Ale 6,5% ABV, 350ml", priceCents: 1600, image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400", allergens: ["gluten"], tags: ["alcoholic"], prepTimeMin: 1, sortOrder: 3 },
  ];

  for (const item of items) {
    await prisma.menuItem.create({
      data: { ...item, tenantId },
    });
  }

  console.log("✅ Cardápio seed: categorias e itens criados");
}

async function seedCatalogo(tenantId: string) {
  const products = [
    {
      sku: "CAM-001",
      name: "Camiseta Básica Premium",
      description: "100% algodão orgânico, fio 30.1, pré-encolhida. Corte reto, gola redonda reforçada.",
      category: "Camisetas",
      priceCents: 8990,
      compareAtCents: 11990,
      costCents: 3500,
      stock: 100,
      trackStock: true,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
      variants: [{ name: "Cor", values: ["Preto", "Branco", "Cinza", "Azul Marinho", "Verde Oliva"] }, { name: "Tamanho", values: ["PP", "P", "M", "G", "GG", "XG"] }],
      seoTitle: "Camiseta Básica Premium 100% Algodão Orgânico",
      seoDescription: "Camiseta básica de alta qualidade, sustentável e durável. Várias cores e tamanhos.",
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      sku: "CAM-002",
      name: "Camiseta Estampada \"Código\"",
      description: "Estampa exclusiva com código fonte minimalista. Algodão 100%, toque macio.",
      category: "Camisetas",
      priceCents: 9990,
      costCents: 4000,
      stock: 50,
      trackStock: true,
      images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400"],
      variants: [{ name: "Cor", values: ["Preto", "Branco"] }, { name: "Tamanho", values: ["P", "M", "G", "GG"] }],
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      sku: "MOLE-001",
      name: "Moletom Canguru Premium",
      description: "Moletom felpado 50% algodão / 50% poliéster reciclado. Capuz forrado, bolso canguru, punhos e barra canelados.",
      category: "Moletons",
      priceCents: 18990,
      compareAtCents: 22990,
      costCents: 8500,
      stock: 30,
      trackStock: true,
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"],
      variants: [{ name: "Cor", values: ["Preto", "Cinza Mescla", "Azul Marinho"] }, { name: "Tamanho", values: ["P", "M", "G", "GG"] }],
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
    },
    {
      sku: "BON-001",
      name: "Boné Trucker \"Nexis\"",
      description: "Boné estilo trucker com tela traseira, aba curva, fecho snapback. Bordado frontal em alto relevo.",
      category: "Acessórios",
      priceCents: 5990,
      costCents: 2200,
      stock: 80,
      trackStock: true,
      images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400"],
      variants: [{ name: "Cor", values: ["Preto", "Branco", "Azul Marinho", "Verde Oliva"] }],
      isActive: true,
      isFeatured: false,
      sortOrder: 4,
    },
    {
      sku: "MOC-001",
      name: "Mochila Urban 25L",
      description: "Mochila resistente à água, compartimento para notebook 15.6\", bolsos organizadores, alças acolchoadas, painel traseiro ventilado.",
      category: "Acessórios",
      priceCents: 24990,
      costCents: 11000,
      stock: 15,
      trackStock: true,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
      variants: [{ name: "Cor", values: ["Preto", "Cinza Grafite", "Azul Marinho"] }],
      isActive: true,
      isFeatured: true,
      sortOrder: 5,
    },
  ];

  for (const product of products) {
    await prisma.catalogProduct.upsert({
      where: { sku_tenantId: { sku: product.sku, tenantId } },
      update: { ...product, tenantId },
      create: { ...product, tenantId },
    });
  }

  console.log("✅ Catálogo seed: produtos criados");
}

async function seedSiteInstitucional(tenantId: string) {
  const homePage = await prisma.sitePage.upsert({
    where: { slug_tenantId: { slug: "/", tenantId } },
    update: {},
    create: {
      tenantId,
      slug: "/",
      title: "Início",
      content: [
        { type: "hero", data: { headline: "Nexis Digital", subheadline: "Soluções digitais para o seu negócio crescer", ctaText: "Conheça nossos produtos", ctaLink: "/solucoes", background: "gradient" } },
        { type: "features", data: { title: "Nossas Soluções", items: [{ icon: "bed", title: "Pousadas", description: "Gestão completa de hospedagem" }, { icon: "book", title: "Livrarias", description: "E-commerce de livros integrado" }, { icon: "utensils", title: "Cardápio", description: "Pedidos digitais para restaurantes" }, { icon: "package", title: "Catálogo", description: "Vitrine virtual de produtos" }] } },
        { type: "cta", data: { title: "Pronto para começar?", description: "Agende uma demonstração gratuita", buttonText: "Falar com especialista", buttonLink: "/contato" } },
      ],
      seoTitle: "Nexis Digital - Soluções Digitais para Negócios",
      seoDescription: "Plataforma completa para gestão de pousadas, livrarias, restaurantes, catálogos e sites institucionais. Automatize seu negócio.",
      isPublished: true,
      isHome: true,
      sortOrder: 1,
    },
  });

  await prisma.sitePage.upsert({
    where: { slug_tenantId: { slug: "/sobre", tenantId } },
    update: {},
    create: {
      tenantId,
      slug: "/sobre",
      title: "Sobre Nós",
      content: [
        { type: "hero", data: { headline: "Sobre a Nexis Digital", subheadline: "Tecnologia brasileira para negócios brasileiros" } },
        { type: "rich-text", data: { content: "Fundada em 2024, a Nexis Digital nasceu da necessidade de pequenas e médias empresas brasileiras terem acesso a ferramentas digitais de nível enterprise, sem a complexidade e o custo das soluções tradicionais." } },
        { type: "features", data: { title: "Nossos Valores", items: [{ icon: "shield", title: "Confiabilidade", description: "Sistemas estáveis e seguros" }, { icon: "zap", title: "Inovação", description: "Tecnologia de ponta acessível" }, { icon: "heart", title: "Empatia", description: "Entendemos seu negócio" }] } },
      ],
      seoTitle: "Sobre a Nexis Digital",
      seoDescription: "Conheça a história e os valores da Nexis Digital, plataforma brasileira de soluções digitais para negócios.",
      isPublished: true,
      sortOrder: 2,
    },
  });

  await prisma.sitePage.upsert({
    where: { slug_tenantId: { slug: "/contato", tenantId } },
    update: {},
    create: {
      tenantId,
      slug: "/contato",
      title: "Contato",
      content: [
        { type: "hero", data: { headline: "Fale Conosco", subheadline: "Estamos prontos para ajudar seu negócio a crescer" } },
        { type: "contact", data: { email: "contato@nexisdigital.com.br", phone: "(11) 99999-9999", address: "São Paulo, SP - Brasil", formFields: ["name", "email", "company", "message"] } },
      ],
      seoTitle: "Contato - Nexis Digital",
      seoDescription: "Entre em contato com a equipe Nexis Digital. Agende uma demonstração ou tire suas dúvidas.",
      isPublished: true,
      sortOrder: 3,
    },
  });

  console.log("✅ Site Institucional seed: páginas criadas");
}

async function seedGestaoEmpresarial(tenantId: string) {
  // Empresa
  await prisma.company.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      name: "Nexis Digital Ltda",
      tradeName: "Nexis Digital",
      cnpj: "12345678000195",
      ie: "123456789",
      address: { street: "Av. Paulista", number: "1000", complement: "10º andar", neighborhood: "Bela Vista", city: "São Paulo", state: "SP", zip: "01310100" },
      phone: "(11) 99999-9999",
      email: "contato@nexisdigital.com.br",
      website: "https://nexisdigital.com.br",
      regime: "SIMPLES_NACIONAL",
    },
  });

  // Clientes
  const customers = [
    { name: "Pousada Mar Azul Ltda", tradeName: "Pousada Mar Azul", document: "11222333000181", documentType: "CNPJ", email: "contato@pousadamarazul.com.br", phone: "(11) 3333-4444", address: { street: "Rua das Ondas", number: "100", city: "Ubatuba", state: "SP", zip: "11680000" } },
    { name: "Livraria Saber & Cultura", tradeName: "Livraria Saber", document: "22333444000172", documentType: "CNPJ", email: "vendas@livrariasaber.com.br", phone: "(11) 2222-3333", address: { street: "Rua dos Livros", number: "50", city: "São Paulo", state: "SP", zip: "01000000" } },
    { name: "Restaurante Sabor Caseiro", tradeName: "Sabor Caseiro", document: "33444555000163", documentType: "CNPJ", email: "gerencia@saborcaseiro.com.br", phone: "(11) 4444-5555", address: { street: "Av. das Delícias", number: "200", city: "Campinas", state: "SP", zip: "13010000" } },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { document_tenantId: { document: c.document, tenantId } },
      update: { ...c, tenantId },
      create: { ...c, tenantId },
    });
  }

  console.log("✅ Gestão Empresarial seed: empresa e clientes criados");
}

async function seedGestaoRH(tenantId: string) {
  // Funcionários
  const employees = [
    { employeeId: "EMP001", name: "Maria Silva Santos", cpf: "11122233344", email: "maria.santos@nexisdigital.com.br", phone: "(11) 98888-1111", birthDate: new Date("1990-03-15"), hireDate: new Date("2022-01-10"), department: "Tecnologia", position: "Desenvolvedora Senior", salaryCents: 1500000, workSchedule: "CLT_40H", status: "ACTIVE", bankInfo: { bank: "341", agency: "1234", account: "56789-0", pixKey: "maria.santos@nexisdigital.com.br" }, address: { street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234000" }, documents: { rg: "123456789", cnh: "12345678901", ctps: "12345678901", pis: "12345678901" } },
    { employeeId: "EMP002", name: "João Pedro Oliveira", cpf: "22233344455", email: "joao.oliveira@nexisdigital.com.br", phone: "(11) 97777-2222", birthDate: new Date("1988-07-22"), hireDate: new Date("2021-06-15"), department: "Tecnologia", position: "Tech Lead", salaryCents: 1800000, workSchedule: "CLT_40H", status: "ACTIVE", bankInfo: { bank: "237", agency: "5678", account: "90123-4", pixKey: "joao.oliveira@nexisdigital.com.br" }, address: { street: "Av. Brasil", number: "456", city: "São Paulo", state: "SP", zip: "01430000" }, documents: { rg: "987654321", cnh: "98765432109", ctps: "98765432109", pis: "98765432109" } },
    { employeeId: "EMP003", name: "Ana Carolina Costa", cpf: "33344455566", email: "ana.costa@nexisdigital.com.br", phone: "(11) 96666-3333", birthDate: new Date("1992-11-08"), hireDate: new Date("2023-03-01"), department: "Design", position: "UX Designer", salaryCents: 1200000, workSchedule: "CLT_40H", status: "ACTIVE", bankInfo: { bank: "001", agency: "9012", account: "34567-8", pixKey: "ana.costa@nexisdigital.com.br" }, address: { street: "Rua Augusta", number: "789", city: "São Paulo", state: "SP", zip: "01305000" }, documents: { rg: "456789123", cnh: "45678912345", ctps: "45678912345", pis: "45678912345" } },
    { employeeId: "EMP004", name: "Carlos Eduardo Lima", cpf: "44455566677", email: "carlos.lima@nexisdigital.com.br", phone: "(11) 95555-4444", birthDate: new Date("1985-01-30"), hireDate: new Date("2020-09-01"), department: "Comercial", position: "Gerente de Vendas", salaryCents: 1400000, workSchedule: "CLT_44H", status: "ACTIVE", bankInfo: { bank: "104", agency: "3456", account: "78901-2", pixKey: "carlos.lima@nexisdigital.com.br" }, address: { street: "Rua Oscar Freire", number: "321", city: "São Paulo", state: "SP", zip: "01426000" }, documents: { rg: "789123456", cnh: "78912345678", ctps: "78912345678", pis: "78912345678" } },
    { employeeId: "EMP005", name: "Fernanda Alves Rocha", cpf: "55566677788", email: "fernanda.rocha@nexisdigital.com.br", phone: "(11) 94444-5555", birthDate: new Date("1995-05-17"), hireDate: new Date("2024-01-15"), department: "RH", position: "Analista de RH", salaryCents: 800000, workSchedule: "CLT_40H", status: "ACTIVE", bankInfo: { bank: "389", agency: "7890", account: "12345-6", pixKey: "fernanda.rocha@nexisdigital.com.br" }, address: { street: "Alameda Santos", number: "654", city: "São Paulo", state: "SP", zip: "01418000" }, documents: { rg: "321654987", cnh: "32165498765", ctps: "32165498765", pis: "32165498765" } },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { cpf_tenantId: { cpf: emp.cpf, tenantId } },
      update: { ...emp, tenantId },
      create: { ...emp, tenantId },
    });
  }

  console.log("✅ Gestão RH seed: funcionários criados");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });