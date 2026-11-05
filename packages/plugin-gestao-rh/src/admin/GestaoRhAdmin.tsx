"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Wallet,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  AdminPageLayout,
  AdminSection,
  AdminTable,
  AdminTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminSwitch,
  AdminField,
  AdminEditorModal,
  useAdminToast,
} from "@nexis/ui/admin";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  formatCpf,
  getEmployeeStatusLabel,
  getEmployeeStatusBadge,
  getVacationStatusLabel,
  getVacationStatusBadge,
  calculatePayroll,
  calculateInss,
  calculateIrrf,
  getDepartmentSummaries,
} from "../utils/helpers";
import { clsx } from "clsx";

// =========================================================
// Mock data
// =========================================================

const MOCK_EMPLOYEES = [
  { id: "e1", name: "Ana Paula Souza", cpf: "11122233344", role: "Gerente Comercial", department: "Comercial", hireDate: "2021-02-01", salary: 850000, workloadHours: 44, status: "active", email: "ana@tech.com" },
  { id: "e2", name: "Carlos Eduardo Lima", cpf: "22233344455", role: "Analista de Estoque", department: "Logística", hireDate: "2022-06-15", salary: 320000, workloadHours: 44, status: "active", email: "carlos@tech.com" },
  { id: "e3", name: "Juliana Ferreira", cpf: "33344455566", role: "Designer", department: "Marketing", hireDate: "2023-01-10", salary: 450000, workloadHours: 40, status: "vacation", email: "juliana@tech.com" },
  { id: "e4", name: "Marcos Antônio Rocha", cpf: "44455566677", role: "Vendedor Externo", department: "Comercial", hireDate: "2024-03-04", salary: 280000, workloadHours: 44, status: "active", email: "marcos@tech.com" },
  { id: "e5", name: "Patrícia Gomes", cpf: "55566677788", role: "Contadora", department: "Financeiro", hireDate: "2020-09-01", salary: 720000, workloadHours: 44, status: "active", email: "patricia@tech.com" },
  { id: "e6", name: "Rafael Alves", cpf: "66677788899", role: "Auxiliar Administrativo", department: "Administrativo", hireDate: "2025-10-20", salary: 220000, workloadHours: 44, status: "active", email: "rafael@tech.com" },
];

const MOCK_VACATIONS = [
  { id: "v2", employeeId: "e2", employeeName: "Carlos Eduardo Lima", startDate: "2026-12-01", endDate: "2026-12-20", days: 20, sellUnusedDays: 0, status: "pending", requestedAt: "2026-10-28" },
  { id: "v3", employeeId: "e4", employeeName: "Marcos Antônio Rocha", startDate: "2026-11-10", endDate: "2026-11-15", days: 5, sellUnusedDays: 5, status: "pending", requestedAt: "2026-10-30" },
  { id: "v1", employeeId: "e3", employeeName: "Juliana Ferreira", startDate: "2026-10-26", endDate: "2026-11-20", days: 20, sellUnusedDays: 0, status: "approved", approvedBy: "Administrador", requestedAt: "2026-10-10" },
  { id: "v4", employeeId: "e1", employeeName: "Ana Paula Souza", startDate: "2026-09-01", endDate: "2026-09-30", days: 30, sellUnusedDays: 0, status: "completed", requestedAt: "2026-08-05" },
];

const REFERENCE_MONTH = "2026-11";
const OVERTIME_RATE = 1.5;

// =========================================================
// Layout
// =========================================================

export default function GestaoRhAdmin() {
  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-6 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
          <TabsTrigger value="employees"><Users className="w-4 h-4 mr-2" />Colaboradores</TabsTrigger>
          <TabsTrigger value="vacations"><Calendar className="w-4 h-4 mr-2" />Férias</TabsTrigger>
          <TabsTrigger value="payroll"><Wallet className="w-4 h-4 mr-2" />Folha</TabsTrigger>
          <TabsTrigger value="point"><Clock className="w-4 h-4 mr-2" />Ponto</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6"><DashboardTab /></TabsContent>
        <TabsContent value="employees" className="p-6"><EmployeesTab /></TabsContent>
        <TabsContent value="vacations" className="p-6"><VacationsTab /></TabsContent>
        <TabsContent value="payroll" className="p-6"><PayrollTab /></TabsContent>
        <TabsContent value="point" className="p-6"><PointTab /></TabsContent>
        <TabsContent value="settings" className="p-6"><SettingsTab /></TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}

