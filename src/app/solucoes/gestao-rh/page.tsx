"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/layout/DemoShell";
import { useLocalStorage } from "@/lib/use-local-storage";
import { formatDate } from "@/lib/cn";

// ---------- Modelos ----------
type Status = "ativo" | "férias" | "afastado" | "desligado";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: Status;
  hireDate: string;
  salary: number;
  vacations?: Array<{ from: string; to: string; note?: string }>;
}

const DEPARTMENTS = ["Engenharia", "Produto", "Comercial", "Financeiro", "RH", "Operações"];

const INITIAL: Employee[] = [
  {
    id: "e1",
    name: "Júlia Ferreira",
    email: "julia@empresa.demo",
    role: "Engenheira de Software Sênior",
    department: "Engenharia",
    status: "ativo",
    hireDate: "2021-03-12",
    salary: 14500,
    vacations: [{ from: "2025-01-10", to: "2025-01-25", note: "Férias de janeiro" }],
  },
  {
    id: "e2",
    name: "Rafael Souza",
    email: "rafael@empresa.demo",
    role: "Product Designer",
    department: "Produto",
    status: "ativo",
    hireDate: "2022-08-01",
    salary: 11200,
  },
  {
    id: "e3",
    name: "Mariana Costa",
    email: "mariana@empresa.demo",
    role: "Gerente Comercial",
    department: "Comercial",
    status: "férias",
    hireDate: "2019-05-20",
    salary: 16000,
    vacations: [{ from: "2025-12-20", to: "2026-01-05", note: "Férias de fim de ano" }],
  },
  {
    id: "e4",
    name: "Pedro Almeida",
    email: "pedro@empresa.demo",
    role: "Analista Financeiro",
    department: "Financeiro",
    status: "ativo",
    hireDate: "2023-02-14",
    salary: 8400,
  },
  {
    id: "e5",
    name: "Camila Rocha",
    email: "camila@empresa.demo",
    role: "Analista de RH",
    department: "RH",
    status: "ativo",
    hireDate: "2024-01-10",
    salary: 7200,
  },
  {
    id: "e6",
    name: "Thiago Nunes",
    email: "thiago@empresa.demo",
    role: "Técnico de Operações",
    department: "Operações",
    status: "afastado",
    hireDate: "2020-11-02",
    salary: 6800,
  },
];

