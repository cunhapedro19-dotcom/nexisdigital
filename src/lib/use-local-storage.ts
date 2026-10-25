"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook simples de persistência em localStorage com valor inicial.
 * Hidrata o estado somente no cliente para evitar hidratação divergente.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignora erro de parse e usa o valor inicial
    }
    setHydrated(true);
  }, [key]);

  const persist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage cheio ou indisponível: ignora
        }
        return resolved;
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
    setValue(initial);
  }, [key, initial]);

  return { value, setValue: persist, reset, hydrated } as const;
}
