export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  emoji: string;
  gradient: string;
}

export const CATALOG_CATEGORIES = [
  "Todos",
  "Camisetas",
  "Moletons",
  "Bonés",
  "Acessórios",
] as const;

// Dados de demonstração. Loja fictícia.
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "p1",
    name: "Camiseta Essentials",
    price: 89.9,
    category: "Camisetas",
    description: "Algodão 100%, corte regular, várias cores.",
    emoji: "👕",
    gradient: "from-slate-500/30 to-zinc-500/10",
  },
  {
    id: "p2",
    name: "Camiseta Oversized",
    price: 119.9,
    category: "Camisetas",
    description: "Modelagem ampla, barra reta, estampa frontal.",
    emoji: "👕",
    gradient: "from-indigo-500/30 to-violet-500/10",
  },
  {
    id: "p3",
    name: "Moletom Canguro",
    price: 229.9,
    category: "Moletons",
    description: "Peluciado, capuz com cordão, bolso canguro.",
    emoji: "🧥",
    gradient: "from-zinc-500/30 to-slate-600/10",
  },
  {
    id: "p4",
    name: "Moletom Careca",
    price: 199.9,
    category: "Moletons",
    description: "Gola careca, punhos canelados, conforto térmico.",
    emoji: "🧥",
    gradient: "from-stone-500/30 to-neutral-500/10",
  },
  {
    id: "p5",
    name: "Boné Trucker",
    price: 79.9,
    category: "Bonés",
    description: "Aba reta, ajuste traseiro, tela respirável.",
    emoji: "🧢",
    gradient: "from-amber-500/30 to-orange-500/10",
  },
  {
    id: "p6",
    name: "Boné Dad Hat",
    price: 69.9,
    category: "Bonés",
    description: "Aba curva, algodão lavado, ajuste metal.",
    emoji: "🧢",
    gradient: "from-rose-500/30 to-pink-500/10",
  },
  {
    id: "p7",
    name: "Bolsa Tote",
    price: 99.9,
    category: "Acessórios",
    description: "Lona resistente, alça reforçada, bolso interno.",
    emoji: "👜",
    gradient: "from-emerald-500/30 to-teal-500/10",
  },
  {
    id: "p8",
    name: "Meia Pack x3",
    price: 49.9,
    category: "Acessórios",
    description: "Kit com 3 pares, algodão com elastano.",
    emoji: "🧦",
    gradient: "from-sky-500/30 to-blue-500/10",
  },
];
