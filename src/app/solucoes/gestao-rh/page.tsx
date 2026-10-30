"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/layout/DemoShell";
import { useLocalStorage } from "@/lib/use-local-storage";
import { currencyBRL, formatDate } from "@/lib/cn";
import { nextId } from "@/lib/id";
import { useModalA11y } from "@/lib/use-modal-a11y";

// ---------- Modelos ----------
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  level: "estagiario" | "junior" | "pleno" | "senior" | "gerente" | "diretor";
  status: "active" | "vacation" | "leave" | "terminated";
  hireDate: string;
  salary: number;
  birthDate?: string;
  address?: string;
  emergencyContact?: { name: string; phone: string };
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: "pending" | "paid" | "cancelled";
  payDate?: string;
}

interface Benefit {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "health" | "dental" | "meal" | "transport" | "gym" | "education" | "other";
  name: string;
  value: number;
  provider?: string;
  startDate: string;
  endDate?: string;
  status: "active" | "inactive";
}

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakMinutes: number;
  totalHours: number;
  status: "normal" | "late" | "early_leave" | "absent" | "overtime";
}

interface Document {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "contract" | "ndf" | "medical" | "certificate" | "id" | "other";
  name: string;
  fileName?: string;
  uploadDate: string;
  expiryDate?: string;
  status: "valid" | "expiring" | "expired";
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  period: string; // YYYY-H1 / YYYY-H2
  score: number; // 1-5
  strengths: string;
  improvements: string;
  goals: string;
  date: string;
  status: "draft" | "completed" | "acknowledged";
}

interface JobOpening {
  id: string;
  title: string;
  department: string;
  level: string;
  description: string;
  requirements: string;
  salaryRange: { min: number; max: number };
  status: "open" | "closed" | "on_hold";
  postedDate: string;
  applications: number;
}

interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  resume?: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  appliedDate: string;
  notes?: string;
}

// ---------- Dados iniciais ----------
const DEPARTMENTS = ["Engenharia", "Comercial", "Produto", "Marketing", "RH", "Financeiro", "Operações", "Suporte"];
const POSITIONS = [
  "Estagiário", "Desenvolvedor Júnior", "Desenvolvedor Pleno", "Desenvolvedor Sênior",
  "Tech Lead", "Gerente de Engenharia", "Diretor de Tecnologia",
  "SDR", "Account Executive", "Gerente Comercial",
  "Product Manager", "UX Designer", "Product Designer",
  "Analista de Marketing", "Gerente de Marketing",
  "Analista de RH", "Business Partner",
  "Analista Financeiro", "Controller",
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Júlia Ferreira", email: "julia@empresa.com", phone: "(11) 98765-4321", department: "Engenharia", position: "Tech Lead", level: "senior", status: "active", hireDate: "2022-03-15", salary: 18500, birthDate: "1992-07-22", address: "Rua das Flores, 123 - São Paulo/SP", emergencyContact: { name: "Roberto Ferreira", phone: "(11) 99999-8888" } },
  { id: "e2", name: "Mariana Costa", email: "mariana@empresa.com", phone: "(21) 98765-1234", department: "Comercial", position: "Gerente Comercial", level: "gerente", status: "vacation", hireDate: "2021-08-10", salary: 15200, birthDate: "1988-11-03", address: "Av. Copacabana, 456 - Rio de Janeiro/RJ", emergencyContact: { name: "Carlos Costa", phone: "(21) 98888-7777" } },
  { id: "e3", name: "Rafael Souza", email: "rafael@empresa.com", phone: "(31) 98765-5678", department: "Produto", position: "Product Manager", level: "pleno", status: "active", hireDate: "2023-01-20", salary: 12800, birthDate: "1995-02-18", address: "Rua da Liberdade, 789 - Belo Horizonte/MG", emergencyContact: { name: "Ana Souza", phone: "(31) 97777-6666" } },
  { id: "e4", name: "Carlos Mendes", email: "carlos@empresa.com", phone: "(41) 98765-9012", department: "Engenharia", position: "Desenvolvedor Sênior", level: "senior", status: "active", hireDate: "2022-11-05", salary: 14500, birthDate: "1990-09-12", address: "Rua XV de Novembro, 321 - Curitiba/PR", emergencyContact: { name: "Lucia Mendes", phone: "(41) 96666-5555" } },
  { id: "e5", name: "Fernanda Lima", email: "fernanda@empresa.com", phone: "(51) 98765-3456", department: "Marketing", position: "Gerente de Marketing", level: "gerente", status: "active", hireDate: "2021-05-12", salary: 13800, birthDate: "1989-04-25", address: "Av. Ipiranga, 654 - Porto Alegre/RS", emergencyContact: { name: "Pedro Lima", phone: "(51) 95555-4444" } },
  { id: "e6", name: "Lucas Oliveira", email: "lucas@empresa.com", phone: "(11) 98765-7890", department: "Engenharia", position: "Desenvolvedor Pleno", level: "pleno", status: "active", hireDate: "2023-06-18", salary: 10500, birthDate: "1996-12-08", address: "Rua Augusta, 987 - São Paulo/SP", emergencyContact: { name: "Maria Oliveira", phone: "(11) 94444-3333" } },
  { id: "e7", name: "Amanda Santos", email: "amanda@empresa.com", phone: "(21) 98765-2345", department: "RH", position: "Business Partner", level: "pleno", status: "active", hireDate: "2023-02-28", salary: 9800, birthDate: "1994-06-14", address: "Rua Barão de Iguatemi, 147 - Rio de Janeiro/RJ", emergencyContact: { name: "João Santos", phone: "(21) 93333-2222" } },
  { id: "e8", name: "Bruno Alves", email: "bruno@empresa.com", phone: "(31) 98765-6789", department: "Comercial", position: "Account Executive", level: "junior", status: "active", hireDate: "2023-09-10", salary: 7200, birthDate: "1997-01-30", address: "Av. Afonso Pena, 258 - Belo Horizonte/MG", emergencyContact: { name: "Paula Alves", phone: "(31) 92222-1111" } },
];

const todayISO = () => new Date().toISOString();
const monthISO = () => new Date().toISOString().slice(0, 7);

const INITIAL_PAYROLL: PayrollEntry[] = [
  { id: "pp1", employeeId: "e1", employeeName: "Júlia Ferreira", month: monthISO(), baseSalary: 18500, overtime: 1200, bonuses: 3000, deductions: 4500, netPay: 18500 + 1200 + 3000 - 4500, status: "paid", payDate: new Date().toISOString().slice(0, 10) },
  { id: "pp2", employeeId: "e2", employeeName: "Mariana Costa", month: monthISO(), baseSalary: 15200, overtime: 0, bonuses: 2500, deductions: 3800, netPay: 15200 + 0 + 2500 - 3800, status: "paid", payDate: new Date().toISOString().slice(0, 10) },
  { id: "pp3", employeeId: "e3", employeeName: "Rafael Souza", month: monthISO(), baseSalary: 12800, overtime: 800, bonuses: 1500, deductions: 3200, netPay: 12800 + 800 + 1500 - 3200, status: "pending" },
  { id: "pp4", employeeId: "e4", employeeName: "Carlos Mendes", month: monthISO(), baseSalary: 14500, overtime: 1500, bonuses: 2000, deductions: 3600, netPay: 14500 + 1500 + 2000 - 3600, status: "pending" },
  { id: "pp5", employeeId: "e5", employeeName: "Fernanda Lima", month: monthISO(), baseSalary: 13800, overtime: 0, bonuses: 3000, deductions: 3400, netPay: 13800 + 0 + 3000 - 3400, status: "pending" },
  { id: "pp6", employeeId: "e6", employeeName: "Lucas Oliveira", month: monthISO(), baseSalary: 10500, overtime: 600, bonuses: 1000, deductions: 2600, netPay: 10500 + 600 + 1000 - 2600, status: "pending" },
  { id: "pp7", employeeId: "e7", employeeName: "Amanda Santos", month: monthISO(), baseSalary: 9800, overtime: 0, bonuses: 800, deductions: 2400, netPay: 9800 + 0 + 800 - 2400, status: "pending" },
  { id: "pp8", employeeId: "e8", employeeName: "Bruno Alves", month: monthISO(), baseSalary: 7200, overtime: 400, bonuses: 500, deductions: 1800, netPay: 7200 + 400 + 500 - 1800, status: "pending" },
];