// ---------- Componente ----------
export default function GestaoRHPage() {
  const { value: employees, setValue: setEmployees, reset } = useLocalStorage<Employee[]>(
    "nexis:rh:employees",
    INITIAL,
  );
  const [tab, setTab] = useState<"dashboard" | "employees" | "vacations">("dashboard");

  return (
    <DemoShell
      title="Gestão de RH"
      subtitle="Colaboradores, departamentos, férias e indicadores"
      kind="Demonstração funcional"
      solutionSlug="gestao-rh"
      accent="emerald"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
              Demo · RH fictício
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">Painel de Pessoas</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Restaurar dados de demonstração?")) reset();
            }}
            className="inline-flex h-9 items-center rounded-lg border border-nx-border px-3 text-xs text-nx-muted hover:bg-nx-surface-alt hover:text-white"
          >
            Restaurar dados
          </button>
        </div>

        <nav className="mb-5 flex gap-2 border-b border-nx-border">
          {(
            [
              ["dashboard", "Visão geral"],
              ["employees", "Colaboradores"],
              ["vacations", "Férias e ausências"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`border-b-2 px-3 py-2 text-sm transition ${
                tab === k
                  ? "border-emerald-400 text-white"
                  : "border-transparent text-nx-muted hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && <Dashboard employees={employees} />}
        {tab === "employees" && <EmployeesTab employees={employees} setEmployees={setEmployees} />}
        {tab === "vacations" && <VacationsTab employees={employees} setEmployees={setEmployees} />}
      </div>
    </DemoShell>
  );
}

// ---------- Dashboard ----------
function Dashboard({ employees }: { employees: Employee[] }) {
  const active = employees.filter((e) => e.status === "ativo").length;
  const onVacation = employees.filter((e) => e.status === "férias").length;
  const away = employees.filter((e) => e.status === "afastado").length;
  const byDept = useMemo(() => {
    const m = new Map<string, number>();
    employees.forEach((e) => m.set(e.department, (m.get(e.department) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [employees]);

  const avgSalary =
    employees.length > 0
      ? employees.reduce((s, e) => s + e.salary, 0) / employees.length
      : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Colaboradores" value={String(employees.length)} hint="no total" />
        <Kpi label="Ativos" value={String(active)} hint="em atividade" tone="emerald" />
        <Kpi label="Em férias" value={String(onVacation)} hint="atualmente" tone="amber" />
        <Kpi label="Afastados" value={String(away)} hint="atualmente" tone="rose" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Distribuição por departamento</p>
          <ul className="mt-4 space-y-3">
            {byDept.map(([dept, count]) => {
              const pct = (count / employees.length) * 100;
              return (
                <li key={dept}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{dept}</span>
                    <span className="text-nx-muted">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-nx-surface-alt">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Indicadores</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Remuneração média" v={formatBRL(avgSalary)} />
            <Row k="Departamentos" v={String(byDept.length)} />
            <Row
              k="Maior departamento"
              v={byDept[0] ? `${byDept[0][0]} (${byDept[0][1]})` : "—"}
            />
            <Row k="Última contratação" v={lastHire(employees)} />
          </dl>
          <p className="mt-4 text-xs text-nx-muted">
            Recursos como cálculo de folha, benefícios e controle de ponto podem
            ser implementados como módulos personalizados, conforme a necessidade
            da sua operação.
          </p>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "slate",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "slate" | "emerald" | "amber" | "rose";
}) {
  const colors: Record<string, string> = {
    slate: "text-white",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
  };
  return (
    <div className="rounded-2xl border border-nx-border bg-nx-surface p-4">
      <p className="text-xs text-nx-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${colors[tone]}`}>{value}</p>
      <p className="text-xs text-nx-muted">{hint}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-nx-border/70 pb-2 last:border-0">
      <dt className="text-nx-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

function formatBRL(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function lastHire(list: Employee[]) {
  if (list.length === 0) return "—";
  const sorted = list
    .slice()
    .sort((a, b) => (a.hireDate < b.hireDate ? 1 : -1));
  return formatDate(sorted[0].hireDate);
}

// ---------- Colaboradores ----------
function EmployeesTab({
  employees,
  setEmployees,
}: {
  employees: Employee[];
  setEmployees: (fn: (p: Employee[]) => Employee[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("Todos");
  const [status, setStatus] = useState<Status | "todos">("todos");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase();
    if (q && !(e.name + " " + e.email + " " + e.role).toLowerCase().includes(q)) return false;
    if (dept !== "Todos" && e.department !== dept) return false;
    if (status !== "todos" && e.status !== status) return false;
    return true;
  });

  function save(emp: Employee) {
    setEmployees((list) => {
      const exists = list.some((x) => x.id === emp.id);
      if (exists) return list.map((x) => (x.id === emp.id ? emp : x));
      return [...list, emp];
    });
    setEditing(null);
    setCreating(false);
  }

  function remove(id: string) {
    if (!confirm("Remover colaborador?")) return;
    setEmployees((list) => list.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar colaborador..."
          className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none"
        />
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm"
        >
          <option>Todos</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "todos")}
          className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="férias">Em férias</option>
          <option value="afastado">Afastado</option>
          <option value="desligado">Desligado</option>
        </select>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="ml-auto inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          + Novo colaborador
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum colaborador encontrado." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <article key={e.id} className="rounded-2xl border border-nx-border bg-nx-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-xs text-nx-muted">{e.role}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <p className="mt-3 text-xs text-nx-muted">{e.department}</p>
              <p className="text-xs text-nx-muted">{e.email}</p>
              <p className="text-xs text-nx-muted">Admissão: {formatDate(e.hireDate)}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(e)}
                  className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <EmployeeForm
          initial={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    ativo: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    férias: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    afastado: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    desligado: "bg-white/5 text-nx-muted border-white/10",
  };
  const labels: Record<Status, string> = {
    ativo: "Ativo",
    férias: "Férias",
    afastado: "Afastado",
    desligado: "Desligado",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function EmployeeForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Employee | null;
  onClose: () => void;
  onSave: (e: Employee) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [department, setDepartment] = useState(initial?.department ?? DEPARTMENTS[0]);
  const [status, setStatus] = useState<Status>(initial?.status ?? "ativo");
  const [hireDate, setHireDate] = useState(initial?.hireDate ?? new Date().toISOString().slice(0, 10));
  const [salary, setSalary] = useState(String(initial?.salary ?? ""));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome.";
    if (!email.trim()) e.email = "Informe o e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
    if (!role.trim()) e.role = "Informe o cargo.";
    if (!hireDate) e.hireDate = "Informe a data de admissão.";
    if (Number.isNaN(Number(salary)) || Number(salary) < 0) e.salary = "Salário inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: initial?.id ?? `e${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department,
      status,
      hireDate,
      salary: Number(salary),
      vacations: initial?.vacations ?? [],
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar colaborador" : "Novo colaborador"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="E-mail" error={errors.email}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Cargo" error={errors.role}>
          <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Departamento">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={inputCls}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={inputCls}
          >
            <option value="ativo">Ativo</option>
            <option value="férias">Férias</option>
            <option value="afastado">Afastado</option>
            <option value="desligado">Desligado</option>
          </select>
        </Labeled>
        <Labeled label="Data de admissão" error={errors.hireDate}>
          <input
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
            className={inputCls}
          />
        </Labeled>
        <div className="sm:col-span-2">
          <Labeled label="Salário (BRL)" error={errors.salary}>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={inputCls}
            />
          </Labeled>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button type="button" onClick={submit} className="btn-primary-emerald">
          Salvar
        </button>
      </div>
    </Modal>
  );
}

// ---------- Férias ----------
function VacationsTab({
  employees,
  setEmployees,
}: {
  employees: Employee[];
  setEmployees: (fn: (p: Employee[]) => Employee[]) => void;
}) {
  const [empId, setEmpId] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    if (!empId) return setError("Selecione um colaborador.");
    if (!from || !to) return setError("Informe as datas.");
    if (from > to) return setError("A data final deve ser posterior à inicial.");
    setEmployees((list) =>
      list.map((e) =>
        e.id === empId
          ? { ...e, vacations: [...(e.vacations ?? []), { from, to, note: note.trim() || undefined }] }
          : e,
      ),
    );
    setEmpId("");
    setFrom("");
    setTo("");
    setNote("");
  }

  function removeVacation(empId: string, idx: number) {
    setEmployees((list) =>
      list.map((e) =>
        e.id === empId ? { ...e, vacations: (e.vacations ?? []).filter((_, i) => i !== idx) } : e,
      ),
    );
  }

  const withVacations = employees.filter((e) => (e.vacations?.length ?? 0) > 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
        <p className="text-sm font-semibold">Registrar férias ou ausência</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className={inputCls}
          >
            <option value="">Selecione colaborador...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
            placeholder="Início"
            aria-label="Data inicial"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
            placeholder="Fim"
            aria-label="Data final"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputCls}
            placeholder="Observação (opcional)"
          />
        </div>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        <button
          type="button"
          onClick={add}
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Registrar
        </button>
      </div>

      {withVacations.length === 0 ? (
        <Empty label="Nenhum período registrado." />
      ) : (
        <div className="space-y-4">
          {withVacations.map((e) => (
            <div key={e.id} className="rounded-2xl border border-nx-border bg-nx-surface p-5">
              <p className="font-semibold">{e.name}</p>
              <p className="text-xs text-nx-muted">
                {e.role} · {e.department}
              </p>
              <ul className="mt-3 divide-y divide-nx-border">
                {(e.vacations ?? []).map((v, i) => (
                  <li key={i} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p>
                        {formatDate(v.from)} → {formatDate(v.to)}
                      </p>
                      {v.note && <p className="text-xs text-nx-muted">{v.note}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVacation(e.id, i)}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- UI helpers ----------
const inputCls =
  "h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none";

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-nx-border bg-nx-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-nx-border px-2 py-1 text-sm hover:bg-nx-surface-alt"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Labeled({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}
    </label>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-nx-border bg-nx-surface p-10 text-center">
      <p className="text-sm text-nx-muted">{label}</p>
    </div>
  );
}
