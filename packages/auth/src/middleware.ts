import { auth } from "./server.js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware NextAuth v5 para proteção de rotas e multi-tenancy
 * - Protege rotas /dashboard/*, /admin/*, /api/protected/*
 * - Resolve tenant via subdomain ou cookie
 * - Injeta headers para uso em Server Components
 */

const PROTECTED_PATHS = ["/dashboard", "/admin", "/api/protected"];
const PUBLIC_PATHS = ["/auth/signin", "/auth/error", "/auth/welcome", "/api/auth"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Permitir rotas públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Proteger rotas autenticadas
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl.origin));
  }

  // Resolver tenant via subdomain (para apps/tenant)
  // tenant.slug.nexisdigital.com.br -> extrair slug
  const hostname = req.headers.get("host") || "";
  const platformDomain = process.env.PLATFORM_DOMAIN || "localhost:3000";

  // Se está no domínio da plataforma (não subdomain), não fazer nada
  if (hostname === platformDomain || hostname.startsWith("localhost")) {
    return NextResponse.next();
  }

  // Extrair subdomain: tenant.slug.platform.com
  const subdomain = hostname.replace(`.${platformDomain}`, "");
  if (subdomain && subdomain !== "www" && subdomain !== platformDomain) {
    // Validar se tenant existe e está ativo
    // Nota: em middleware não temos acesso direto ao Prisma
    // Fazemos via edge function ou header para o server component
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", subdomain);
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};