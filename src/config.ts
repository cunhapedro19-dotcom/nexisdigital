// Configuração centralizada da Nexis Digital.
// Edite os valores abaixo para atualizar marca, contato e preferências visuais.

// Número de WhatsApp comercial em formato internacional (sem "+" ou espaços).
// Configure via variável de ambiente NEXT_PUBLIC_WHATSAPP (ver .env.example).
// Enquanto não houver número configurado, o site usa o e-mail como canal
// de contato — nenhum número fictício é exibido.
const rawWhatsapp = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");

export const BRAND = {
  name: "Nexis Digital",
  tagline: "Sites, plataformas e sistemas sob medida.",
  shortDescription:
    "Desenvolvemos sites, plataformas e sistemas personalizados para transformar necessidades empresariais em soluções práticas.",
  email: "contato@nexisdigital.com.br",
  whatsapp: rawWhatsapp,
  // true somente quando um número real foi configurado via ambiente.
  whatsappConfigured: rawWhatsapp.length >= 12 && rawWhatsapp.startsWith("55"),
  location: "Atendimento remoto em todo o Brasil",
  year: new Date().getFullYear(),
};

export const THEME = {
  primary: "#7c3aed", // roxo de destaque
  primaryHover: "#6d28d9",
  background: "#0b0b12",
  surface: "#111119",
  surfaceAlt: "#16161f",
  border: "#25252f",
};

export const NAV = [
  { href: "/", label: "Início" },
  { href: "/solucoes", label: "Soluções" },
  { href: "/contato", label: "Contato" },
];

// URL pública do site (canônicas, Open Graph, sitemap).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexisdigital.com.br"
).replace(/\/$/, "");