// =========================================================
// Dashboard
// =========================================================

function DashboardTab() {
  const active = MOCK_EMPLOYEES.filter(e => e.status === "active");
  const payrollCost = active.reduce((s, e) => s + e.salary, 0);
  const departments = getDepartmentSummaries(
    MOCK_EMPLOYEES.map(e => ({ ...e, birthDate: new Date(), hireDate: new Date(e.hireDate), createdAt: new Date(), updatedAt: new Date() }))
  );
  const pending = MOCK_VACATIONS.filter(v => v.status === "pending");

  const stats = [
    { label: "Colaboradores", value: String(MOCK_EMPLOYEES.length), icon: "👥", color: "var(--brand-cyan)" },
    { label: "Folha Mensal", value: formatCurrency(payrollCost), icon: "💰", color: "var(--brand-amber)" },
    { label: "Média Salarial", value: formatCurrency(Math.round(payrollCost / active.length)), icon: "📊", color: "var(--text-success)" },
    { label: "Em Férias", value: String(MOCK_EMPLOYEES.filter(e => e.status === "vacation").length), icon: "🏖️", color: "var(--text-info, #0ea5e9)" },
    { label: "Férias Pendentes", value: String(pending.length), icon: "📝", color: "var(--text-warning)" },
    { label: "Departamentos", value: String(departments.length), icon: "🏢", color: "var(--text-secondary)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard — RH TechDistribuida</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <AdminSection key={i} className="card p-4 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
          </AdminSection>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminSection title="Férias Aguardando Aprovação" className="card">
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">Nenhuma solicitação pendente ✅</p>
          ) : (
            <ul className="divide-y divide-[var(--border-default)]">
              {pending.map(v => (
                <li key={v.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{v.employeeName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDate(v.startDate)} – {formatDate(v.endDate)} • {v.days} dias
                    </p>
                  </div>
                  <span className="badge badge-warning text-xs">{getVacationStatusLabel(v.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>

        <AdminSection title="Departamentos" className="card">
          <AdminTable
            columns={[
              { key: "department", header: "Departamento" },
              { key: "headcount", header: "Pessoas", width: "w-20" },
              { key: "payrollCost", header: "Custo", width: "w-28", render: (d: any) => formatCurrency(d.payrollCost) },
            ]}
            data={departments}
            emptyMessage="Nenhum departamento"
          />
        </AdminSection>
      </div>
    </div>
  );
}

// =========================================================
// Colaboradores
// =========================================================

function EmployeesTab() {
  const { toast } = useAdminToast();
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_EMPLOYEES)[0] | null>(null);

  const departments = Array.from(new Set(MOCK_EMPLOYEES.map(e => e.department)));

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.cpf.includes(search.replace(/\D/g, "")) ||
        e.role.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || e.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, search, deptFilter]);

  const handleSave = (data: Record<string, any>) => {
    const normalized = { ...data, salary: Number(data.salary), workloadHours: Number(data.workloadHours) };
    if (editing) {
      setEmployees(prev => prev.map(e => (e.id === editing.id ? { ...e, ...normalized } : e)));
      toast({ title: "Colaborador atualizado", variant: "success" });
    } else {
      setEmployees(prev => [...prev, { ...normalized, id: `e-${Date.now()}`, status: "active" }]);
      toast({ title: "Colaborador cadastrado", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Colaboradores</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Novo Colaborador
        </AdminButton>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-52">
          <AdminInput placeholder="Buscar por nome, CPF ou cargo..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
        </div>
        <div className="w-48">
          <AdminSelect
            value={deptFilter}
            onChange={(e: any) => setDeptFilter(e.target.value)}
            options={[
              { value: "all", label: "Todos os departamentos" },
              ...departments.map(d => ({ value: d, label: d })),
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Colaborador", render: (e: any) => (
              <div>
                <p className="font-medium text-[var(--text-primary)]">{e.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatCpf(e.cpf)}</p>
              </div>
            )},
            { key: "role", header: "Cargo", render: (e: any) => (
              <div>
                <p className="text-sm">{e.role}</p>
                <p className="text-xs text-[var(--text-muted)]">{e.department}</p>
              </div>
            )},
            { key: "hireDate", header: "Admissão", width: "w-28", render: (e: any) => formatDate(e.hireDate) },
            { key: "salary", header: "Salário", width: "w-28", render: (e: any) => formatCurrency(e.salary) },
            { key: "status", header: "Status", width: "w-28", render: (e: any) => (
              <span className={clsx("badge px-2 py-1", getEmployeeStatusBadge(e.status))}>{getEmployeeStatusLabel(e.status)}</span>
            )},
            { key: "actions", header: "", width: "w-24", render: (e: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(e); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${e.name}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setEmployees(prev => prev.filter(x => x.id !== e.id)); toast({ title: "Colaborador removido" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${e.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum colaborador encontrado"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Colaborador" : "Novo Colaborador"}
        fields={[
          { name: "name", label: "Nome completo", type: "text", required: true, defaultValue: editing?.name },
          { name: "cpf", label: "CPF (somente números)", type: "text", required: true, defaultValue: editing?.cpf },
          { name: "email", label: "Email", type: "email", required: true, defaultValue: editing?.email },
          { name: "role", label: "Cargo", type: "text", required: true, defaultValue: editing?.role },
          { name: "department", label: "Departamento", type: "text", required: true, defaultValue: editing?.department ?? "Administrativo" },
          { name: "hireDate", label: "Data de admissão", type: "date", required: true, defaultValue: editing?.hireDate },
          { name: "salary", label: "Salário (centavos)", type: "number", required: true, defaultValue: editing?.salary },
          { name: "workloadHours", label: "Jornada (h/semana)", type: "number", defaultValue: editing?.workloadHours ?? 44 },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Férias
// =========================================================

function VacationsTab() {
  const { toast } = useAdminToast();
  const [vacations, setVacations] = useState(MOCK_VACATIONS);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return vacations.filter(v => statusFilter === "all" || v.status === statusFilter);
  }, [vacations, statusFilter]);

  const updateStatus = (id: string, status: string) => {
    setVacations(prev => prev.map(v => (v.id === id ? { ...v, status, approvedBy: "Administrador" } : v)));
    toast({
      title: status === "approved" ? "Férias aprovadas" : status === "rejected" ? "Férias rejeitadas" : "Status atualizado",
      variant: status === "rejected" ? "warning" : "success",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Férias</h2>
        <div className="w-44">
          <AdminSelect
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Todas" },
              { value: "pending", label: "Pendentes" },
              { value: "approved", label: "Aprovadas" },
              { value: "rejected", label: "Rejeitadas" },
              { value: "completed", label: "Concluídas" },
            ]}
          />
        </div>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "employeeName", header: "Colaborador" },
            { key: "period", header: "Período", render: (v: any) => (
              <span className="text-sm">{formatDate(v.startDate)} – {formatDate(v.endDate)}</span>
            )},
            { key: "days", header: "Dias", width: "w-16" },
            { key: "sell", header: "Abono", width: "w-16", render: (v: any) => v.sellUnusedDays > 0 ? `${v.sellUnusedDays}d` : "—" },
            { key: "requestedAt", header: "Solicitação", width: "w-28", render: (v: any) => formatDate(v.requestedAt) },
            { key: "status", header: "Status", width: "w-32", render: (v: any) => (
              <span className={clsx("badge px-2 py-1", getVacationStatusBadge(v.status))}>{getVacationStatusLabel(v.status)}</span>
            )},
            { key: "actions", header: "", width: "w-28", render: (v: any) => (
              v.status === "pending" ? (
                <div className="flex gap-1">
                  <button onClick={() => updateStatus(v.id, "approved")} className="btn btn-ghost p-1.5 text-[var(--text-success)]" aria-label="Aprovar" title="Aprovar">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateStatus(v.id, "rejected")} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label="Rejeitar" title="Rejeitar">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhuma solicitação"
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Folha
// =========================================================

function PayrollTab() {
  const { toast } = useAdminToast();
  const [month, setMonth] = useState(REFERENCE_MONTH);
  const [processed, setProcessed] = useState<string[]>([]);

  const calculations = useMemo(() => {
    return MOCK_EMPLOYEES.filter(e => e.status === "active").map(emp => {
      const result = calculatePayroll(
        { salary: emp.salary, workloadHours: emp.workloadHours },
        0,
        OVERTIME_RATE,
        { transportVoucher: 0, otherDiscounts: 0 }
      );
      return { ...emp, ...result };
    });
  }, []);

  const totals = useMemo(() => {
    return {
      gross: calculations.reduce((s, c) => s + c.grossTotal, 0),
      inss: calculations.reduce((s, c) => s + c.inssDiscount, 0),
      irrf: calculations.reduce((s, c) => s + c.irrfDiscount, 0),
      net: calculations.reduce((s, c) => s + c.netTotal, 0),
    };
  }, [calculations]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Folha de Pagamento — {formatMonth(month)}</h2>
        <div className="flex gap-2">
          <div className="w-40">
            <AdminInput type="month" value={month} onChange={(e: any) => setMonth(e.target.value)} />
          </div>
          <AdminButton
            onClick={() => { setProcessed(MOCK_EMPLOYEES.map(e => e.id)); toast({ title: "Folha processada", description: `${MOCK_EMPLOYEES.length} colaboradores`, variant: "success" }); }}
          >
            Processar Folha
          </AdminButton>
        </div>
      </div>

      {/* Totais */}
      <div className="grid sm:grid-cols-4 gap-4">
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Bruto Total</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(totals.gross)}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">INSS</p>
          <p className="text-lg font-bold text-[var(--text-warning)]">{formatCurrency(totals.inss)}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">IRRF</p>
          <p className="text-lg font-bold text-[var(--text-danger)]">{formatCurrency(totals.irrf)}</p>
        </AdminSection>
        <AdminSection className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">Líquido Total</p>
          <p className="text-lg font-bold text-[var(--text-success)]">{formatCurrency(totals.net)}</p>
        </AdminSection>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "name", header: "Colaborador" },
            { key: "salary", header: "Salário Base", width: "w-28", render: (c: any) => formatCurrency(c.salary) },
            { key: "inss", header: "INSS", width: "w-24", render: (c: any) => <span className="text-[var(--text-warning)]">−{formatCurrency(c.inssDiscount)}</span> },
            { key: "irrf", header: "IRRF", width: "w-24", render: (c: any) => <span className="text-[var(--text-danger)]">−{formatCurrency(c.irrfDiscount)}</span> },
            { key: "net", header: "Líquido", width: "w-28", render: (c: any) => <strong className="text-[var(--text-success)]">{formatCurrency(c.netTotal)}</strong> },
            { key: "processed", header: "Status", width: "w-28", render: (c: any) => (
              <span className={clsx("badge px-2 py-1", processed.includes(c.id) ? "badge-success" : "badge-outline")}>
                {processed.includes(c.id) ? "Processado" : "Pendente"}
              </span>
            )},
          ]}
          data={calculations}
          emptyMessage="Nenhum colaborador ativo"
        />
      </AdminSection>

      <p className="text-xs text-[var(--text-muted)]">
        💡 Cálculos de INSS e IRRF seguem as tabelas progressivas vigentes (estimativa). Em produção, integre com sistema contábil certificado.
      </p>
    </div>
  );
}

// =========================================================
// Ponto
// =========================================================

function PointTab() {
  const [search, setSearch] = useState("");

  const records = [
    { id: "r1", employee: "Ana Paula Souza", date: "2026-11-02", clockIn: "08:02", lunchOut: "12:00", lunchIn: "13:01", clockOut: "17:35", worked: 534, overtime: 0, status: "complete" },
    { id: "r2", employee: "Carlos Eduardo Lima", date: "2026-11-02", clockIn: "08:15", lunchOut: "12:05", lunchIn: "12:58", clockOut: null, worked: 0, overtime: 0, status: "incomplete" },
    { id: "r3", employee: "Marcos Antônio Rocha", date: "2026-11-02", clockIn: "07:55", lunchOut: "12:00", lunchIn: "13:00", clockOut: "17:52", worked: 597, overtime: 27, status: "complete" },
    { id: "r4", employee: "Patrícia Gomes", date: "2026-11-02", clockIn: "08:00", lunchOut: "12:10", lunchIn: "13:05", clockOut: "17:30", worked: 495, overtime: 0, status: "complete" },
    { id: "r5", employee: "Rafael Alves", date: "2026-11-02", clockIn: "08:40", lunchOut: "12:15", lunchIn: "13:10", clockOut: null, worked: 0, overtime: 0, status: "incomplete" },
  ];

  const filtered = records.filter(r => !search || r.employee.toLowerCase().includes(search.toLowerCase()));

  const formatMinutesLocal = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}h${String(min).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Registros de Ponto</h2>

      <div className="max-w-md">
        <AdminInput placeholder="Buscar colaborador..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "employee", header: "Colaborador" },
            { key: "date", header: "Data", width: "w-28", render: (r: any) => formatDate(r.date) },
            { key: "clockIn", header: "Entrada", width: "w-20", render: (r: any) => <span className="font-mono text-sm">{r.clockIn}</span> },
            { key: "lunch", header: "Almoço", width: "w-28", render: (r: any) => <span className="font-mono text-sm text-[var(--text-muted)]">{r.lunchOut}–{r.lunchIn}</span> },
            { key: "clockOut", header: "Saída", width: "w-20", render: (r: any) => <span className="font-mono text-sm">{r.clockOut || "—"}</span> },
            { key: "worked", header: "Total", width: "w-24", render: (r: any) => (
              <span>
                {r.worked > 0 ? formatMinutesLocal(r.worked) : "—"}
                {r.overtime > 0 && <span className="text-[var(--text-success)] text-xs ml-1">+{formatMinutesLocal(r.overtime)}</span>}
              </span>
            )},
            { key: "status", header: "Status", width: "w-28", render: (r: any) => (
              <span className={clsx("badge px-2 py-1", r.status === "complete" ? "badge-success" : "badge-warning")}>
                {r.status === "complete" ? "Completo" : "Em andamento"}
              </span>
            )},
          ]}
          data={filtered}
          emptyMessage="Nenhum registro"
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Configurações
// =========================================================

function SettingsTab() {
  const { toast } = useAdminToast();
  const [config, setConfig] = useState({
    companyName: "TechDistribuida LTDA",
    cnpj: "12345678000190",
    standardWorkloadHours: 44,
    lunchBreakMinutes: 60,
    toleranceMinutes: 10,
    overtimeRate: 1.5,
    autoApproveVacations: false,
    emailNotifications: true,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h2>

      <AdminSection title="Empresa" className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="Razão Social">
            <AdminInput value={config.companyName} onChange={(e: any) => setConfig(prev => ({ ...prev, companyName: e.target.value }))} />
          </AdminField>
          <AdminField label="CNPJ">
            <AdminInput value={config.cnpj} onChange={(e: any) => setConfig(prev => ({ ...prev, cnpj: e.target.value }))} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="Jornada e Ponto" className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminField label="Jornada padrão (h/semana)">
            <AdminInput type="number" value={String(config.standardWorkloadHours)} onChange={(e: any) => setConfig(prev => ({ ...prev, standardWorkloadHours: Number(e.target.value) }))} />
          </AdminField>
          <AdminField label="Intervalo almoço (min)">
            <AdminInput type="number" value={String(config.lunchBreakMinutes)} onChange={(e: any) => setConfig(prev => ({ ...prev, lunchBreakMinutes: Number(e.target.value) }))} />
          </AdminField>
          <AdminField label="Tolerância (min)">
            <AdminInput type="number" value={String(config.toleranceMinutes)} onChange={(e: any) => setConfig(prev => ({ ...prev, toleranceMinutes: Number(e.target.value) }))} />
          </AdminField>
          <AdminField label="Hora extra (multiplicador)">
            <AdminInput type="number" step="0.1" value={String(config.overtimeRate)} onChange={(e: any) => setConfig(prev => ({ ...prev, overtimeRate: Number(e.target.value) }))} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="Férias e Notificações" className="card p-5">
        <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-muted)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Aprovação automática de férias</p>
            <p className="text-xs text-[var(--text-muted)]">Solicitações são aprovadas sem intervenção do gestor</p>
          </div>
          <AdminSwitch
            value={config.autoApproveVacations ? "on" : "off"}
            onChange={(v: string) => setConfig(prev => ({ ...prev, autoApproveVacations: v === "on" }))}
          />
        </div>
        <div className="flex items-center justify-between py-2.5">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Notificações por email</p>
            <p className="text-xs text-[var(--text-muted)]">Avisa gestores de novas solicitações</p>
          </div>
          <AdminSwitch
            value={config.emailNotifications ? "on" : "off"}
            onChange={(v: string) => setConfig(prev => ({ ...prev, emailNotifications: v === "on" }))}
          />
        </div>
      </AdminSection>

      <div className="flex justify-end">
        <AdminButton onClick={() => toast({ title: "Configurações salvas", variant: "success" })} variant="primary">
          Salvar Configurações
        </AdminButton>
      </div>
    </div>
  );
}
