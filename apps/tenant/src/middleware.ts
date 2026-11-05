import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de resolução de tenant (deploy Vercel, single-app).
 * 1. Subdomínio: pousada-joao.nexisdigital.com.br → /pousada-joao/...
 * 2. Domínio custom: pousadajoao.com.br → busca em header x-nexis-tenant
 *    (resolvido pelo edge config / Vercel Domain API em produção)
 * 3. Path-based já funciona nativamente (/pousada-joao/...)
 */
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || "localhost:3000";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Platform domain → não reescreve
  if (hostname === PLATFORM_DOMAIN || hostname.startsWith("localhost:")) {
    return NextResponse.next();
  }

  // Subdomínio do platform domain
  const suffix = `.${PLATFORM_DOMAIN}`;
  if (hostname.endsWith(suffix)) {
    const subdomain = hostname.slice(0, -suffix.length);
    if (subdomain && subdomain !== "www" && subdomain !== "app") {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Domínio custom → header injetado pela infra (Vercel/Cloudflare)
  const customTenant = request.headers.get("x-nexis-tenant");
  if (customTenant) {
    const url = request.nextUrl.clone();
    url.pathname = `/${customTenant}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
