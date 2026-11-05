"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook para sincronizar estado com localStorage e entre abas
 */

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Lazy initialization
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : (initialValue instanceof Function ? initialValue() : initialValue);
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  // Atualizar localStorage quando o valor mudar
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Disparar evento customizado para sincronização entre abas
        window.dispatchEvent(new CustomEvent("nexis-storage-change", {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remover do localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);

        window.dispatchEvent(new CustomEvent("nexis-storage-change", {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincronizar entre abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Evento nativo do localStorage (outras abas)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.warn(`Erro ao sincronizar localStorage key "${key}":`, error);
          }
        } else if (e.key === key && e.newValue === null) {
          setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
        }
      } else if (e instanceof CustomEvent) {
        // Evento customizado (mesma aba, outro componente)
        if (e.detail.key === key) {
          if (e.detail.value !== null) {
            try {
              setStoredValue(e.detail.value);
            } catch (error) {
              console.warn(`Erro ao sincronizar custom event key "${key}":`, error);
            }
          } else {
            setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("nexis-storage-change", handleStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("nexis-storage-change", handleStorageChange as EventListener);
    };
  }, [key, initialValue, setStoredValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook para estado de formulário com persistência
 */
export function usePersistedForm<T extends Record<string, any>>(
  key: string,
  initialValues: T
): [T, (name: keyof T, value: any) => void, (values: Partial<T>) => void, () => void] {
  const [values, setValues, removeValues] = useLocalStorage<T>(key, initialValues);

  const setField = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, [setValues]);

  const setFields = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, [setValues]);

  const reset = useCallback(() => {
    removeValues();
  }, [removeValues]);

  return [values, setField, setFields, reset];
}