const INITIAL_BENEFITS: Benefit[] = [
  { id: "b1", employeeId: "e1", employeeName: "Júlia Ferreira", type: "health", name: "Plano Saúde Premium", value: 800, provider: "SulAmérica", startDate: "2022-03-15", status: "active" },
  { id: "b2", employeeId: "e1", employeeName: "Júlia Ferreira", type: "dental", name: "Plano Odontológico", value: 120, provider: "OdontoPrev", startDate: "2022-03-15", status: "active" },
  { id: "b3", employeeId: "e1", employeeName: "Júlia Ferreira", type: "meal", name: "Vale Refeição", value: 900, provider: "Alelo", startDate: "2022-03-15", status: "active" },
  { id: "b4", employeeId: "e2", employeeName: "Mariana Costa", type: "health", name: "Plano Saúde Master", value: 750, provider: "Bradesco Saúde", startDate: "2021-08-10", status: "active" },
  { id: "b5", employeeId: "e2", employeeName: "Maria Costa", type: "meal", name: "Vale Refeição", value: 900, provider: "Alelo", startDate: "2021-08-10", status: "active" },
  { id: "b6", employeeId: "e3", employeeName: "Rafael Souza", type: "health", name: "Plano Saúde Standard", value: 500, provider: "Unimed", startDate: "2023-01-20", status: "active" },
  { id: "b7", employeeId: "e3", employeeName: "Rafael Souza", type: "transport", name: "Vale Transporte", value: 300, provider: "VTB", startDate: "2023-01-20", status: "active" },
  { id: "b8", employeeId: "e4", employeeName: "Carlos Mendes", type: "health", name: "Plano Saúde Premium", value: 800, provider: "SulAmérica", startDate: "2022-11-05", status: "active" },
  { id: "b9", employeeId: "e4", employeeName: "Carlos Mendes", type: "gym", name: "Gympass", value: 150, provider: "Gympass", startDate: "2023-01-15", status: "active" },
];

const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  { id: "t1", employeeId: "e1", employeeName: "Júlia Ferreira", date: new Date().toISOString().slice(0, 10), checkIn: "08:55", checkOut: "18:05", breakMinutes: 60, totalHours: 8.5, status: "normal" },
  { id: "t2", employeeId: "e2", employeeName: "Mariana Costa", date: new Date().toISOString().slice(0, 10), checkIn: undefined, checkOut: undefined, breakMinutes: 0, totalHours: 0, status: "absent" },
  { id: "t3", employeeId: "e3", employeeName: "Rafael Souza", date: new Date().toISOString().slice(0, 10), checkIn: "09:00", checkOut: "18:15", breakMinutes: 60, totalHours: 8.75, status: "normal" },
  { id: "t4", employeeId: "e4", employeeName: "Carlos Mendes", date: new Date().toISOString().slice(0, 10), checkIn: "08:30", checkOut: "19:00", breakMinutes: 60, totalHours: 9.5, status: "overtime" },
  { id: "t5", employeeId: "e5", employeeName: "Fernanda Lima", date: new Date().toISOString().slice(0, 10), checkIn: "08:58", checkOut: "18:02", breakMinutes: 60, totalHours: 8.05, status: "normal" },
  { id: "t6", employeeId: "e6", employeeName: "Lucas Oliveira", date: new Date().toISOString().slice(0, 10), checkIn: "09:15", checkOut: "18:10", breakMinutes: 60, totalHours: 8.0, status: "late" },
  { id: "t7", employeeId: "e7", employeeName: "Amanda Santos", date: new Date().toISOString().slice(0, 10), checkIn: "08:55", checkOut: "18:00", breakMinutes: 60, totalHours: 8.1, status: "normal" },
  { id: "t8", employeeId: "e8", employeeName: "Bruno Alves", date: new Date().toISOString().slice(0, 10), checkIn: "08:50", checkOut: "17:45", breakMinutes: 60, totalHours: 8.0, status: "early_leave" },
];

const INITIAL_DOCUMENTS: Document[] = [
  { id: "d1", employeeId: "e1", employeeName: "Júlia Ferreira", type: "contract", name: "Contrato de Trabalho", fileName: "contrato_julia.pdf", uploadDate: "2022-03-15", expiryDate: "2025-03-15", status: "valid" },
  { id: "d2", employeeId: "e1", employeeName: "Júlia Ferreira", type: "medical", name: "ASO Admissional", fileName: "aso_julia.pdf", uploadDate: "2022-03-10", expiryDate: "2024-03-10", status: "expired" },
  { id: "d3", employeeId: "e2", employeeName: "Mariana Costa", type: "contract", name: "Contrato de Trabalho", fileName: "contrato_mariana.pdf", uploadDate: "2021-08-10", expiryDate: "2024-08-10", status: "expiring" },
  { id: "d4", employeeId: "e3", employeeName: "Rafael Souza", type: "contract", name: "Contrato de Trabalho", fileName: "contrato_rafael.pdf", uploadDate: "2023-01-20", expiryDate: "2025-01-20", status: "valid" },
  { id: "d5", employeeId: "e3", employeeName: "Rafael Souza", type: "certificate", name: "Certificado PMP", fileName: "pmp_rafael.pdf", uploadDate: "2022-05-15", expiryDate: "2025-05-15", status: "valid" },
];

const INITIAL_REVIEWS: PerformanceReview[] = [
  { id: "pr1", employeeId: "e1", employeeName: "Júlia Ferreira", reviewerId: "e5", reviewerName: "Fernanda Lima", period: "2024-H1", score: 4.5, strengths: "Liderança técnica excepcional, mentoria ativa, entrega consistente.", improvements: "Delegação de tarefas operacionais.", goals: "Expandir atuação para arquitetura de sistemas.", date: "2024-06-15", status: "completed" },
  { id: "pr2", employeeId: "e3", employeeName: "Rafael Souza", reviewerId: "e1", reviewerName: "Júlia Ferreira", period: "2024-H1", score: 4.0, strengths: "Visão de produto, comunicação com stakeholders.", improvements: "Gestão de prazos em projetos complexos.", goals: "Liderar squad de novo produto.", date: "2024-06-20", status: "acknowledged" },
  { id: "pr3", employeeId: "e6", employeeName: "Lucas Oliveira", reviewerId: "e1", reviewerName: "Júlia Ferreira", period: "2024-H1", score: 3.8, strengths: "Qualidade de código, proatividade.", improvements: "Comunicação em code reviews.", goals: "Evoluir para Sênior até Q4.", date: "2024-06-25", status: "completed" },
];

