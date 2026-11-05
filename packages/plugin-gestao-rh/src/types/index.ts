import { z } from "zod";

/**
 * @nexis/plugin-gestao-rh — Tipos
 * RH: funcionários, ponto, férias, folha de pagamento, documentos
 */

// =========================================================
// Schemas Zod
// =========================================================

export const EmployeeSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string().min(2),
  cpf: z.string().min(11),
  rg: z.string().optional(),
  birthDate: z.date(),
  email: z.string().email(),
  phone: z.string(),
  role: z.string().min(2),
  department: z.string(),
  hireDate: z.date(),
  salary: z.number().int().min(1), // centavos
  workloadHours: z.number().int().min(1).max(44).default(44),
  status: z.enum(["active", "vacation", "leave", "fired", "suspended"]),
  managerId: z.string().optional(),
  bankAccount: z.object({
    bank: z.string(),
    agency: z.string(),
    account: z.string(),
    accountType: z.enum(["checking", "savings"]),
  }).optional(),
  benefits: z.array(z.enum(["vt", "vr", "va", "health", "dental", "life", "gym"])).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TimeRecordSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  employeeId: z.string(),
  date: z.date(),
  clockIn: z.string(), // "08:00"
  lunchOut: z.string().optional(), // "12:00"
  lunchIn: z.string().optional(), // "13:00"
  clockOut: z.string().optional(), // "17:30"
  workedMinutes: z.number().int().default(0),
  overtimeMinutes: z.number().int().default(0),
  status: z.enum(["complete", "incomplete", "absence", "holiday", "medical"]),
  notes: z.string().optional(),
  createdAt: z.date(),
});

export const VacationRequestSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  employeeId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  days: z.number().int().min(1).max(30),
  sellUnusedDays: z.number().int().min(0).max(10).default(0), // abono pecuniário
  status: z.enum(["pending", "approved", "rejected", "completed", "canceled"]),
  reason: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  requestedAt: z.date(),
});

export const PayrollSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  employeeId: z.string(),
  referenceMonth: z.string(), // "2026-11"
  baseSalary: z.number().int().min(0),
  overtimeHours: z.number().int().min(0).default(0),
  overtimeValue: z.number().int().min(0).default(0),
  bonuses: z.number().int().min(0).default(0),
  transportVoucher: z.number().int().min(0).default(0),
  inssDiscount: z.number().int().min(0).default(0),
  irrfDiscount: z.number().int().min(0).default(0),
  otherDiscounts: z.number().int().min(0).default(0),
  grossTotal: z.number().int().min(0),
  netTotal: z.number().int().min(0),
  status: z.enum(["draft", "processed", "paid"]),
  processedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TimeOffBalanceSchema = z.object({
  employeeId: z.string(),
  year: z.number().int(),
  entitledDays: z.number().int().default(30),
  usedDays: z.number().int().default(0),
  pendingDays: z.number().int().default(0),
});

export const HrSettingsSchema = z.object({
  companyName: z.string().min(2),
  cnpj: z.string(),
  workWeekStart: z.number().int().min(0).max(6).default(1), // segunda
  workWeekEnd: z.number().int().min(0).max(6).default(5), // sexta
  standardWorkloadHours: z.number().int().default(44),
  lunchBreakMinutes: z.number().int().default(60),
  toleranceMinutes: z.number().int().default(10),
  overtimeRate: z.number().default(1.5), // 50% adicional
  vacationMonthsLimit: z.number().int().default(12),
  autoApproveVacations: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
});

// =========================================================
// Tipos inferidos
// =========================================================

export type Employee = z.infer<typeof EmployeeSchema>;
export type TimeRecord = z.infer<typeof TimeRecordSchema>;
export type VacationRequest = z.infer<typeof VacationRequestSchema>;
export type Payroll = z.infer<typeof PayrollSchema>;
export type TimeOffBalance = z.infer<typeof TimeOffBalanceSchema>;
export type HrSettings = z.infer<typeof HrSettingsSchema>;

export type EmployeeStatus = Employee["status"];
export type VacationStatus = VacationRequest["status"];
export type PayrollStatus = Payroll["status"];
export type BenefitType = Employee["benefits"][0];

// =========================================================
// Tipos auxiliares
// =========================================================

export interface HrDashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onVacation: number;
  onLeave: number;
  newHiresThisMonth: number;
  monthlyPayrollCost: number;
  averageSalary: number;
  pendingVacationRequests: number;
  todayAbsences: number;
  attendanceRate: number; // percentual
}

export interface DepartmentSummary {
  department: string;
  headcount: number;
  payrollCost: number;
  averageSalary: number;
}

export interface TimeReportSummary {
  employeeId: string;
  employeeName: string;
  workedHours: number;
  overtimeHours: number;
  absences: number;
  expectedHours: number;
}
