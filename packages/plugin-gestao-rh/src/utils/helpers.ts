import type { Employee, TimeRecord, Payroll, VacationRequest, HrDashboardMetrics, DepartmentSummary } from "../types";

/**
 * @nexis/plugin-gestao-rh — Utilitários
 */

// =========================================================
// Formatação
// =========================================================

export function formatCurrency(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export function formatMonth(reference: string): string {
  // "2026-11" → "Novembro 2026"
  const [year, month] = reference.split("-").map(Number);
  const names = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${names[month - 1]} ${year}`;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  return `${hours}h${String(mins).padStart(2, "0")}`;
}

export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.length === 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : cpf;
}

// =========================================================
// Labels
// =========================================================

export function getEmployeeStatusLabel(status: Employee["status"]): string {
  const labels: Record<Employee["status"], string> = {
    active: "Ativo",
    vacation: "Em férias",
    leave: "Afastado",
    fired: "Desligado",
    suspended: "Suspenso",
  };
  return labels[status];
}

export function getEmployeeStatusBadge(status: Employee["status"]): string {
  const badges: Record<Employee["status"], string> = {
    active: "badge-success",
    vacation: "badge-info",
    leave: "badge-warning",
    fired: "badge-outline",
    suspended: "badge-danger",
  };
  return badges[status];
}

export function getVacationStatusLabel(status: VacationRequest["status"]): string {
  const labels: Record<VacationRequest["status"], string> = {
    pending: "Pendente",
    approved: "Aprovada",
    rejected: "Rejeitada",
    completed: "Concluída",
    canceled: "Cancelada",
  };
  return labels[status];
}

export function getVacationStatusBadge(status: VacationRequest["status"]): string {
  const badges: Record<VacationRequest["status"], string> = {
    pending: "badge-warning",
    approved: "badge-success",
    rejected: "badge-danger",
    completed: "badge-info",
    canceled: "badge-outline",
  };
  return badges[status];
}

export function getBenefitLabel(benefit: string): string {
  const labels: Record<string, string> = {
    vt: "Vale Transporte",
    vr: "Vale Refeição",
    va: "Vale Alimentação",
    health: "Plano de Saúde",
    dental: "Plano Odontológico",
    life: "Seguro de Vida",
    gym: "Ginástica Laboral",
  };
  return labels[benefit] || benefit;
}

export function getTimeRecordStatusLabel(status: TimeRecord["status"]): string {
  const labels: Record<TimeRecord["status"], string> = {
    complete: "Completo",
    incomplete: "Incompleto",
    absence: "Falta",
    holiday: "Feriado",
    medical: "Atestado",
  };
  return labels[status];
}

// =========================================================
// Cálculos de tempo
// =========================================================

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function calculateWorkedMinutes(record: Pick<TimeRecord, "clockIn" | "lunchOut" | "lunchIn" | "clockOut">): number {
  if (!record.clockIn || !record.clockOut) return 0;

  const inMin = timeToMinutes(record.clockIn);
  const outMin = timeToMinutes(record.clockOut);
  let worked = outMin - inMin;

  // Desconta almoço
  if (record.lunchOut && record.lunchIn) {
    worked -= timeToMinutes(record.lunchIn) - timeToMinutes(record.lunchOut);
  }

  return Math.max(0, worked);
}

export function calculateOvertime(workedMinutes: number, expectedHours: number, toleranceMinutes = 10): number {
  const expectedMinutes = expectedHours * 60;
  const diff = workedMinutes - expectedMinutes;
  return diff > toleranceMinutes ? diff : 0;
}

export function isLate(clockIn: string, expectedTime: string, toleranceMinutes = 10): boolean {
  return timeToMinutes(clockIn) > timeToMinutes(expectedTime) + toleranceMinutes;
}

// =========================================================
// Cálculos trabalhistas
// =========================================================

/**
 * INSS progressivo 2026 (faixas aproximadas em centavos)
 */
export function calculateInss(baseSalary: number): number {
  const brackets = [
    { limit: 151800, rate: 0.075 },
    { limit: 279320, rate: 0.09 },
    { limit: 419060, rate: 0.12 },
    { limit: 815000, rate: 0.14 },
  ];

  let previous = 0;
  let total = 0;

  for (const bracket of brackets) {
    if (baseSalary > previous) {
      const taxable = Math.min(baseSalary, bracket.limit) - previous;
      total += taxable * bracket.rate;
      previous = bracket.limit;
    }
  }

  const capped = Math.min(total, 90885); // teto
  return Math.round(capped);
}

/**
 * IRRF simplificado 2026
 */
export function calculateIrrf(baseSalary: number, inss: number): number {
  const taxable = baseSalary - inss;

  const brackets = [
    { limit: 242880, rate: 0, deduction: 0 },
    { limit: 282600, rate: 0.075, deduction: 18216 },
    { limit: 375120, rate: 0.15, deduction: 39456 },
    { limit: 466020, rate: 0.225, deduction: 67524 },
    { limit: Infinity, rate: 0.275, deduction: 90834 },
  ];

  for (const bracket of brackets) {
    if (taxable <= bracket.limit) {
      const tax = taxable * bracket.rate - bracket.deduction;
      return Math.max(0, Math.round(tax));
    }
  }
  return 0;
}

/**
 * Calcula folha completa de um funcionário
 */
export function calculatePayroll(
  employee: Pick<Employee, "salary" | "workloadHours">,
  overtimeHours: number,
  overtimeRate: number,
  benefits: { transportVoucher?: number; otherDiscounts?: number }
): Omit<Payroll, "id" | "tenantId" | "employeeId" | "referenceMonth" | "status" | "createdAt" | "updatedAt"> {
  const hourlyRate = employee.salary / (employee.workloadHours * 4.5); // semanas/mês aproximado
  const overtimeValue = Math.round(overtimeHours * hourlyRate * overtimeRate);

  const grossTotal = employee.salary + overtimeValue;

  const inss = calculateInss(grossTotal);
  const irrf = calculateIrrf(grossTotal, inss);

  const discounts = inss + irrf + (benefits.transportVoucher || 0) + (benefits.otherDiscounts || 0);
  const netTotal = Math.max(0, grossTotal - discounts);

  return {
    baseSalary: employee.salary,
    overtimeHours,
    overtimeValue,
    bonuses: 0,
    transportVoucher: benefits.transportVoucher || 0,
    inssDiscount: inss,
    irrfDiscount: irrf,
    otherDiscounts: benefits.otherDiscounts || 0,
    grossTotal,
    netTotal,
  };
}

/**
 * Férias: 30 dias + 1/3 constitucional
 */
export function calculateVacationPay(salary: number, days: number, sellDays = 0): { vacationValue: number; sellValue: number; total: number } {
  const dailyRate = salary / 30;
  const vacationValue = Math.round(dailyRate * days * 1.3333);
  const sellValue = Math.round(dailyRate * sellDays * 1.3333);
  return { vacationValue, sellValue, total: vacationValue + sellValue };
}

/**
 * Dias de férias disponíveis
 */
export function getVacationBalance(entitledDays: number, usedDays: number, pendingDays: number): number {
  return Math.max(0, entitledDays - usedDays - pendingDays);
}

// =========================================================
// Métricas
// =========================================================

export function calculateHrMetrics(
  employees: Employee[],
  vacationRequests: VacationRequest[],
  todayRecords: TimeRecord[]
): HrDashboardMetrics {
  const now = new Date();
  const active = employees.filter(e => e.status === "active");

  const newHires = employees.filter(e => {
    const hire = new Date(e.hireDate);
    return hire.getMonth() === now.getMonth() && hire.getFullYear() === now.getFullYear();
  });

  const monthlyPayrollCost = active.reduce((s, e) => s + e.salary, 0);
  const absences = todayRecords.filter(r => r.status === "absence").length;
  const expectedToday = active.length;
  const presentToday = todayRecords.filter(r => ["complete", "incomplete"].includes(r.status)).length;

  return {
    totalEmployees: employees.length,
    activeEmployees: active.length,
    onVacation: employees.filter(e => e.status === "vacation").length,
    onLeave: employees.filter(e => e.status === "leave").length,
    newHiresThisMonth: newHires.length,
    monthlyPayrollCost,
    averageSalary: active.length > 0 ? Math.round(monthlyPayrollCost / active.length) : 0,
    pendingVacationRequests: vacationRequests.filter(v => v.status === "pending").length,
    todayAbsences: absences,
    attendanceRate: expectedToday > 0 ? Math.round((presentToday / expectedToday) * 100) : 100,
  };
}

export function getDepartmentSummaries(employees: Employee[]): DepartmentSummary[] {
  const map = new Map<string, { headcount: number; payrollCost: number }>();

  for (const emp of employees.filter(e => ["active", "vacation", "leave"].includes(e.status))) {
    const existing = map.get(emp.department) || { headcount: 0, payrollCost: 0 };
    existing.headcount += 1;
    existing.payrollCost += emp.salary;
    map.set(emp.department, existing);
  }

  return Array.from(map.entries())
    .map(([department, data]) => ({
      department,
      headcount: data.headcount,
      payrollCost: data.payrollCost,
      averageSalary: Math.round(data.payrollCost / data.headcount),
    }))
    .sort((a, b) => b.headcount - a.headcount);
}

/**
 * Aniversariantes do mês
 */
export function getBirthdaysThisMonth(employees: Employee[], month = new Date().getMonth()): Employee[] {
  return employees
    .filter(e => new Date(e.birthDate).getMonth() === month)
    .sort((a, b) => new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate());
}
