"use client";

import { useState, useMemo } from "react";
import type { Employee, TimeRecord, VacationRequest } from "../types";
import {
  formatCurrency,
  formatDate,
  formatMinutes,
  getEmployeeStatusLabel,
  getEmployeeStatusBadge,
  getVacationStatusLabel,
  getVacationStatusBadge,
  calculateHrMetrics,
  getDepartmentSummaries,
  getBirthdaysThisMonth,
  calculateVacationPay,
} from "../utils/helpers";
import { Users, Calendar, DollarSign, Cake, Clock, CheckCircle2, XCircle } from "lucide-react";
import { clsx } from "clsx";

// =========================================================
// Mock Data
// =========================================================

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "e1", tenantId: "demo",
    name: "Ana Paula Souza", cpf: "11122233344", birthDate: new Date("1990-03-15"),
    email: "ana@techdistribuida.com.br", phone: "(11) 98888-1111",
    role: "Gerente Comercial", department: "Comercial",
    hireDate: new Date("2021-02-01"), salary: 850000, workloadHours: 44,
    status: "active", benefits: ["vt", "health", "dental"],
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "e2", tenantId: "demo",
    name: "Carlos Eduardo Lima", cpf: "22233344455", birthDate: new Date("1985-11-02"),
    email: "carlos@techdistribuida.com.br", phone: "(11) 97777-2222",
    role: "Analista de Estoque", department: "Logística",
    hireDate: new Date("2022-06-15"), salary: 320000, workloadHours: 44,
    status: "active", benefits: ["vt", "vr"],
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "e3", tenantId: "demo",
    name: "Juliana Ferreira", cpf: "33344455566", birthDate: new Date("1995-07-28"),
    email: "juliana@techdistribuida.com.br", phone: "(11) 96666-3333",
    role: "Designer", department: "Marketing",
    hireDate: new Date("2023-01-10"), salary: 450000, workloadHours: 40,
    status: "vacation", benefits: ["health", "gym"],
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "e4", tenantId: "demo",
    name: "Marcos Antônio Rocha", cpf: "44455566677", birthDate: new Date("1988-11-05"),
    email: "marcos@techdistribuida.com.br", phone: "(11) 95555-4444",
    role: "Vendedor Externo", department: "Comercial",
    hireDate: new Date("2024-03-04"), salary: 280000, workloadHours: 44,
    status: "active", benefits: ["vt", "vr", "health"],
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "e5", tenantId: "demo",
    name: "Patrícia Gomes", cpf: "55566677788", birthDate: new Date("1992-04-12"),
    email: "patricia@techdistribuida.com.br", phone: "(11) 94444-5555",
    role: "Contadora", department: "Financeiro",
    hireDate: new Date("2020-09-01"), salary: 720000, workloadHours: 44,
    status: "active", benefits: ["vt", "health", "dental", "life"],
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: "e6", tenantId: "demo",
    name: "Rafael Alves", cpf: "66677788899", birthDate: new Date("1998-11-09"),
    email: "rafael@techdistribuida.com.br", phone: "(11) 93333-6666",
    role: "Auxiliar Administrativo", department: "Administrativo",
    hireDate: new Date("2025-10-20"), salary: 220000, workloadHours: 44,
    status: "active", benefits: ["vt"],
    createdAt: new Date(), updatedAt: new Date(),
  },
];

const MOCK_VACATIONS: VacationRequest[] = [
  { id: "v1", tenantId: "demo", employeeId: "e3", startDate: new Date("2026-10-26"), endDate: new Date("2026-11-20"), days: 20, sellUnusedDays: 0, status: "approved", approvedBy: "Administrador", approvedAt: new Date("2026-10-15"), requestedAt: new Date("2026-10-10") },
  { id: "v2", tenantId: "demo", employeeId: "e2", startDate: new Date("2026-12-01"), endDate: new Date("2026-12-20"), days: 20, sellUnusedDays: 0, status: "pending", requestedAt: new Date("2026-10-28") },
  { id: "v3", tenantId: "demo", employeeId: "e4", startDate: new Date("2026-11-10"), endDate: new Date("2026-11-15"), days: 5, sellUnusedDays: 5, status: "pending", requestedAt: new Date("2026-10-30") },
  { id: "v4", tenantId: "demo", employeeId: "e1", startDate: new Date("2026-09-01"), endDate: new Date("2026-09-30"), days: 30, sellUnusedDays: 0, status: "completed", approvedBy: "Administrador", approvedAt: new Date("2026-08-10"), requestedAt: new Date("2026-08-05") },
];

