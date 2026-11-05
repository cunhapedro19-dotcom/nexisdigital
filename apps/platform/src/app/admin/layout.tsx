import Link from "next/link";
import { Store, Building2, CreditCard, Puzzle } from "lucide-react";

/**
 * Layout do admin da plataforma (super-admin Nexis).
 * TODO: proteção de rota via sessão (PLATFORM_ADMIN) — @nexis/auth middleware
 */

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Store },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/plugins", label: "Plugins", icon: Puzzle },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="flex h-16 items-center px-6 border-b border-[var(--border-default)]">
          <Link href="/" className="font-semibold text-[var(--text-primary)]">
            Nexis <span className="text-[var(--text-accent)]">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1" aria-label="Navegação do admin">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--semantic-ghost-bg-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cyan)]"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {/* Nav mobile */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 h-14" aria-label="Navegação do admin (mobile)">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
