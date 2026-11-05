import { z } from "zod";

/**
 * @nexis/plugin-site-institucional — Tipos
 * Site institucional: páginas, serviços, equipe, depoimentos, blog, contato
 */

// =========================================================
// Schemas Zod
// =========================================================

export const PageBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    title: z.string(),
    subtitle: z.string().optional(),
    backgroundImage: z.string().url().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    align: z.enum(["left", "center"]).default("center"),
  }),
  z.object({
    type: z.literal("text"),
    heading: z.string().optional(),
    content: z.string(),
  }),
  z.object({
    type: z.literal("features"),
    heading: z.string().optional(),
    items: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string(),
    })).min(1),
  }),
  z.object({
    type: z.literal("gallery"),
    heading: z.string().optional(),
    images: z.array(z.string().url()).min(1),
  }),
  z.object({
    type: z.literal("testimonials"),
    heading: z.string().optional(),
    items: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
      company: z.string().optional(),
      text: z.string(),
      avatar: z.string().url().optional(),
    })).min(1),
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string(),
    description: z.string().optional(),
    buttonText: z.string(),
    buttonLink: z.string(),
  }),
  z.object({
    type: z.literal("contact-form"),
    heading: z.string().optional(),
    fields: z.array(z.enum(["name", "email", "phone", "subject", "message"])).default(["name", "email", "message"]),
    recipientEmail: z.string().email(),
  }),
  z.object({
    type: z.literal("stats"),
    items: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).min(1),
  }),
]);

export const SitePageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string().min(2),
  slug: z.string().min(1),
  blocks: z.array(PageBlockSchema).default([]),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().default(false),
  showInMenu: z.boolean().default(true),
  menuOrder: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ServiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string().min(2),
  description: z.string(),
  icon: z.string().optional(),
  price: z.number().int().min(0).optional(), // centavos, se aplicável
  priceNote: z.string().optional(),
  image: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const TeamMemberSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(2),
  role: z.string(),
  bio: z.string().optional(),
  photo: z.string().url().optional(),
  email: z.string().email().optional(),
  linkedin: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

export const TestimonialSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  text: z.string().min(10),
  rating: z.number().int().min(1).max(5).default(5),
  isPublished: z.boolean().default(true),
  createdAt: z.date(),
});

export const BlogPostSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string().min(2),
  slug: z.string().min(1),
  excerpt: z.string().max(200),
  content: z.string(),
  coverImage: z.string().url().optional(),
  author: z.string(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ContactMessageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
});

export const SiteSettingsSchema = z.object({
  companyName: z.string().min(2),
  tagline: z.string(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().default("#06b6d4"),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).default({}),
  seoTitle: z.string().optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).default([]),
  googleAnalyticsId: z.string().optional(),
  enableBlog: z.boolean().default(true),
  enableTeam: z.boolean().default(true),
  footerText: z.string().optional(),
});

// =========================================================
// Tipos inferidos
// =========================================================

export type PageBlock = z.infer<typeof PageBlockSchema>;
export type SitePage = z.infer<typeof SitePageSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type ContactMessage = z.infer<typeof ContactMessageSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;

export type PageBlockType = PageBlock["type"];
