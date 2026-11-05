"use server";

import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@nexis/db";
import { z } from "zod";
import { compare } from "bcryptjs";
import { getTenantFromRequest } from "./tenant.js";

/**
 * Configuração do NextAuth v5 (Auth.js)
 * Suporta: Credentials (email/senha), Google, GitHub
 * Multi-tenancy via tenantId no callback signIn
 */

// Validação de credenciais
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantSlug: z.string().optional(), // para login direto no tenant
});

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        tenantSlug: { label: "Tenant", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, tenantSlug } = parsed.data;

        // Buscar usuário
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              include: { tenant: true },
            },
          },
        });

        if (!user || !user.passwordHash) return null;

        // Verificar senha
        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        // Se tenantSlug fornecido, validar membership
        let activeTenantId: string | undefined;
        if (tenantSlug) {
          const membership = user.memberships.find(
            (m) => m.tenant.slug === tenantSlug && m.tenant.status === "ACTIVE"
          );
          if (!membership) return null;
          activeTenantId = membership.tenantId;
        } else if (user.memberships.length === 1) {
          // Auto-selecionar se só tem um tenant
          activeTenantId = user.memberships[0].tenantId;
        }
        // Se tem múltiplos tenants e não especificou, retorna user sem tenant
        // O cliente vai mostrar seletor de tenant

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          activeTenantId,
          memberships: user.memberships.map((m) => ({
            tenantId: m.tenantId,
            tenantSlug: m.tenant.slug,
            tenantName: m.tenant.name,
            role: m.role,
          })),
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // signIn: controlar acesso por tenant
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true;

      // Para OAuth, criar/atualizar usuário e membership
      const email = user.email;
      if (!email) return false;

      let dbUser = await prisma.user.findUnique({ where: { email } });

      if (!dbUser) {
        // Criar usuário novo
        dbUser = await prisma.user.create({
          data: {
            email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            role: "VIEWER", // default, será atualizado via membership
          },
        });
      } else {
        // Atualizar perfil
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            name: user.name ?? dbUser.name,
            image: user.image ?? dbUser.image,
            emailVerified: new Date(),
          },
        });
      }

      // Vincular account OAuth
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        update: {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        },
        create: {
          userId: dbUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          scope: account.scope,
          tokenType: account.token_type,
        },
      });

      return true;
    },

    // jwt: incluir tenantId, role, memberships no token
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.activeTenantId = (user as any).activeTenantId;
        token.memberships = (user as any).memberships;
      }

      // Atualizar token ao trocar de tenant (trigger = "update")
      if (trigger === "update" && session) {
        token.activeTenantId = session.activeTenantId;
        // Buscar role no tenant ativo
        const membership = token.memberships?.find(
          (m: any) => m.tenantId === session.activeTenantId
        );
        if (membership) {
          token.role = membership.role;
        }
      }

      return token;
    },

    // session: expor dados no useSession()
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
        activeTenantId: token.activeTenantId as string | undefined,
        memberships: token.memberships as any[],
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    newUser: "/auth/welcome", // primeiro login OAuth
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          tenantId: (user as any).activeTenantId || "unknown",
          userId: user.id,
          action: isNewUser ? "user.created" : "user.signed_in",
          entity: "User",
          entityId: user.id,
          after: { email: user.email, isNewUser },
        },
      });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // 24 horas
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-nexis-session" : "nexis-session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: process.env.COOKIE_DOMAIN,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};

// Exportar handlers para App Router
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);