const INITIAL_JOB_OPENINGS: JobOpening[] = [
  { id: "jo1", title: "Desenvolvedor Full Stack Sênior", department: "Engenharia", level: "senior", description: "Desenvolvimento de aplicações web escaláveis.", requirements: "React, Node.js, TypeScript, PostgreSQL, AWS", salaryRange: { min: 14000, max: 18000 }, status: "open", postedDate: "2024-10-15", applications: 23 },
  { id: "jo2", title: "Product Designer", department: "Produto", level: "pleno", description: "Design de interfaces e experiências digitais.", requirements: "Figma, Design System, Prototyping, User Research", salaryRange: { min: 9000, max: 12000 }, status: "open", postedDate: "2024-10-20", applications: 15 },
  { id: "jo3", title: "Analista de RH Jr", department: "RH", level: "junior", description: "Suporte a processos de RH e DP.", requirements: "Administração/Psicologia, Excel, comunicação", salaryRange: { min: 4000, max: 5500 }, status: "open", postedDate: "2024-10-25", applications: 8 },
];

const INITIAL_CANDIDATES: Candidate[] = [
  { id: "cand1", jobId: "jo1", jobTitle: "Desenvolvedor Full Stack Sênior", name: "Pedro Henrique", email: "pedro@email.com", phone: "(11) 99999-0000", linkedin: "linkedin.com/in/pedro", stage: "interview", appliedDate: "2024-10-18", notes: "Experiência forte com React/Node, passou no screening técnico" },
  { id: "cand2", jobId: "jo1", jobTitle: "Desenvolvedor Full Stack Sênior", name: "Ana Beatriz", email: "ana@email.com", phone: "(21) 98888-0000", linkedin: "linkedin.com/in/ana", stage: "screening", appliedDate: "2024-10-22", notes: "Aguardando teste técnico" },
  { id: "cand3", jobId: "jo2", jobTitle: "Product Designer", name: "Carlos Eduardo", email: "carlos@email.com", phone: "(31) 97777-0000", linkedin: "linkedin.com/in/carlos", stage: "offer", appliedDate: "2024-10-21", notes: "Portfolio excelente, alinhado com cultura" },
];