const MOCK_TODAY_RECORDS: TimeRecord[] = [
  { id: "tr1", tenantId: "demo", employeeId: "e1", date: new Date(), clockIn: "08:02", lunchOut: "12:00", lunchIn: "13:01", clockOut: "17:35", workedMinutes: 534, overtimeMinutes: 0, status: "complete", createdAt: new Date() },
  { id: "tr2", tenantId: "demo", employeeId: "e2", date: new Date(), clockIn: "08:15", lunchOut: "12:05", lunchIn: "12:58", workedMinutes: 0, overtimeMinutes: 0, status: "incomplete", createdAt: new Date() },
  { id: "tr3", tenantId: "demo", employeeId: "e4", date: new Date(), clockIn: "07:55", lunchOut: "12:00", lunchIn: "13:00", clockOut: "17:52", workedMinutes: 597, overtimeMinutes: 27, status: "complete", createdAt: new Date() },
  { id: "tr4", tenantId: "demo", employeeId: "e5", date: new Date(), clockIn: "08:00", lunchOut: "12:10", lunchIn: "13:05", clockOut: "17:30", workedMinutes: 495, overtimeMinutes: 0, status: "complete", createdAt: new Date() },
  { id: "tr5", tenantId: "demo", employeeId: "e6", date: new Date(), clockIn: "08:40", lunchOut: "12:15", lunchIn: "13:10", workedMinutes: 0, overtimeMinutes: 0, status: "incomplete", createdAt: new Date() },
  { id: "tr6", tenantId: "demo", employeeId: "e3", date: new Date(), clockIn: "", workedMinutes: 0, overtimeMinutes: 0, status: "absence", notes: "Em férias", createdAt: new Date() },
];

// =========================================================
// Página
// =========================================================

