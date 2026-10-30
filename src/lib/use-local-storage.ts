"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook simples de persistência em localStorage com valor inicial.
 * Hidrata o estado somente no cliente para evitar hidratação divergente.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<{ value: T; hydrated: boolean }>({
    value: initial,
    hydrated: false,
  });
  const value = state.value;
  const hydrated = state.hydrated;

  useEffect(() => {
    let stored: T | undefined;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        stored = JSON.parse(raw) as T;
      }
    } catch {
      // ignora erro de parse e usa o valor inicial
    }
    // Hidratação deferida (rAF): evita setState síncrono no corpo do
    // efeito, que causaria cascata de renders.
    const raf = requestAnimationFrame(() =>
      setState((s) => ({ value: stored ?? s.value, hydrated: true })),
    );
    return () => cancelAnimationFrame(raf);
  }, [key]);

  const persist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((s) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(s.value) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage cheio ou indisponível: ignora
        }
        return { value: resolved, hydrated: s.hydrated };
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignora
    }
    setState((s) => ({ value: initial, hydrated: s.hydrated }));
  }, [key, initial]);

  return { value, setValue: persist, reset, hydrated } as const;
}