// ---------- Componente principal ----------
export default function GestaoRHPage() {
  const { value: employees, setValue: setEmployees, reset: resetEmployees } = useLocalStorage<Employee[]>(
    "nexis:rh:employees",
    INITIAL_EMPLOYEES,
  );
  const { value: payroll, setValue: setPayroll, reset: resetPayroll } = useLocalStorage<PayrollEntry[]>(
    "nexis:rh:payroll",
    INITIAL_PAYROLL,
  );
  const { value: benefits, setValue: setBenefits, reset: resetBenefits } = useLocalStorage<Benefit[]>(
    "nexis:rh:benefits",
    INITIAL_BENEFITS,
  );
  const { value: timeEntries, setValue: setTimeEntries, reset: resetTimeEntries } = useLocalStorage<TimeEntry[]>(
    "nexis:rh:timeEntries",
    INITIAL_TIME_ENTRIES,
  );
  const { value: documents, setValue: setDocuments, reset: resetDocuments } = useLocalStorage<Document[]>(
    "nexis:rh:documents",
    INITIAL_DOCUMENTS,
  );
  const { value: reviews, setValue: setReviews, reset: resetReviews } = useLocalStorage<PerformanceReview[]>(
    "nexis:rh:reviews",
    INITIAL_REVIEWS,
  );
  const { value: jobOpenings, setValue: setJobOpenings, reset: resetJobOpenings } = useLocalStorage<JobOpening[]>(
    "nexis:rh:jobOpenings",
    INITIAL_JOB_OPENINGS,
  );
  const { value: candidates, setValue: setCandidates, reset: resetCandidates } = useLocalStorage<Candidate[]>(
    "nexis:rh:candidates",
    INITIAL_CANDIDATES,
  );

  const [tab, setTab] = useState<
    "dashboard" | "employees" | "payroll" | "benefits" | "time" | "documents" | "performance" | "recruitment"
  >("dashboard");

  function resetAll() {
    if (confirm("Restaurar dados de demonstração? Suas alterações locais serão perdidas.")) {
      resetEmployees();
      resetPayroll();
      resetBenefits();
      resetTimeEntries();
      resetDocuments();
      resetReviews();
      resetJobOpenings();
      resetCandidates();
    }
  }

  return (
    <DemoShell
      title="Gestão de RH"
      subtitle="Colaboradores, folha, benefícios, ponto, documentos, avaliações, recrutamento"
      kind="Demonstração funcional"
      solutionSlug="gestao-rh"
      accent="emerald"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
              Demo · Ambiente administrativo fictício
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">Painel RH</h1>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex h-9 items-center rounded-lg border border-nx-border px-3 text-xs text-nx-muted hover:bg-nx-surface-alt hover:text-white"
          >
            Restaurar dados de demonstração
          </button>
        </div>

        <nav className="mb-5 flex flex-wrap gap-2 border-b border-nx-border">
          {(
            [
              ["dashboard", "Dashboard"],
              ["employees", "Colaboradores"],
              ["payroll", "Folha"],
              ["benefits", "Benefícios"],
              ["time", "Ponto"],
              ["documents", "Documentos"],
              ["performance", "Avaliações"],
              ["recruitment", "Recrutamento"],
            ] as const
          ).map(([k, label]) => (
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
              {label}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && <Dashboard employees={employees} payroll={payroll} benefits={benefits} timeEntries={timeEntries} documents={documents} reviews={reviews} jobOpenings={jobOpenings} candidates={candidates} />}
        {tab === "employees" && <EmployeesTab employees={employees} setEmployees={setEmployees} />}
        {tab === "payroll" && <PayrollTab payroll={payroll} setPayroll={setPayroll} employees={employees} />}
        {tab === "benefits" && <BenefitsTab benefits={benefits} setBenefits={setBenefits} employees={employees} />}
        {tab === "time" && <TimeTab timeEntries={timeEntries} setTimeEntries={setTimeEntries} employees={employees} />}
        {tab === "documents" && <DocumentsTab documents={documents} setDocuments={setDocuments} employees={employees} />}
        {tab === "performance" && <PerformanceTab reviews={reviews} setReviews={setReviews} employees={employees} />}
        {tab === "recruitment" && <RecruitmentTab jobOpenings={jobOpenings} setJobOpenings={setJobOpenings} candidates={candidates} setCandidates={setCandidates} />}
      </div>
    </DemoShell>
  );
}

// ---------- Dashboard ----------
function Dashboard({
  employees,
  payroll,
  benefits,
  timeEntries,
  documents,
  reviews,
  jobOpenings,
  candidates,
}: {
  employees: Employee[];
  payroll: PayrollEntry[];
  benefits: Benefit[];
  timeEntries: TimeEntry[];
  documents: Document[];
  reviews: PerformanceReview[];
  jobOpenings: JobOpening[];
  candidates: Candidate[];
}) {
  const activeEmployees = employees.filter((e) => e.status === "active");
  const onLeave = employees.filter((e) => e.status !== "active" && e.status !== "terminated").length;
  const thisMonthPayroll = payroll.filter((p) => p.month === monthISO());
  const payrollTotal = thisMonthPayroll.reduce((s, p) => s + p.netPay, 0);
  const pendingPayroll = thisMonthPayroll.filter((p) => p.status === "pending").length;
  const todayEntries = timeEntries.filter((t) => t.date === new Date().toISOString().slice(0, 10));
  const presentToday = todayEntries.filter((t) => t.totalHours > 0).length;
  const lateToday = todayEntries.filter((t) => t.status === "late").length;
  const expiringDocs = documents.filter((d) => d.status === "expiring" || d.status === "expired").length;
  const openJobs = jobOpenings.filter((j) => j.status === "open").length;
  const activeCandidates = candidates.filter((c) => !["hired", "rejected"].includes(c.stage)).length;

  const kpis = [
    { label: "Colaboradores ativos", value: String(activeEmployees.length), hint: `+${onLeave} ausentes` },
    { label: "Folha do mês", value: currencyBRL(payrollTotal), hint: `${pendingPayroll} pendentes` },
    { label: "Presentes hoje", value: `${presentToday}/${activeEmployees.length}`, hint: `${lateToday} atrasos` },
    { label: "Docs vencendo", value: String(expiringDocs), hint: "expirados ou a expirar", alert: expiringDocs > 0 },
    { label: "Vagas abertas", value: String(openJobs), hint: "recrutamento ativo" },
    { label: "Candidatos em processo", value: String(activeCandidates), hint: "em seleção" },
    { label: "Avaliações pendentes", value: String(reviews.filter((r) => r.status === "draft").length), hint: "a concluir" },
    { label: "Benefícios ativos", value: String(benefits.filter((b) => b.status === "active").length), hint: "por colaborador" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl border border-nx-border bg-nx-surface p-4 ${k.alert ? "border-rose-500/30" : ""}`}>
            <p className="text-xs text-nx-muted">{k.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${k.alert ? "text-rose-300" : ""}`}>{k.value}</p>
            <p className="text-xs text-nx-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-2">
          <p className="text-sm font-semibold">Equipe por departamento</p>
          <div className="mt-3 space-y-2">
            {useMemo(() => {
              const byDept = new Map<string, number>();
              activeEmployees.forEach((e) => byDept.set(e.department, (byDept.get(e.department) || 0) + 1));
              return Array.from(byDept.entries()).sort((a, b) => b[1] - a[1]);
            }, [activeEmployees]).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between text-sm py-1.5 border-b border-nx-border/50">
                <span>{dept}</span>
                <span className="font-semibold text-emerald-300">{count} {count === 1 ? "pessoa" : "pessoas"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Ponto de hoje</p>
          <div className="mt-3 space-y-2">
            {todayEntries.length === 0 ? (
              <p className="text-sm text-nx-muted">Nenhum registro hoje.</p>
            ) : (
              todayEntries.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1 border-b border-nx-border/50">
                  <span>{t.employeeName}</span>
                  <span className={`flex items-center gap-1.5 ${t.status === "late" ? "text-amber-300" : t.status === "absent" ? "text-rose-300" : t.status === "overtime" ? "text-emerald-300" : "text-white"}`}>
                    {t.status === "absent" ? "Ausente" : `${t.totalHours}h`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-2">
          <p className="text-sm font-semibold">Folha de pagamento - Mês atual</p>
          {thisMonthPayroll.length === 0 ? (
            <p className="mt-3 text-sm text-nx-muted">Folha não processada.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {thisMonthPayroll.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-nx-border/50">
                  <span>{p.employeeName}</span>
                  <span className={`${p.status === "paid" ? "text-emerald-300" : "text-amber-300"}`}>
                    {currencyBRL(p.netPay)} · {p.status === "paid" ? "Pago" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-1">
          <p className="text-sm font-semibold">Aniversariantes do mês</p>
          <div className="mt-3 space-y-2">
            {employees
              .filter((e) => e.birthDate && e.birthDate.slice(5, 7) === new Date().toISOString().slice(5, 7))
              .map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-nx-border/50">
                  <span>{e.name}</span>
                  <span className="text-emerald-300">{formatDate(e.birthDate!)}</span>
                </div>
              )) || <p className="text-sm text-nx-muted">Nenhum este mês.</p>}
          </div>
        </div>
      </div>
    </div>
  );
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
  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = employees.filter((e) => {
    if (filterDept !== "all" && e.department !== filterDept) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q)
    );
  });

  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))).sort(), [employees]);

  function save(e: Employee) {
    setEmployees((list) => {
      const exists = list.some((x) => x.id === e.id);
      if (exists) return list.map((x) => (x.id === e.id ? e : x));
      return [...list, e];
    });
    setEditing(null);
    setCreating(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este colaborador?")) return;
    setEmployees((list) => list.filter((e) => e.id !== id));
  }

  function updateStatus(id: string, status: Employee["status"]) {
    setEmployees((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar colaborador..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none" />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none">
          <option value="all">Todos departamentos</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none">
          <option value="all">Todos status</option>
          <option value="active">Ativo</option>
          <option value="vacation">Férias</option>
          <option value="leave">Licença</option>
          <option value="terminated">Desligado</option>
        </select>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Novo colaborador</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum colaborador encontrado." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-2xl border border-nx-border bg-nx-surface p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{e.name}</p>
                  <p className="text-xs text-nx-muted">{e.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  e.status === "active" ? "bg-emerald-500/20 text-emerald-300" :
                  e.status === "vacation" ? "bg-amber-500/20 text-amber-300" :
                  e.status === "leave" ? "bg-sky-500/20 text-sky-300" :
                  "bg-rose-500/20 text-rose-300"
                }`}>
                  {e.status === "active" ? "Ativo" : e.status === "vacation" ? "Férias" : e.status === "leave" ? "Licença" : "Desligado"}
                </span>
              </div>
              <p className="mt-1 text-xs text-nx-muted">{e.department} · {e.position}</p>
              <p className="text-xs text-nx-muted">Admissão: {formatDate(e.hireDate)}</p>
              <p className="text-xs text-nx-muted">Salário: {currencyBRL(e.salary)}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing(e)} className="flex-1 rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt">Editar</button>
                <select value={e.status} onChange={(ev) => updateStatus(e.id, ev.target.value as Employee["status"])} className="flex-1 h-8 rounded-md border border-nx-border bg-nx-surface-alt px-2 text-xs text-nx-text" />
                <button type="button" onClick={() => remove(e.id)} className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && <EmployeeForm initial={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={save} />}
    </div>
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
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [level, setLevel] = useState(initial?.level ?? "pleno");
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [hireDate, setHireDate] = useState(initial?.hireDate ?? new Date().toISOString().slice(0, 10));
  const [salary, setSalary] = useState(String(initial?.salary ?? ""));
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [emergencyName, setEmergencyName] = useState(initial?.emergencyContact?.name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(initial?.emergencyContact?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
    if (!department.trim()) e.department = "Informe o departamento.";
    if (!position.trim()) e.position = "Informe o cargo.";
    if (Number.isNaN(Number(salary)) || Number(salary) < 0) e.salary = "Salário inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;

    onSave({
      id: initial?.id ?? nextId("e"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      position: position.trim(),
      level: level as Employee["level"],
      status: status as Employee["status"],
      hireDate,
      salary: Number(salary),
      birthDate: birthDate || undefined,
      address: address.trim() || undefined,
      emergencyContact: emergencyName && emergencyPhone ? { name: emergencyName.trim(), phone: emergencyPhone.trim() } : undefined,
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar colaborador" : "Novo colaborador"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="E-mail" error={errors.email}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Telefone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Departamento" error={errors.department}>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Labeled>
        <Labeled label="Cargo" error={errors.position}>
          <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputCls}>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Labeled>
        <Labeled label="Nível">
          <select value={level} onChange={(e) => setLevel(e.target.value as Employee["level"])} className={inputCls}>
            <option value="estagiario">Estagiário</option>
            <option value="junior">Júnior</option>
            <option value="pleno">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="gerente">Gerente</option>
            <option value="diretor">Diretor</option>
          </select>
        </Labeled>
        <Labeled label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as Employee["status"])} className={inputCls}>
            <option value="active">Ativo</option>
            <option value="vacation">Férias</option>
            <option value="leave">Licença</option>
            <option value="terminated">Desligado</option>
          </select>
        </Labeled>
        <Labeled label="Data admissão"><input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Salário" error={errors.salary}><input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Data nascimento"><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Endereço"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Contato emergência - Nome"><input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Contato emergência - Telefone"><input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={inputCls} /></Labeled>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Folha de Pagamento ----------
function PayrollTab({
  payroll,
  setPayroll,
  employees,
}: {
  payroll: PayrollEntry[];
  setPayroll: (fn: (p: PayrollEntry[]) => PayrollEntry[]) => void;
  employees: Employee[];
}) {
  const [month, setMonth] = useState(monthISO());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = payroll.filter((p) => {
    if (p.month !== month) return false;
    if (!query.trim()) return true;
    return p.employeeName.toLowerCase().includes(query.toLowerCase());
  });

  const totalGross = filtered.reduce((s, p) => s + p.baseSalary + p.overtime + p.bonuses, 0);
  const totalDeductions = filtered.reduce((s, p) => s + p.deductions, 0);
  const totalNet = filtered.reduce((s, p) => s + p.netPay, 0);

  function save(entry: PayrollEntry) {
    setPayroll((list) => {
      const exists = list.some((x) => x.id === entry.id);
      if (exists) return list.map((x) => (x.id === entry.id ? entry : x));
      return [...list, entry];
    });
    setOpen(false);
  }

  function markPaid(id: string) {
    setPayroll((list) => list.map((p) => (p.id === id ? { ...p, status: "paid" as const, payDate: new Date().toISOString().slice(0, 10) } : p)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-nx-muted">Mês</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm" />
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none" />
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Lançar folha</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-4">
          <p className="text-xs text-nx-muted">Total bruto</p>
          <p className="mt-1 text-2xl font-semibold">{currencyBRL(totalGross)}</p>
        </div>
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-4">
          <p className="text-xs text-nx-muted">Total descontos</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">{currencyBRL(totalDeductions)}</p>
        </div>
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-4">
          <p className="text-xs text-nx-muted">Total líquido</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{currencyBRL(totalNet)}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum lançamento para este mês." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3 text-right">Base</th>
                  <th className="px-4 py-3 text-right">H. Extra</th>
                  <th className="px-4 py-3 text-right">Bônus</th>
                  <th className="px-4 py-3 text-right">Descontos</th>
                  <th className="px-4 py-3 text-right">Líquido</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-nx-surface-alt">
                    <td className="px-4 py-3 font-medium">{p.employeeName}</td>
                    <td className="px-4 py-3 text-right">{currencyBRL(p.baseSalary)}</td>
                    <td className="px-4 py-3 text-right">{currencyBRL(p.overtime)}</td>
                    <td className="px-4 py-3 text-right">{currencyBRL(p.bonuses)}</td>
                    <td className="px-4 py-3 text-right text-rose-300">{currencyBRL(p.deductions)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{currencyBRL(p.netPay)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "paid" ? "bg-emerald-500/20 text-emerald-300" : p.status === "pending" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : "Cancelado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "pending" && <button type="button" onClick={() => markPaid(p.id)} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">Marcar pago</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <PayrollModal employees={employees} month={month} onClose={() => setOpen(false)} onSave={save} />}
    </div>
  );
}

function PayrollModal({
  employees,
  month,
  onClose,
  onSave,
}: {
  employees: Employee[];
  month: string;
  onClose: () => void;
  onSave: (p: PayrollEntry) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [overtime, setOvertime] = useState("0");
  const [bonuses, setBonuses] = useState("0");
  const [deductions, setDeductions] = useState("0");
  const [errors, setErrors] = useState<string | null>(null);

  const employee = employees.find((e) => e.id === employeeId);
  const baseSalary = employee?.salary ?? 0;
  const netPay = baseSalary + Number(overtime) + Number(bonuses) - Number(deductions);

  function submit() {
    if (!employeeId) { setErrors("Selecione um colaborador."); return; }
    if (Number.isNaN(Number(overtime)) || Number.isNaN(Number(bonuses)) || Number.isNaN(Number(deductions))) { setErrors("Valores inválidos."); return; }
    const entry: PayrollEntry = {
      id: nextId("pp"),
      employeeId,
      employeeName: employee!.name,
      month,
      baseSalary,
      overtime: Number(overtime),
      bonuses: Number(bonuses),
      deductions: Number(deductions),
      netPay,
      status: "pending",
    };
    onSave(entry);
  }

  return (
    <Modal onClose={onClose} title="Lançamento de folha">
      <label className="block text-sm font-semibold">Colaborador</label>
      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
        <option value="">Selecione...</option>
        {employees.filter(e => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name} — {currencyBRL(e.salary)}</option>)}
      </select>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Labeled label="Salário base"><input type="number" value={baseSalary} readOnly className={inputCls + " bg-nx-bg"} /></Labeled>
        <Labeled label="Horas extras"><input type="number" value={overtime} onChange={(e) => setOvertime(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Bônus"><input type="number" value={bonuses} onChange={(e) => setBonuses(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Descontos"><input type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} className={inputCls} /></Labeled>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-nx-border bg-nx-surface p-3">
        <span className="text-sm text-nx-muted">Salário líquido estimado</span>
        <span className="text-lg font-semibold text-emerald-300">{currencyBRL(netPay)}</span>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Salvar lançamento</button>
      </div>
    </Modal>
  );
}

// ---------- Benefícios ----------
function BenefitsTab({
  benefits,
  setBenefits,
  employees,
}: {
  benefits: Benefit[];
  setBenefits: (fn: (p: Benefit[]) => Benefit[]) => void;
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = benefits.filter((b) => {
    if (filterType !== "all" && b.type !== filterType) return false;
    if (!query.trim()) return true;
    return b.employeeName.toLowerCase().includes(query.toLowerCase()) || b.name.toLowerCase().includes(query.toLowerCase());
  });

  const types: Benefit["type"][] = ["health", "dental", "meal", "transport", "gym", "education", "other"];

  function save(b: Benefit) {
    setBenefits((list) => {
      const exists = list.some((x) => x.id === b.id);
      if (exists) return list.map((x) => (x.id === b.id ? b : x));
      return [...list, b];
    });
    setOpen(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este benefício?")) return;
    setBenefits((list) => list.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
          <option value="all">Todos tipos</option>
          {types.map((t) => <option key={t} value={t}>{t === "health" ? "Saúde" : t === "dental" ? "Odontológico" : t === "meal" ? "Refeição" : t === "transport" ? "Transporte" : t === "gym" ? "Academia" : t === "education" ? "Educação" : "Outro"}</option>)}
        </select>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Adicionar benefício</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum benefício encontrado." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Benefício</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-nx-surface-alt">
                    <td className="px-4 py-3">{b.employeeName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs bg-violet-500/20 text-violet-300">{b.type === "health" ? "Saúde" : b.type === "dental" ? "Odonto" : b.type === "meal" ? "Refeição" : b.type === "transport" ? "Transporte" : b.type === "gym" ? "Academia" : b.type === "education" ? "Educação" : "Outro"}</span>
                    </td>
                    <td className="px-4 py-3">{b.name}</td>
                    <td className="px-4 py-3 text-nx-muted">{b.provider || "—"}</td>
                    <td className="px-4 py-3 text-right">{currencyBRL(b.value)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${b.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {b.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => remove(b.id)} className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <BenefitModal employees={employees} onClose={() => setOpen(false)} onSave={save} />}
    </div>
  );
}

function BenefitModal({
  employees,
  onClose,
  onSave,
}: {
  employees: Employee[];
  onClose: () => void;
  onSave: (b: Benefit) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<Benefit["type"]>("health");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  const types: Benefit["type"][] = ["health", "dental", "meal", "transport", "gym", "education", "other"];

  function submit() {
    if (!employeeId) { setErrors("Selecione um colaborador."); return; }
    if (!name.trim()) { setErrors("Informe o nome do benefício."); return; }
    if (Number.isNaN(Number(value)) || Number(value) < 0) { setErrors("Valor inválido."); return; }
    const emp = employees.find((e) => e.id === employeeId);
    const benefit: Benefit = {
      id: nextId("b"),
      employeeId,
      employeeName: emp!.name,
      type,
      name: name.trim(),
      value: Number(value),
      provider: provider.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      status: "active",
    };
    onSave(benefit);
  }

  return (
    <Modal onClose={onClose} title="Novo benefício">
      <label className="block text-sm font-semibold">Colaborador</label>
      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
        <option value="">Selecione...</option>
        {employees.filter(e => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
      </select>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Labeled label="Tipo">
          <select value={type} onChange={(e) => setType(e.target.value as Benefit["type"])} className={inputCls}>
            {types.map((t) => <option key={t} value={t}>{t === "health" ? "Saúde" : t === "dental" ? "Odontológico" : t === "meal" ? "Refeição" : t === "transport" ? "Transporte" : t === "gym" ? "Academia" : t === "education" ? "Educação" : "Outro"}</option>)}
          </select>
        </Labeled>
        <Labeled label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Valor"><input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Fornecedor"><input value={provider} onChange={(e) => setProvider(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Início"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Fim (opcional)"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} /></Labeled>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Ponto ----------
function TimeTab({
  timeEntries,
  setTimeEntries,
  employees,
}: {
  timeEntries: TimeEntry[];
  setTimeEntries: (fn: (p: TimeEntry[]) => TimeEntry[]) => void;
  employees: Employee[];
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [open, setOpen] = useState(false);

  const todayEntries = timeEntries.filter((t) => t.date === date);
  const activeEmployees = employees.filter((e) => e.status === "active");

  function save(entry: TimeEntry) {
    setTimeEntries((list) => {
      const exists = list.some((x) => x.id === entry.id);
      if (exists) return list.map((x) => (x.id === entry.id ? entry : x));
      return [...list, entry];
    });
    setOpen(false);
  }

  function registerAll() {
    activeEmployees.forEach((e) => {
      if (!todayEntries.some((t) => t.employeeId === e.id)) {
        save({
          id: nextId("t"),
          employeeId: e.id,
          employeeName: e.name,
          date,
          checkIn: "09:00",
          checkOut: "18:00",
          breakMinutes: 60,
          totalHours: 8,
          status: "normal",
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-nx-muted">Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm" />
        </div>
        <button type="button" onClick={registerAll} className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400">Registrar todos (09h-18h)</button>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Registro manual</button>
      </div>

      {todayEntries.length === 0 ? (
        <Empty label="Nenhum registro para esta data." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Saída</th>
                  <th className="px-4 py-3">Intervalo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {todayEntries.map((t) => (
                  <tr key={t.id} className="hover:bg-nx-surface-alt">
                    <td className="px-4 py-3">{t.employeeName}</td>
                    <td className="px-4 py-3">{t.checkIn || "—"}</td>
                    <td className="px-4 py-3">{t.checkOut || "—"}</td>
                    <td className="px-4 py-3">{t.breakMinutes} min</td>
                    <td className="px-4 py-3 font-semibold">{t.totalHours}h</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "normal" ? "bg-emerald-500/20 text-emerald-300" : t.status === "late" ? "bg-amber-500/20 text-amber-300" : t.status === "overtime" ? "bg-sky-500/20 text-sky-300" : t.status === "early_leave" ? "bg-violet-500/20 text-violet-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {t.status === "normal" ? "Normal" : t.status === "late" ? "Atraso" : t.status === "overtime" ? "H. Extra" : t.status === "early_leave" ? "Saída antec." : "Ausente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <TimeModal employees={employees} date={date} onClose={() => setOpen(false)} onSave={save} />}
    </div>
  );
}

function TimeModal({
  employees,
  date,
  onClose,
  onSave,
}: {
  employees: Employee[];
  date: string;
  onClose: () => void;
  onSave: (t: TimeEntry) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("18:00");
  const [breakMinutes, setBreakMinutes] = useState("60");
  const [errors, setErrors] = useState<string | null>(null);

  function submit() {
    if (!employeeId) { setErrors("Selecione um colaborador."); return; }
    const [hi, mi] = checkIn.split(":").map(Number);
    const [ho, mo] = checkOut.split(":").map(Number);
    const total = (ho * 60 + mo - hi * 60 - mi - Number(breakMinutes)) / 60;
    if (total <= 0) { setErrors("Horário inválido."); return; }
    const emp = employees.find((e) => e.id === employeeId);
    const entry: TimeEntry = {
      id: nextId("t"),
      employeeId,
      employeeName: emp!.name,
      date,
      checkIn,
      checkOut,
      breakMinutes: Number(breakMinutes),
      totalHours: total,
      status: total > 8.5 ? "overtime" : checkIn > "09:00" ? "late" : checkOut < "18:00" ? "early_leave" : "normal",
    };
    onSave(entry);
  }

  return (
    <Modal onClose={onClose} title="Registro de ponto manual">
      <label className="block text-sm font-semibold">Colaborador</label>
      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
        <option value="">Selecione...</option>
        {employees.filter(e => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Labeled label="Entrada"><input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Saída"><input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Intervalo (min)"><input type="number" value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)} className={inputCls} /></Labeled>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Registrar</button>
      </div>
    </Modal>
  );
}

// ---------- Documentos ----------
function DocumentsTab({
  documents,
  setDocuments,
  employees,
}: {
  documents: Document[];
  setDocuments: (fn: (p: Document[]) => Document[]) => void;
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = documents.filter((d) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (!query.trim()) return true;
    return d.employeeName.toLowerCase().includes(query.toLowerCase()) || d.name.toLowerCase().includes(query.toLowerCase());
  });

  function save(d: Document) {
    setDocuments((list) => {
      const exists = list.some((x) => x.id === d.id);
      if (exists) return list.map((x) => (x.id === d.id ? d : x));
      return [...list, d];
    });
    setOpen(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este documento?")) return;
    setDocuments((list) => list.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar documento..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
          <option value="all">Todos</option>
          <option value="valid">Válidos</option>
          <option value="expiring">A vencer</option>
          <option value="expired">Vencidos</option>
        </select>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Novo documento</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum documento encontrado." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Validade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((d) => (
                  <tr key={d.id} className={`hover:bg-nx-surface-alt ${d.status === "expired" ? "bg-rose-500/5" : d.status === "expiring" ? "bg-amber-500/5" : ""}`}>
                    <td className="px-4 py-3">{d.employeeName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs bg-violet-500/20 text-violet-300">{d.type === "contract" ? "Contrato" : d.type === "ndf" ? "NDF" : d.type === "medical" ? "ASO" : d.type === "certificate" ? "Certificado" : d.type === "id" ? "Identidade" : "Outro"}</span>
                    </td>
                    <td className="px-4 py-3">{d.name}</td>
                    <td className="px-4 py-3 text-nx-muted">{d.expiryDate ? formatDate(d.expiryDate) : "Indeterminado"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${d.status === "valid" ? "bg-emerald-500/20 text-emerald-300" : d.status === "expiring" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {d.status === "valid" ? "Válido" : d.status === "expiring" ? "A vencer" : "Vencido"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => remove(d.id)} className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <DocumentModal employees={employees} onClose={() => setOpen(false)} onSave={save} />}
    </div>
  );
}

function DocumentModal({
  employees,
  onClose,
  onSave,
}: {
  employees: Employee[];
  onClose: () => void;
  onSave: (d: Document) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<Document["type"]>("contract");
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  const types: Document["type"][] = ["contract", "ndf", "medical", "certificate", "id", "other"];

  function submit() {
    if (!employeeId) { setErrors("Selecione um colaborador."); return; }
    if (!name.trim()) { setErrors("Informe o nome do documento."); return; }
    const emp = employees.find((e) => e.id === employeeId);
    const doc: Document = {
      id: nextId("d"),
      employeeId,
      employeeName: emp!.name,
      type,
      name: name.trim(),
      fileName: fileName.trim() || undefined,
      uploadDate,
      expiryDate: expiryDate || undefined,
      status: expiryDate ? (new Date(expiryDate) < new Date() ? "expired" : new Date(expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "expiring" : "valid") : "valid",
    };
    onSave(doc);
  }

  return (
    <Modal onClose={onClose} title="Novo documento">
      <label className="block text-sm font-semibold">Colaborador</label>
      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
        <option value="">Selecione...</option>
        {employees.filter(e => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
      </select>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Labeled label="Tipo">
          <select value={type} onChange={(e) => setType(e.target.value as Document["type"])} className={inputCls}>
            {types.map((t) => <option key={t} value={t}>{t === "contract" ? "Contrato" : t === "ndf" ? "NDF" : t === "medical" ? "ASO/Médico" : t === "certificate" ? "Certificado" : t === "id" ? "Identidade" : "Outro"}</option>)}
          </select>
        </Labeled>
        <Labeled label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Arquivo (opcional)"><input value={fileName} onChange={(e) => setFileName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Upload"><input type="date" value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Validade (opcional)"><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputCls} /></Labeled>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Avaliações ----------
function PerformanceTab({
  reviews,
  setReviews,
  employees,
}: {
  reviews: PerformanceReview[];
  setReviews: (fn: (p: PerformanceReview[]) => PerformanceReview[]) => void;
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PerformanceReview | null>(null);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = reviews.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (!query.trim()) return true;
    return r.employeeName.toLowerCase().includes(query.toLowerCase());
  });

  function save(r: PerformanceReview) {
    setReviews((list) => {
      const exists = list.some((x) => x.id === r.id);
      if (exists) return list.map((x) => (x.id === r.id ? r : x));
      return [...list, r];
    });
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-emerald-500/60 focus:outline-none" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
          <option value="all">Todos</option>
          <option value="draft">Rascunho</option>
          <option value="completed">Concluída</option>
          <option value="acknowledged">Reconhecida</option>
        </select>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Nova avaliação</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhuma avaliação encontrada." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-nx-border bg-nx-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{r.employeeName}</p>
                  <p className="text-xs text-nx-muted">{r.period} · Avaliador: {r.reviewerName}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : r.status === "acknowledged" ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {r.status === "completed" ? "Concluída" : r.status === "acknowledged" ? "Reconhecida" : "Rascunho"}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">Nota: <span className="text-emerald-300">{r.score.toFixed(1)} / 5.0</span></p>
              <p className="mt-2 text-xs text-nx-muted line-clamp-2"><strong>Pontos fortes:</strong> {r.strengths}</p>
              <p className="mt-1 text-xs text-nx-muted line-clamp-2"><strong>A melhorar:</strong> {r.improvements}</p>
              <p className="mt-1 text-xs text-nx-muted line-clamp-2"><strong>Metas:</strong> {r.goals}</p>
              <div className="mt-3 flex gap-2">
                {r.status === "draft" && <button type="button" onClick={() => setReviews((list) => list.map((x) => x.id === r.id ? { ...x, status: "completed" as const } : x))} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">Finalizar</button>}
                <button type="button" onClick={() => setEditing(r)} className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt">Editar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(open || editing) && <ReviewModal employees={employees} initial={editing} onClose={() => { setOpen(false); setEditing(null); }} onSave={save} />}
    </div>
  );
}

function ReviewModal({
  employees,
  initial,
  onClose,
  onSave,
}: {
  employees: Employee[];
  initial: PerformanceReview | null;
  onClose: () => void;
  onSave: (r: PerformanceReview) => void;
}) {
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? "");
  const [reviewerId, setReviewerId] = useState(initial?.reviewerId ?? "");
  const [period, setPeriod] = useState(initial?.period ?? (() => { const d = new Date(); return `${d.getFullYear()}-H${d.getMonth() < 6 ? 1 : 2}`; })());
  const [score, setScore] = useState(String(initial?.score ?? 3));
  const [strengths, setStrengths] = useState(initial?.strengths ?? "");
  const [improvements, setImprovements] = useState(initial?.improvements ?? "");
  const [goals, setGoals] = useState(initial?.goals ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [errors, setErrors] = useState<string | null>(null);

  function submit() {
    if (!employeeId) { setErrors("Selecione um colaborador."); return; }
    if (!reviewerId) { setErrors("Selecione o avaliador."); return; }
    if (employeeId === reviewerId) { setErrors("Colaborador não pode se autoavaliar."); return; }
    if (Number.isNaN(Number(score)) || Number(score) < 1 || Number(score) > 5) { setErrors("Nota deve ser entre 1 e 5."); return; }
    const emp = employees.find((e) => e.id === employeeId);
    const rev = employees.find((e) => e.id === reviewerId);
    const review: PerformanceReview = {
      id: initial?.id ?? nextId("pr"),
      employeeId,
      employeeName: emp!.name,
      reviewerId,
      reviewerName: rev!.name,
      period,
      score: Number(score),
      strengths: strengths.trim(),
      improvements: improvements.trim(),
      goals: goals.trim(),
      date: initial?.date ?? todayISO(),
      status: status as PerformanceReview["status"],
    };
    onSave(review);
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar avaliação" : "Nova avaliação"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Colaborador">
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={inputCls}>
            <option value="">Selecione...</option>
            {employees.filter(e => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Labeled>
        <Labeled label="Avaliador">
          <select value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} className={inputCls}>
            <option value="">Selecione...</option>
            {employees.filter(e => e.status === "active").map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Labeled>
        <Labeled label="Período"><input value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls} placeholder="2024-H1" /></Labeled>
        <Labeled label="Nota (1-5)"><input type="number" step="0.1" min="1" max="5" value={score} onChange={(e) => setScore(e.target.value)} className={inputCls} /></Labeled>
        <div className="sm:col-span-2"><Labeled label="Pontos fortes"><textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2} className={inputCls} /></Labeled></div>
        <div className="sm:col-span-2"><Labeled label="Pontos a melhorar"><textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} rows={2} className={inputCls} /></Labeled></div>
        <div className="sm:col-span-2"><Labeled label="Metas"><textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} className={inputCls} /></Labeled></div>
        <Labeled label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as PerformanceReview["status"])} className={inputCls}>
            <option value="draft">Rascunho</option>
            <option value="completed">Concluída</option>
            <option value="acknowledged">Reconhecida</option>
          </select>
        </Labeled>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Recrutamento ----------
function RecruitmentTab({
  jobOpenings,
  setJobOpenings,
  candidates,
  setCandidates,
}: {
  jobOpenings: JobOpening[];
  setJobOpenings: (fn: (p: JobOpening[]) => JobOpening[]) => void;
  candidates: Candidate[];
  setCandidates: (fn: (p: Candidate[]) => Candidate[]) => void;
}) {
  const [jobTab, setJobTab] = useState<"jobs" | "candidates">("jobs");
  const [openJob, setOpenJob] = useState(false);
  const [openCandidate, setOpenCandidate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  function saveJob(j: JobOpening) {
    setJobOpenings((list) => {
      const exists = list.some((x) => x.id === j.id);
      if (exists) return list.map((x) => (x.id === j.id ? j : x));
      return [...list, j];
    });
    setOpenJob(false);
  }

  function saveCandidate(c: Candidate) {
    setCandidates((list) => {
      const exists = list.some((x) => x.id === c.id);
      if (exists) return list.map((x) => (x.id === c.id ? c : x));
      return [...list, c];
    });
    setOpenCandidate(false);
  }

  function updateCandidateStage(id: string, stage: Candidate["stage"]) {
    setCandidates((list) => list.map((c) => (c.id === id ? { ...c, stage } : c)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-nx-border pb-2">
        {(["jobs", "candidates"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setJobTab(t)} className={`border-b-2 px-3 py-2 text-sm transition ${jobTab === t ? "border-emerald-400 text-white" : "border-transparent text-nx-muted hover:text-white"}`}>
            {t === "jobs" ? "Vagas" : "Candidatos"}
          </button>
        ))}
      </div>

      {jobTab === "jobs" && (
        <div className="space-y-3">
          <button type="button" onClick={() => setOpenJob(true)} className="inline-flex h-10 items-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-black hover:bg-emerald-400">+ Nova vaga</button>
          {jobOpenings.length === 0 ? (
            <Empty label="Nenhuma vaga cadastrada." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {jobOpenings.map((j) => (
                <div key={j.id} className="rounded-2xl border border-nx-border bg-nx-surface p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{j.title}</p>
                      <p className="text-xs text-nx-muted">{j.department} · {j.level}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${j.status === "open" ? "bg-emerald-500/20 text-emerald-300" : j.status === "on_hold" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {j.status === "open" ? "Aberta" : j.status === "on_hold" ? "Pausada" : "Fechada"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-nx-muted line-clamp-2">{j.description}</p>
                  <p className="mt-2 text-sm font-medium text-emerald-300">
                    {currencyBRL(j.salaryRange.min)} - {currencyBRL(j.salaryRange.max)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-nx-muted">
                    <span>{j.applications} candidaturas</span>
                    <span>Publicada: {formatDate(j.postedDate)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <select value={j.status} onChange={(e) => setJobOpenings((list) => list.map((x) => x.id === j.id ? { ...x, status: e.target.value as JobOpening["status"] } : x))} className="flex-1 h-8 rounded-md border border-nx-border bg-nx-surface-alt px-2 text-xs" />
                    <button type="button" onClick={() => { setSelectedJobId(j.id); setOpenCandidate(true); }} className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt">+ Candidato</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {openJob && <JobModal onClose={() => setOpenJob(false)} onSave={saveJob} />}
        </div>
      )}

      {jobTab === "candidates" && (
        <div className="space-y-3">
          {candidates.length === 0 ? (
            <Empty label="Nenhum candidato cadastrado." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((c) => (
                <div key={c.id} className="rounded-2xl border border-nx-border bg-nx-surface p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-nx-muted">{c.jobTitle}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.stage === "hired" ? "bg-emerald-500/20 text-emerald-300" : c.stage === "rejected" ? "bg-rose-500/20 text-rose-300" : c.stage === "offer" ? "bg-sky-500/20 text-sky-300" : c.stage === "interview" ? "bg-violet-500/20 text-violet-300" : "bg-amber-500/20 text-amber-300"}`}>
                      {c.stage === "applied" ? "Inscrito" : c.stage === "screening" ? "Triagem" : c.stage === "interview" ? "Entrevista" : c.stage === "offer" ? "Proposta" : c.stage === "hired" ? "Contratado" : "Rejeitado"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-nx-muted">{c.email} · {c.phone}</p>
                  {c.linkedin && <p className="mt-1 text-xs text-nx-muted">LinkedIn: {c.linkedin}</p>}
                  <div className="mt-3 flex gap-2">
                    <select value={c.stage} onChange={(e) => updateCandidateStage(c.id, e.target.value as Candidate["stage"])} className="flex-1 h-8 rounded-md border border-nx-border bg-nx-surface-alt px-2 text-xs" />
                  </div>
                  {c.notes && <p className="mt-2 text-xs text-nx-muted line-clamp-2"><strong>Obs:</strong> {c.notes}</p>}
                </div>
              ))}
            </div>
          )}
          {selectedJobId && openCandidate && <CandidateModal jobId={selectedJobId} onClose={() => { setOpenCandidate(false); setSelectedJobId(null); }} onSave={saveCandidate} />}
        </div>
      )}
    </div>
  );
}

function JobModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (j: JobOpening) => void;
}) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("pleno");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  function submit() {
    if (!title.trim()) { setErrors("Informe o título."); return; }
    if (!department.trim()) { setErrors("Informe o departamento."); return; }
    if (Number.isNaN(Number(salaryMin)) || Number.isNaN(Number(salaryMax))) { setErrors("Faixa salarial inválida."); return; }
    const job: JobOpening = {
      id: nextId("jo"),
      title: title.trim(),
      department: department.trim(),
      level,
      description: description.trim(),
      requirements: requirements.trim(),
      salaryRange: { min: Number(salaryMin), max: Number(salaryMax) },
      status: "open",
      postedDate: new Date().toISOString().slice(0, 10),
      applications: 0,
    };
    onSave(job);
  }

  return (
    <Modal onClose={onClose} title="Nova vaga">
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Título" error={errors?.includes("título") ? "Informe o título." : undefined}><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Departamento" error={errors?.includes("departamento") ? "Informe o departamento." : undefined}>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Labeled>
        <Labeled label="Nível">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
            <option value="estagiario">Estagiário</option>
            <option value="junior">Júnior</option>
            <option value="pleno">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="gerente">Gerente</option>
            <option value="diretor">Diretor</option>
          </select>
        </Labeled>
        <Labeled label="Salário mínimo"><input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Salário máximo"><input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={inputCls} /></Labeled>
        <div className="sm:col-span-2"><Labeled label="Descrição"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} /></Labeled></div>
        <div className="sm:col-span-2"><Labeled label="Requisitos"><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={2} className={inputCls} /></Labeled></div>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Criar vaga</button>
      </div>
    </Modal>
  );
}

