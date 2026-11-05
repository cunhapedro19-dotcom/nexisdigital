"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { FinancialEntry, FinancialEntryStatus } from "../types";
import { isOverdue, getDaysUntilDue } from "../utils/helpers";

/**
 * @nexis/plugin-gestao-empresarial — Hook de contas a pagar/receber
 * Persiste em localStorage com sincronização entre abas
 */

export interface UseFinanceiroReturn {
  entries: FinancialEntry[];
  receivables: FinancialEntry[];
  payables: FinancialEntry[];
  pendingReceivables: FinancialEntry[];
  pendingPayables: FinancialEntry[];
  overdue: FinancialEntry[];
  totals: {
    receivablePending: number;
    payablePending: number;
    overdueAmount: number;
    receivedThisMonth: number;
    paidThisMonth: number;
  };
  addEntry: (entry: Omit<FinancialEntry, "id" | "status" | "createdAt" | "updatedAt">) => FinancialEntry;
  markAsPaid: (id: string, method?: FinancialEntry["paymentMethod"]) => void;
  cancelEntry: (id: string) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, data: Partial<FinancialEntry>) => void;
}

const FINANCEIRO_KEY = "nexis-gestao-financeiro";

export function useFinanceiro(tenantId: string): UseFinanceiroReturn {
  const [entries, setEntries] = useLocalStorage<FinancialEntry[]>(`${FINANCEIRO_KEY}-${tenantId}`, []);
  const [isLoading, setIsLoading] = useState(false);

  const receivables = useMemo(() => entries.filter(e => e.type === "receivable"), [entries]);
  const payables = useMemo(() => entries.filter(e => e.type === "payable"), [entries]);

  // Auto-marca como vencido (virtual — não altera o dado persistido)
  const withOverdue = useMemo(
    () => entries.map(e => (isOverdue(e) ? { ...e, status: "overdue" as FinancialEntryStatus } : e)),
    [entries]
  );

  const pendingReceivables = useMemo(
    () => withOverdue.filter(e => e.type === "receivable" && ["pending", "overdue"].includes(e.status)),
    [withOverdue]
  );

  const pendingPayables = useMemo(
    () => withOverdue.filter(e => e.type === "payable" && ["pending", "overdue"].includes(e.status)),
    [withOverdue]
  );

  const overdue = useMemo(() => withOverdue.filter(e => e.status === "overdue"), [withOverdue]);

  const totals = useMemo(() => {
    const now = new Date();
    const thisMonth = (d: Date | string) => {
      const date = new Date(d);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };

    return {
      receivablePending: pendingReceivables.reduce((s, e) => s + e.amount, 0),
      payablePending: pendingPayables.reduce((s, e) => s + e.amount, 0),
      overdueAmount: overdue.reduce((s, e) => s + e.amount, 0),
      receivedThisMonth: receivables.filter(e => e.status === "paid" && e.paidAt && thisMonth(e.paidAt)).reduce((s, e) => s + e.amount, 0),
      paidThisMonth: payables.filter(e => e.status === "paid" && e.paidAt && thisMonth(e.paidAt)).reduce((s, e) => s + e.amount, 0),
    };
  }, [pendingReceivables, pendingPayables, overdue, receivables, payables]);

  const addEntry = useCallback((entry: Omit<FinancialEntry, "id" | "status" | "createdAt" | "updatedAt">): FinancialEntry => {
    const now = new Date();
    const newEntry: FinancialEntry = {
      ...entry,
      id: `fin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, [setEntries]);

  const markAsPaid = useCallback((id: string, method?: FinancialEntry["paymentMethod"]) => {
    setEntries(prev =>
      prev.map(e =>
        e.id === id ? { ...e, status: "paid" as const, paidAt: new Date(), paymentMethod: method || e.paymentMethod, updatedAt: new Date() } : e
      )
    );
  }, [setEntries]);

  const cancelEntry = useCallback((id: string) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, status: "canceled" as const, updatedAt: new Date() } : e)));
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, [setEntries]);

  const updateEntry = useCallback((id: string, data: Partial<FinancialEntry>) => {
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...data, updatedAt: new Date() } : e)));
  }, [setEntries]);

  return {
    entries: withOverdue,
    receivables,
    payables,
    pendingReceivables,
    pendingPayables,
    overdue,
    totals,
    addEntry,
    markAsPaid,
    cancelEntry,
    deleteEntry,
    updateEntry,
  };
}

export { isOverdue, getDaysUntilDue };
