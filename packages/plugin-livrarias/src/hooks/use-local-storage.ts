"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook para sincronização de localStorage entre abas
 * Funciona igual ao do plugin-pousadas
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
    if (typeof window === "undefined") {
      console.warn(`Tentativa de definir localStorage key "${key}" fora do browser`);
      return;
    }

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
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.warn(`Erro ao parsear localStorage key "${key}":`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.key === key) {
        if (customEvent.detail.newValue !== null) {
          try {
            setStoredValue(JSON.parse(customEvent.detail.newValue));
          } catch (error) {
            console.warn(`Erro ao parsear localStorage key "${key}":`, error);
          }
        } else {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleCustomEvent as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: SetValue<T>) => {
    if (typeof window === "undefined") return;
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Erro ao definir sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Erro ao remover sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}