function CandidateModal({
  jobId,
  onClose,
  onSave,
}: {
  jobId: string;
  onClose: () => void;
  onSave: (c: Candidate) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [stage, setStage] = useState<Candidate["stage"]>("applied");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  function submit() {
    if (!name.trim()) { setErrors("Informe o nome."); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors("E-mail inválido."); return; }
    const candidate: Candidate = {
      id: nextId("cand"),
      jobId,
      jobTitle: "", // será preenchido pelo pai se necessário
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      linkedin: linkedin.trim() || undefined,
      stage,
      appliedDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
    };
    onSave(candidate);
  }

  return (
    <Modal onClose={onClose} title="Novo candidato">
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors?.includes("nome") ? "Informe o nome." : undefined}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="E-mail" error={errors?.includes("E-mail") ? "E-mail inválido." : undefined}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Telefone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="LinkedIn (opcional)"><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Etapa">
          <select value={stage} onChange={(e) => setStage(e.target.value as Candidate["stage"])} className={inputCls}>
            <option value="applied">Inscrito</option>
            <option value="screening">Triagem</option>
            <option value="interview">Entrevista</option>
            <option value="offer">Proposta</option>
            <option value="hired">Contratado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </Labeled>
        <div className="sm:col-span-2"><Labeled label="Observações"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} /></Labeled></div>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-emerald">Salvar</button>
      </div>
    </Modal>
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
  const modalRef = useModalA11y(true, onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-nx-border bg-nx-surface p-5 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-nx-border px-2 py-1 text-sm hover:bg-nx-surface-alt">✕</button>
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