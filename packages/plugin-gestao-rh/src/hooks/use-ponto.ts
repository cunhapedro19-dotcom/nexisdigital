"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { TimeRecord, VacationRequest } from "../types";
import { calculateWorkedMinutes, calculateOvertime } from "../utils/helpers";

/**
 * @nexis/plugin-gestao-rh — Hook de ponto e férias
 */

export interface UsePontoReturn {
  records: TimeRecord[];
  vacationRequests: VacationRequest[];
  todayRecord: TimeRecord | null;
  clockIn: (time: string) => void;
  startLunch: (time: string) => void;
  endLunch: (time: string) => void;
  clockOut: (time: string) => void;
  requestVacation: (data: { employeeId: string; startDate: Date; endDate: Date; days: number; sellUnusedDays?: number; reason?: string }) => VacationRequest;
  approveVacation: (id: string, approvedBy: string) => void;
  rejectVacation: (id: string, approvedBy: string) => void;
  getEmployeeRecords: (employeeId: string, month?: string) => TimeRecord[];
  isLoading: boolean;
}

const PONTO_KEY = "nexis-rh-ponto";
const VACATION_KEY = "nexis-rh-vacations";

export function usePonto(tenantId: string): UsePontoReturn {
  const [records, setRecords] = useLocalStorage<TimeRecord[]>(`${PONTO_KEY}-${tenantId}`, []);
  const [vacationRequests, setVacationRequests] = useLocalStorage<VacationRequest[]>(`${VACATION_KEY}-${tenantId}`, []);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const todayRecord = useMemo(() => {
    return records.find(r => r.date.toISOString?.().slice(0, 10) === today) || null;
  }, [records, today]);

  const updateTodayRecord = useCallback((updates: Partial<TimeRecord>, existing: TimeRecord | undefined) => {
    setRecords(prev => {
      if (existing) {
        return prev.map(r => (r.id === existing.id ? { ...r, ...updates } : r));
      }
      const now = new Date();
      return [
        ...prev,
        {
          id: `tr-${Date.now()}`,
          tenantId,
          date: now,
          clockIn: "",
          workedMinutes: 0,
          overtimeMinutes: 0,
          status: "incomplete" as const,
          createdAt: now,
          ...updates,
        },
      ];
    });
  }, [setRecords, tenantId]);

  const clockIn = useCallback((time: string) => {
    const existing = records.find(r => new Date(r.date).toISOString().slice(0, 10) === today);
    updateTodayRecord({ clockIn: time }, existing);
  }, [records, today, updateTodayRecord]);

  const startLunch = useCallback((time: string) => {
    const existing = records.find(r => new Date(r.date).toISOString().slice(0, 10) === today);
    if (existing) updateTodayRecord({ lunchOut: time }, existing);
  }, [records, today, updateTodayRecord]);

  const endLunch = useCallback((time: string) => {
    const existing = records.find(r => new Date(r.date).toISOString().slice(0, 10) === today);
    if (existing) updateTodayRecord({ lunchIn: time }, existing);
  }, [records, today, updateTodayRecord]);

  const clockOut = useCallback((time: string, expectedHours = 8) => {
    const existing = records.find(r => new Date(r.date).toISOString().slice(0, 10) === today);
    if (!existing) return;

    const updated = { ...existing, clockOut: time };
    const worked = calculateWorkedMinutes(updated);
    const overtime = calculateOvertime(worked, expectedHours);

    updateTodayRecord(
      { clockOut: time, workedMinutes: worked, overtimeMinutes: overtime, status: "complete" },
      existing
    );
  }, [records, today, updateTodayRecord]);

  const requestVacation = useCallback((data: { employeeId: string; startDate: Date; endDate: Date; days: number; sellUnusedDays?: number; reason?: string }): VacationRequest => {
    const request: VacationRequest = {
      id: `vac-${Date.now()}`,
      tenantId,
      status: "pending",
      sellUnusedDays: 0,
      requestedAt: new Date(),
      ...data,
      sellUnusedDays: data.sellUnusedDays ?? 0,
    };
    setVacationRequests(prev => [request, ...prev]);
    return request;
  }, [tenantId, setVacationRequests]);

  const approveVacation = useCallback((id: string, approvedBy: string) => {
    setVacationRequests(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "approved" as const, approvedBy, approvedAt: new Date() } : v))
    );
  }, [setVacationRequests]);

  const rejectVacation = useCallback((id: string, approvedBy: string) => {
    setVacationRequests(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "rejected" as const, approvedBy, approvedAt: new Date() } : v))
    );
  }, [setVacationRequests]);

  const getEmployeeRecords = useCallback((employeeId: string, month?: string): TimeRecord[] => {
    return records
      .filter(r => {
        if (r.employeeId !== employeeId) return false;
        if (month) {
          const m = new Date(r.date).toISOString().slice(0, 7);
          return m === month;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  return {
    records,
    vacationRequests,
    todayRecord,
    clockIn,
    startLunch,
    endLunch,
    clockOut,
    requestVacation,
    approveVacation,
    rejectVacation,
    getEmployeeRecords,
    isLoading,
  };
}
