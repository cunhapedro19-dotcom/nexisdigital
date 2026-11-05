"use client";

/**
 * @nexis/plugin-gestao-rh
 * Plugin de Gestão de RH - Colaboradores, Ponto, Férias, Folha de Pagamento
 */

export * from "./types";
export * from "./utils/helpers";
export * from "./hooks/use-local-storage";
export * from "./hooks/use-ponto";

// Tipos de plugin
export interface GestaoRhPluginConfig {
  tenantId: string;
  settings: import("./types").HrSettings;
}

export interface GestaoRhPluginInstance {
  instanceId: string;
  tenantId: string;
  config: GestaoRhPluginConfig;

  // Colaboradores
  getEmployees: (filters?: { search?: string; department?: string; status?: import("./types").EmployeeStatus }) => Promise<import("./types").Employee[]>;
  getEmployee: (id: string) => Promise<import("./types").Employee | null>;
  createEmployee: (data: Partial<import("./types").Employee>) => Promise<import("./types").Employee>;
  updateEmployee: (id: string, data: Partial<import("./types").Employee>) => Promise<import("./types").Employee>;
  deleteEmployee: (id: string) => Promise<void>;

  // Ponto
  clockIn: (employeeId: string, time: string) => Promise<void>;
  startLunch: (employeeId: string, time: string) => Promise<void>;
  endLunch: (employeeId: string, time: string) => Promise<void>;
  clockOut: (employeeId: string, time: string) => Promise<void>;
  getTimeRecords: (filters?: { employeeId?: string; month?: string }) => Promise<import("./types").TimeRecord[]>;

  // Férias
  getVacationRequests: (status?: import("./types").VacationStatus) => Promise<import("./types").VacationRequest[]>;
  requestVacation: (data: Omit<import("./types").VacationRequest, "id" | "status" | "requestedAt" | "createdAt">) => Promise<import("./types").VacationRequest>;
  approveVacation: (id: string, approvedBy: string) => Promise<void>;
  rejectVacation: (id: string, approvedBy: string) => Promise<void>;

  // Folha
  getPayrolls: (referenceMonth: string) => Promise<import("./types").Payroll[]>;
  processPayroll: (referenceMonth: string, employeeIds?: string[]) => Promise<import("./types").Payroll[]>;

  // Configurações
  updateSettings: (data: Partial<import("./types").HrSettings>) => Promise<import("./types").HrSettings>;
}

// Páginas
export { default as GestaoRhPage } from "./pages/GestaoRhPage";

// Admin
export { default as GestaoRhAdmin } from "./admin/GestaoRhAdmin";

// Tipos para integração com plataforma
export type {
  Employee,
  TimeRecord,
  VacationRequest,
  Payroll,
  TimeOffBalance,
  HrSettings,
  EmployeeStatus,
  VacationStatus,
  TimeRecordStatus,
  HrDashboardMetrics,
  DepartmentSummary,
  TimeReportSummary,
} from "./types";