export default function GestaoRhPage() {
  const [tab, setTab] = useState<"painel" | "ponto" | "ferias">("painel");

  const metrics = useMemo(
    () => calculateHrMetrics(MOCK_EMPLOYEES, MOCK_VACATIONS, MOCK_TODAY_RECORDS),
    []
  );

  const departments = useMemo(() => getDepartmentSummaries(MOCK_EMPLOYEES), []);
  const birthdays = useMemo(() => getBirthdaysThisMonth(MOCK_EMPLOYEES), []);
  const pendingVacations = useMemo(() => MOCK_VACATIONS.filter(v => v.status === "pending"), []);

  const maxPayroll = Math.max(...departments.map(d => d.payrollCost), 1);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--brand-cyan)]/10 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] leading-tight">RH — TechDistribuida</p>
                <p className="text-xs text-[var(--text-muted)]">{metrics.activeEmployees} colaboradores ativos</p>
              </div>
            </div>
            <nav className="flex gap-1" aria-label="Seções do RH">
              {([
                { id: "painel", label: "Painel" },
                { id: "ponto", label: "Ponto Hoje" },
                { id: "ferias", label: "Férias" },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    tab === t.id
                      ? "bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ============ Painel ============ */}
        {tab === "painel" && (
          <>
            {/* Métricas */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Métricas de RH">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--text-muted)]">Colaboradores Ativos</p>
                  <Users className="w-4 h-4 text-[var(--brand-cyan)]" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.activeEmployees}<span className="text-sm font-normal text-[var(--text-muted)]">/{metrics.totalEmployees}</span></p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{metrics.newHiresThisMonth} contratação(ões) no mês</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--text-muted)]">Folha Mensal</p>
                  <DollarSign className="w-4 h-4 text-[var(--brand-amber)]" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(metrics.monthlyPayrollCost)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Média: {formatCurrency(metrics.averageSalary)}</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--text-muted)]">Presença Hoje</p>
                  <Clock className="w-4 h-4 text-[var(--text-success)]" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.attendanceRate}%</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{metrics.todayAbsences} falta(s)</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--text-muted)]">Férias Pendentes</p>
                  <Calendar className="w-4 h-4 text-[var(--text-warning)]" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metrics.pendingVacationRequests}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{metrics.onVacation} em férias agora</p>
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Departamentos */}
              <section className="card p-6" aria-label="Departamentos">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Custo por Departamento</h2>
                <ul className="space-y-3">
                  {departments.map(dept => (
                    <li key={dept.department}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-[var(--text-primary)]">{dept.department}</span>
                        <span className="text-[var(--text-secondary)]">{formatCurrency(dept.payrollCost)} • {dept.headcount} pessoa(s)</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--brand-cyan)] rounded-full"
                          style={{ width: `${(dept.payrollCost / maxPayroll) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Aniversariantes + pendências */}
              <section className="card p-6" aria-label="Aniversariantes">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Cake className="w-5 h-5 text-[var(--brand-amber)]" aria-hidden="true" />
                  Aniversariantes de Novembro
                </h2>
                {birthdays.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Nenhum aniversariante este mês</p>
                ) : (
                  <ul className="divide-y divide-[var(--border-default)]">
                    {birthdays.map(emp => (
                      <li key={emp.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-[var(--brand-amber)]/10 text-[var(--brand-amber)] flex items-center justify-center text-sm font-bold">
                            {emp.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{emp.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{emp.role}</p>
                          </div>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">dia {new Date(emp.birthDate).getDate()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Quadro de colaboradores */}
            <section className="card p-6" aria-label="Colaboradores">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Colaboradores</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] border-b border-[var(--border-default)]">
                      <th className="pb-2 pr-4 font-medium">Nome</th>
                      <th className="pb-2 pr-4 font-medium">Cargo</th>
                      <th className="pb-2 pr-4 font-medium">Departamento</th>
                      <th className="pb-2 pr-4 font-medium">Salário</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-muted)]">
                    {MOCK_EMPLOYEES.map(emp => (
                      <tr key={emp.id}>
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-[var(--text-primary)]">{emp.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{formatDate(emp.hireDate)}</p>
                        </td>
                        <td className="py-2.5 pr-4 text-[var(--text-secondary)]">{emp.role}</td>
                        <td className="py-2.5 pr-4 text-[var(--text-secondary)]">{emp.department}</td>
                        <td className="py-2.5 pr-4 font-medium text-[var(--text-primary)]">{formatCurrency(emp.salary)}</td>
                        <td className="py-2.5">
                          <span className={clsx("badge", getEmployeeStatusBadge(emp.status))}>
                            {getEmployeeStatusLabel(emp.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ============ Ponto Hoje ============ */}
        {tab === "ponto" && (
          <section className="card p-6" aria-label="Registros de ponto de hoje">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Registros de Hoje</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--text-muted)] border-b border-[var(--border-default)]">
                    <th className="pb-2 pr-4 font-medium">Colaborador</th>
                    <th className="pb-2 pr-4 font-medium">Entrada</th>
                    <th className="pb-2 pr-4 font-medium">Almoço</th>
                    <th className="pb-2 pr-4 font-medium">Saída</th>
                    <th className="pb-2 pr-4 font-medium">Horas</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  {MOCK_TODAY_RECORDS.map(record => {
                    const emp = MOCK_EMPLOYEES.find(e => e.id === record.employeeId);
                    return (
                      <tr key={record.id}>
                        <td className="py-2.5 pr-4 font-medium text-[var(--text-primary)]">{emp?.name}</td>
                        <td className="py-2.5 pr-4 font-mono text-[var(--text-secondary)]">{record.clockIn || "—"}</td>
                        <td className="py-2.5 pr-4 font-mono text-[var(--text-secondary)]">
                          {record.lunchOut ? `${record.lunchOut}–${record.lunchIn || "..."}` : "—"}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-[var(--text-secondary)]">{record.clockOut || "—"}</td>
                        <td className="py-2.5 pr-4">
                          {record.status === "complete" ? (
                            <span className="text-[var(--text-primary)]">
                              {formatMinutes(record.workedMinutes)}
                              {record.overtimeMinutes > 0 && (
                                <span className="text-[var(--text-success)] text-xs ml-1">+{formatMinutes(record.overtimeMinutes)}</span>
                              )}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-2.5">
                          <span className={clsx(
                            "badge",
                            record.status === "complete" ? "badge-success" :
                            record.status === "incomplete" ? "badge-warning" :
                            "badge-outline"
                          )}>
                            {record.status === "complete" ? "Completo" : record.status === "incomplete" ? "Em andamento" : "Falta"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ============ Férias ============ */}
        {tab === "ferias" && (
          <section className="card p-6" aria-label="Solicitações de férias">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Solicitações de Férias</h2>
            <div className="space-y-3">
              {MOCK_VACATIONS.map(vac => {
                const emp = MOCK_EMPLOYEES.find(e => e.id === vac.employeeId);
                const pay = calculateVacationPay(emp?.salary || 0, vac.days, vac.sellUnusedDays);
                return (
                  <article key={vac.id} className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{emp?.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formatDate(vac.startDate)} até {formatDate(vac.endDate)} • {vac.days} dias
                          {vac.sellUnusedDays > 0 && ` • vende ${vac.sellUnusedDays} dia(s)`}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Solicitado em {formatDate(vac.requestedAt)}
                          {vac.approvedBy && ` • Aprovado por ${vac.approvedBy}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={clsx("badge mb-2", getVacationStatusBadge(vac.status))}>
                          {getVacationStatusLabel(vac.status)}
                        </p>
                        <p className="text-sm font-semibold text-[var(--brand-cyan)]">
                          ≈ {formatCurrency(pay.total)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">estimativa com 1/3</p>
                      </div>
                    </div>
                    {vac.status === "pending" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border-muted)]">
                        <button className="btn btn-primary text-sm py-1.5">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                        </button>
                        <button className="btn btn-ghost text-sm py-1.5 text-[var(--text-danger)]">
                          <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-[var(--text-muted)] py-6 border-t border-[var(--border-default)]">
          Powered by Nexis Digital • Gestão RH
        </footer>
      </main>
    </div>
  );
}
