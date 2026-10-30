import Link from "next/link";
import { BRAND, NAV } from "@/config";
import { SOLUTIONS } from "@/data/solutions";
import { formatPhone } from "@/lib/whatsapp";
import { YearNow } from "@/components/layout/YearNow";

// Logotipo raster (fornecido pelo cliente). Caminho com basePath para
// funcionar no GitHub Pages (/nexisdigital).
const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo-white.png`;

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-white/10">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo fixo no public; next/image não otimiza nada relevante em export estático */}
            <img
              src={LOGO}
              alt={`${BRAND.name} logo`}
              className="h-10 w-auto"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-nx-muted">
              {BRAND.shortDescription}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-nx-muted transition hover:border-white/20 hover:text-white"
              >
                {BRAND.email}
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
              Navegação
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-nx-muted transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-nx-dim">
              Soluções
            </p>
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {SOLUTIONS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={s.href}
                    className="group inline-flex items-center gap-1.5 text-nx-muted transition hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-violet-400/60 transition group-hover:bg-violet-300" />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-6 text-xs text-nx-dim sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="nx-mono">© <YearNow fallback={BRAND.year} /></span>
            <span>{BRAND.name}. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4 nx-mono text-[10px] uppercase tracking-[0.16em]">
            <span>{BRAND.location}</span>
            <span className="h-3 w-px bg-white/10" />
            <span>+{BRAND.whatsapp.slice(0, 2)} · {formatPhone(BRAND.whatsapp).slice(3)}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
