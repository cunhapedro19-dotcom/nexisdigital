import Link from "next/link";
import { BRAND, NAV } from "@/config";
import { SOLUTIONS } from "@/data/solutions";
import { formatPhone } from "@/lib/whatsapp";
import { YearNow } from "@/components/layout/YearNow";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      <div className="absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg">
                <span className="absolute inset-0 bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-700" />
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
                <span className="relative font-display text-sm font-semibold text-white">N</span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-display text-[15px] font-medium tracking-tight">
                  {BRAND.name}
                </span>
                <span className="nx-mono text-[9px] uppercase tracking-[0.2em] text-nx-dim">
                  digital.studio
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-nx-muted">
              {BRAND.shortDescription}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`mailto:${BRAND.email}`}
                className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-nx-muted transition hover:border-white/20 hover:text-white"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
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
