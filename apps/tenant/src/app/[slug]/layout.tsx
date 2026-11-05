import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tenantService } from "@nexis/tenant/server";
import { TenantTheme } from "./theme";
import "../globals.css";

/**
 * Layout do site do tenant.
 * Resolve o tenant pelo slug (/pousada-joao/...) e aplica o tema (white-label).
 * Em produção com domínios custom, o middleware reescreve o host para o slug.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await tenantService.getTenantBySlug(slug);
  if (!tenant) return { title: "Não encontrado" };

  const settings = (tenant.settings ?? {}) as { seo?: { defaultTitle?: string; defaultDescription?: string } };
  const title = settings.seo?.defaultTitle || tenant.name;
  const description =
    settings.seo?.defaultDescription || `Site oficial de ${tenant.name}, feito com Nexis Digital.`;

  return {
    title: { default: title, template: `%s | ${tenant.name}` },
    description,
    openGraph: {
      title,
      description,
      siteName: tenant.name,
      locale: "pt_BR",
      type: "website",
    },
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await tenantService.getTenantBySlug(slug);
  if (!tenant || tenant.status !== "ACTIVE") notFound();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <TenantTheme
          primaryColor={tenant.primaryColor}
          secondaryColor={tenant.secondaryColor}
          tenantName={tenant.name}
        >
          {children}
        </TenantTheme>
      </body>
    </html>
  );
}
