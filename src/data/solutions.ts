export type SolutionKind = "demo" | "exemplo" | "sob-medida";

export interface Solution {
  slug: string;
  title: string;
  short: string;
  problem: string;
  description: string;
  kind: SolutionKind;
  kindLabel: string;
  emoji: string;
  gradient: string; // tailwind gradient classes
  href: string;
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "catalogo-digital",
    title: "Catálogos digitais",
    short: "Vitrine online com produtos, busca e pedidos pelo WhatsApp.",
    problem: "Seu negócio precisa mostrar produtos e receber pedidos sem depender apenas de redes sociais.",
    description:
      "Catálogo online com categorias, busca, carrinho e finalização de pedido direcionada ao WhatsApp da sua equipe.",
    kind: "demo",
    kindLabel: "Demonstração funcional",
    emoji: "🛍️",
    gradient: "from-fuchsia-500/30 to-violet-500/20",
    href: "/solucoes/catalogo-digital",
  },
  {
    slug: "cardapio-digital",
    title: "Cardápios digitais",
    short: "Cardápio interativo com adicionais, carrinho e envio de pedido.",
    problem: "Atendimento por mensagem é lento e sujeito a erros na hora de anotar pedidos.",
    description:
      "Cardápio digital com categorias, adicionais, carrinho e envio do pedido formatado para o WhatsApp do estabelecimento.",
    kind: "demo",
    kindLabel: "Demonstração funcional",
    emoji: "🍔",
    gradient: "from-amber-500/30 to-rose-500/20",
    href: "/solucoes/cardapio-digital",
  },
  {
    slug: "gestao-empresarial",
    title: "Gestão empresarial",
    short: "Vendas, estoque, clientes e relatórios em um painel simples.",
    problem: "Planilhas espalhadas e falta de visibilidade sobre vendas, estoque e clientes.",
    description:
      "Sistema administrativo com dashboard, cadastro de produtos, controle de estoque, clientes, vendas e relatórios.",
    kind: "demo",
    kindLabel: "Demonstração funcional",
    emoji: "📊",
    gradient: "from-sky-500/30 to-indigo-500/20",
    href: "/solucoes/gestao-empresarial",
  },
  {
    slug: "gestao-rh",
    title: "Gestão de RH",
    short: "Colaboradores, departamentos, férias e indicadores básicos.",
    problem: "Controle de colaboradores e férias feito em planilhas gera retrabalho e falhas.",
    description:
      "Aplicação para cadastro de colaboradores, departamentos, cargos, férias e indicadores de equipe.",
    kind: "demo",
    kindLabel: "Demonstração funcional",
    emoji: "👥",
    gradient: "from-emerald-500/30 to-teal-500/20",
    href: "/solucoes/gestao-rh",
  },
  {
    slug: "site-institucional",
    title: "Sites institucionais",
    short: "Apresentação profissional da sua empresa, serviços e contato.",
    problem: "Sua empresa ainda não tem um site próprio para apresentar serviços e captar clientes.",
    description:
      "Site institucional com apresentação, serviços, portfólio, depoimentos e formulário de contato.",
    kind: "exemplo",
    kindLabel: "Exemplo visual",
    emoji: "🏢",
    gradient: "from-slate-400/25 to-zinc-500/15",
    href: "/solucoes/site-institucional",
  },
  {
    slug: "pousadas",
    title: "Sites para pousadas",
    short: "Galeria, acomodações e solicitação de reserva pelo WhatsApp.",
    problem: "Hóspedes procuram fotos, acomodações e um jeito rápido de solicitar reserva.",
    description:
      "Site para pousadas com galeria, tipos de acomodação, comodidades e solicitação de reserva pelo WhatsApp.",
    kind: "exemplo",
    kindLabel: "Exemplo visual",
    emoji: "🏖️",
    gradient: "from-cyan-500/30 to-blue-500/20",
    href: "/solucoes/pousadas",
  },
  {
    slug: "livrarias",
    title: "Sistemas para livrarias",
    short: "Catálogo de livros, busca e pedidos pelo WhatsApp.",
    problem: "Livrarias precisam de um catálogo organizado e de um canal de pedidos ágil.",
    description:
      "Catálogo de livros com capas, autores, categorias, busca, carrinho e pedido direcionado ao WhatsApp.",
    kind: "demo",
    kindLabel: "Demonstração funcional",
    emoji: "📚",
    gradient: "from-orange-500/30 to-red-500/20",
    href: "/solucoes/livrarias",
  },
];

export function getSolutionBySlug(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
