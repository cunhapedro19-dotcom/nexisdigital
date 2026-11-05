"use client";

/**
 * @nexis/plugin-site-institucional
 * Plugin de Site Institucional - Páginas com Blocos, Serviços, Equipe, Blog, Contato, Admin
 */

export * from "./types";
export * from "./utils/helpers";

// Tipos de plugin
export interface SiteInstitucionalPluginConfig {
  tenantId: string;
  settings: import("./types").SiteSettings;
  pages: import("./types").SitePage[];
  services: import("./types").Service[];
  team: import("./types").TeamMember[];
  posts: import("./types").BlogPost[];
}

export interface SiteInstitucionalPluginInstance {
  instanceId: string;
  tenantId: string;
  config: SiteInstitucionalPluginConfig;

  // Páginas
  getPage: (slug: string) => Promise<import("./types").SitePage | null>;
  getPages: (publishedOnly?: boolean) => Promise<import("./types").SitePage[]>;
  savePage: (page: import("./types").SitePage) => Promise<import("./types").SitePage>;
  deletePage: (id: string) => Promise<void>;

  // Serviços
  getServices: () => Promise<import("./types").Service[]>;
  saveService: (service: import("./types").Service) => Promise<import("./types").Service>;
  deleteService: (id: string) => Promise<void>;

  // Equipe
  getTeam: () => Promise<import("./types").TeamMember[]>;
  saveTeamMember: (member: import("./types").TeamMember) => Promise<import("./types").TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;

  // Blog
  getPosts: (publishedOnly?: boolean) => Promise<import("./types").BlogPost[]>;
  getPost: (slug: string) => Promise<import("./types").BlogPost | null>;
  savePost: (post: import("./types").BlogPost) => Promise<import("./types").BlogPost>;
  deletePost: (id: string) => Promise<void>;

  // Contato
  sendMessage: (data: Omit<import("./types").ContactMessage, "id" | "isRead" | "createdAt">) => Promise<void>;
  getMessages: (unreadOnly?: boolean) => Promise<import("./types").ContactMessage[]>;
  markAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Configurações
  updateSettings: (data: Partial<import("./types").SiteSettings>) => Promise<import("./types").SiteSettings>;
}

// Páginas
export { default as SiteInstitucionalPage } from "./pages/SiteInstitucionalPage";

// Admin
export { default as SiteInstitucionalAdmin } from "./admin/SiteInstitucionalAdmin";

// Componentes
export { BlockRenderer } from "./components/PageBlocks";

// Tipos para integração com plataforma
export type {
  PageBlock,
  PageBlockType,
  SitePage,
  Service,
  TeamMember,
  Testimonial,
  BlogPost,
  ContactMessage,
  SiteSettings,
} from "./types";
