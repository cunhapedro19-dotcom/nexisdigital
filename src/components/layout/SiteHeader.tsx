"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND, NAV } from "@/config";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${BRAND.name} — Início`}>
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
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
                )}
                {item.label}
              </Link>
            );
          })}
          <span className="mx-2 h-4 w-px bg-white/10" />
          <Link
            href="/contato"
            className="group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 text-sm font-medium text-white transition hover:border-violet-400/60 hover:bg-violet-500/20"
          >
            <span className="relative z-10">Iniciar projeto</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-0.5">→</span>
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
                className="rounded-lg px-3 py-3 text-sm text-nx-text hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contato"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500"
            >
              Iniciar projeto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
