"use client";

import { useEffect, useState } from "react";

/**
 * Ano corrente exibido no rodapé. O SSR/export entrega o ano do build
 * (fallback) e o cliente atualiza após a hidratação — evita um site
 * estático exibindo ano antigo depois da virada.
 */
export function YearNow({ fallback }: { fallback: number }) {
  const [year, setYear] = useState(fallback);

  useEffect(() => {
    // Deferido (rAF) para não disparar setState síncrono no corpo do efeito.
    const raf = requestAnimationFrame(() => setYear(new Date().getFullYear()));
    return () => cancelAnimationFrame(raf);
  }, []);

  return <>{year}</>;
}
