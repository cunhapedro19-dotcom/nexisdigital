"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { currencyBRL } from "@/lib/cn";

/**
 * Widget de vitrine que espelha, ao vivo, os dados da demonstração de
 * gestão empresarial (armazenados em localStorage pela demo).
 *
 * Propósito: mostrar ao visitante que o painel é real e persistente —
 * os números mudam conforme ele interage com a demo e voltam na próxima
 * visita. Fica em silêncio (estado neutro) quando nada foi alterado.
 */

interface ErpProduct {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

interface ErpSale {
  id: string;
  date: string;
  total: number;
  items: Array<{ qty: number }>;
}

const KEYS = {
  products: "nexis:erp:products",
  sales: "nexis:erp:sales",
} as const;

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function LiveGestaoWidget() {
  const [stats, setStats] = useState<{
    products: number;
    lowStock: number;
    sales: number;
    revenue: number;
    customized: boolean;
  } | null>(null);

  useEffect(() => {
    function read() {
      const products = readJSON<ErpProduct[]>(KEYS.products);
      const sales = readJSON<ErpSale[]>(KEYS.sales);
      if (!products && !sales) {
        setStats(null);
        return;
      }
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const salesMonth = (sales ?? []).filter(
        (s) => new Date(s.date).getTime() >= monthStart.getTime(),
      );
      setStats({
        products: products?.length ?? 0,
        lowStock: (products ?? []).filter((p) => p.stock <= p.minStock).length,
        sales: salesMonth.length,
        revenue: salesMonth.reduce((s, x) => s + x.total, 0),
        // "customizado" = o visitante já mexeu na demo (dados divergem do seed
        // apenas se existirem; a demo persiste no primeiro uso também).
        customized: Boolean(products || sales),
      });
    }
    // Leitura deferida (rAF) para não competir com a hidratação.
    const raf = requestAnimationFrame(read);
    // Atualiza ao voltar de outra aba/página da demo.
    window.addEventListener("storage", read);
    const interval = window.setInterval(read, 4000);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("storage", read);
      window.clearInterval(interval);
    };
  }, []);

  if (!stats) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-nx-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-md">
          <p className="nx-mono text-[10px] uppercase tracking-[0.2em] text-sky-300">
            ao vivo · ligado à demonstração
          </p>
          <h3 className="nx-display mt-3 text-xl font-medium tracking-tight sm:text-2xl">
            O painel de gestão é real — e ele lembra de você.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-nx-muted">
            Estes números vêm diretamente da demonstração de gestão
            empresarial, salva no seu navegador. Abra o painel, registre
            vendas e veja os valores refletidos aqui.
          </p>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-3 sm:min-w-[300px] sm:grid-cols-4">
          <div className="rounded-xl bg-white/[0.04] p-3">
            <dt className="nx-mono text-[9px] uppercase tracking-widest text-nx-dim">
              produtos
            </dt>
            <dd className="nx-display mt-1 text-xl font-medium">{stats.products}</dd>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <dt className="nx-mono text-[9px] uppercase tracking-widest text-nx-dim">
              estoque baixo
            </dt>
            <dd
              className={`nx-display mt-1 text-xl font-medium ${
                stats.lowStock > 0 ? "text-amber-300" : ""
              }`}
            >
              {stats.lowStock}
            </dd>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <dt className="nx-mono text-[9px] uppercase tracking-widest text-nx-dim">
              vendas no mês
            </dt>
            <dd className="nx-display mt-1 text-xl font-medium">{stats.sales}</dd>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <dt className="nx-mono text-[9px] uppercase tracking-widest text-nx-dim">
              receita
            </dt>
            <dd className="nx-display mt-1 truncate text-xl font-medium text-sky-200">
              {currencyBRL(stats.revenue)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/solucoes/gestao-empresarial/"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-sky-400 px-4 text-sm font-semibold text-black transition hover:bg-sky-300"
        >
          Abrir painel de gestão
          <span>→</span>
        </Link>
        <span className="nx-mono text-[10px] uppercase tracking-widest text-nx-dim">
          dados locais · nada é enviado a servidores
        </span>
      </div>
    </div>
  );
}
