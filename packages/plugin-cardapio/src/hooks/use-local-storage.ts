"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook para sincronização de localStorage entre abas
 */

type SetValue<T> = T | ((prev: T) => T);

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: SetValue<T>) => {
    if (typeof window === "undefined") return;
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new StorageEvent("local-storage", { key, newValue: JSON.stringify(valueToStore) }));
    } catch (error) {
      console.warn(`Erro ao definir localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new StorageEvent("local-storage", { key, newValue: null }));
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue !== null ? JSON.parse(event.newValue) : initialValue);
        } catch (error) {
          console.warn(`Erro ao parsear localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}