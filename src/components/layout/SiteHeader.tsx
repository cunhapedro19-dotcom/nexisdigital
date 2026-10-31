"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND, NAV } from "@/config";

// Logotipo raster (fornecido pelo cliente). Caminho com basePath para
// funcionar no GitHub Pages (/nexisdigital).
const LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo-white.png`;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Estado inicial calculado fora do corpo do efeito (deferido via rAF).
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/5 bg-nx-bg/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label={`${BRAND.name} — Início`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo fixo no public; next/image não otimiza nada relevante em export estático */}
          <img
            src={LOGO}
            alt={`${BRAND.name} logo`}
            className="h-8 w-auto"
          />
          <span className="hidden h-5 w-px bg-white/10 sm:block" aria-hidden />
          <span className="nx-mono hidden text-[10px] uppercase tracking-[0.2em] text-nx-dim sm:block">
            digital.studio
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "text-white" : "text-nx-muted hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-white/70" />
                )}
                {item.label}
              </Link>
            );
          })}
          <span className="mx-2 h-4 w-px bg-white/10" />
          <Link
            href="/contato"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85"
          >
            Iniciar projeto
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </nav>

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-nx-text md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative h-3 w-4">
            <span
              className={`absolute left-0 block h-px w-4 bg-current transition-transform ${
                open ? "translate-y-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-px w-4 bg-current transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-4 bg-current transition-transform ${
                open ? "translate-y-0 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-nx-bg/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-nx-text hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contato"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-black hover:bg-white/85"
            >
              Iniciar projeto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
