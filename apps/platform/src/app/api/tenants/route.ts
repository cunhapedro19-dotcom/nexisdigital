import { NextRequest, NextResponse } from "next/server";
import { tenantService, createTenantSchema } from "@nexis/tenant/server";

/**
 * GET /api/tenants — listar tenants (admin da plataforma)
 * TODO: proteger com sessão (role PLATFORM_ADMIN) via @nexis/auth
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await tenantService.listTenants({ page, limit, status, search });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/tenants]", error);
    return NextResponse.json({ error: "Erro ao listar tenants" }, { status: 500 });
  }
}

/**
 * POST /api/tenants — criar tenant (onboarding)
 * TODO: exigir autenticação; userId vem da sessão
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTenantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // TODO: ownerUserId da sessão real (NextAuth). Placeholder enquanto auth não está ligada.
    const ownerUserId = body.ownerUserId;
    if (!ownerUserId) {
      return NextResponse.json({ error: "ownerUserId é obrigatório" }, { status: 400 });
    }

    const result = await tenantService.createTenant(parsed.data, ownerUserId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar tenant";
    const conflict = /já em uso|não encontrado/i.test(message);
    console.error("[POST /api/tenants]", error);
    return NextResponse.json({ error: message }, { status: conflict ? 409 : 500 });
  }
}
