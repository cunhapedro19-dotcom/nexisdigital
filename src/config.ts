// Configuração centralizada da Nexis Digital.
// Edite os valores abaixo para atualizar marca, contato e preferências visuais.

export const BRAND = {
  name: "Nexis Digital",
  tagline: "Sites, plataformas e sistemas sob medida.",
  shortDescription:
    "Desenvolvemos sites, plataformas e sistemas personalizados para transformar necessidades empresariais em soluções práticas.",
  email: "contato@nexisdigital.com.br",
  // Número de WhatsApp comercial em formato internacional (sem "+" ou espaços).
  // Pode ser sobrescrito via variável NEXT_PUBLIC_WHATSAPP.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5511999990000",
  // Se true, os links de WhatsApp abrem o app; se false, mostram aviso de número não configurado.
  whatsappConfigured: Boolean(
    (process.env.NEXT_PUBLIC_WHATSAPP ?? "5511999990000") &&
      (process.env.NEXT_PUBLIC_WHATSAPP ?? "5511999990000").length >= 8,
  ),
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
