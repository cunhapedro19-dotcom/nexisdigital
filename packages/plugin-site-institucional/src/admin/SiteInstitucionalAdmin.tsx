"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  MessageSquare,
  Newspaper,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Mail,
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
  AdminEditorModalField,
  useAdminToast,
} from "@nexis/ui/admin";
import { formatDate } from "../utils/helpers";
import { clsx } from "clsx";

// =========================================================
// Mock data
// =========================================================

const MOCK_PAGES = [
  { id: "pg1", title: "Home", slug: "/", blocks: 5, isPublished: true, showInMenu: false },
  { id: "pg2", title: "Sobre Nós", slug: "/sobre", blocks: 3, isPublished: true, showInMenu: true },
  { id: "pg3", title: "Política de Privacidade", slug: "/privacidade", blocks: 2, isPublished: true, showInMenu: false },
  { id: "pg4", title: "Planos e Preços", slug: "/planos", blocks: 4, isPublished: false, showInMenu: true },
];

const MOCK_SERVICES = [
  { id: "s1", title: "Contabilidade Mensal", price: 39900, priceNote: "a partir de/mês", featured: true },
  { id: "s2", title: "Abertura de CNPJ", price: 89900, priceNote: "taxa única", featured: true },
  { id: "s3", title: "Folha de Pagamento", price: 1990, priceNote: "por func./mês", featured: false },
  { id: "s4", title: "Consultoria Tributária", price: null, priceNote: null, featured: false },
];

const MOCK_TEAM = [
  { id: "t1", name: "Ricardo Mendes", role: "Sócio-Contador", hasPhoto: false },
  { id: "t2", name: "Fernanda Costa", role: "Departamento Fiscal", hasPhoto: false },
  { id: "t3", name: "Bruno Tanaka", role: "Departamento Pessoal", hasPhoto: false },
];

const MOCK_POSTS = [
  { id: "bp1", title: "Simples Nacional 2026: o que muda nos limites", status: "published", date: "2026-10-15", views: 342 },
  { id: "bp2", title: "MEI: 5 erros que causam desenquadramento", status: "published", date: "2026-09-20", views: 518 },
  { id: "bp3", title: "Guia do eSocial para pequenas empresas", status: "draft", date: "2026-11-01", views: 0 },
];

const MOCK_MESSAGES = [
  { id: "m1", name: "João Pereira", email: "joao@padaria.com", subject: "Trocar de contador", message: "Olá, tenho uma padaria com 3 funcionários e quero saber o valor mensal...", isRead: false, date: "2026-11-01T10:30:00" },
  { id: "m2", name: "Ana Beatriz", email: "ana@lojaroupas.com", subject: "Abertura de CNPJ", message: "Vou abrir uma loja de roupas, preciso de ajuda com o processo...", isRead: false, date: "2026-10-31T16:45:00" },
  { id: "m3", name: "Marcos Duarte", email: "marcos@tech.com", subject: "Consultoria", message: "Faturamos 400k/ano no Lucro Presumido. Vale migrar para o Presumido Real?...", isRead: true, date: "2026-10-28T09:15:00" },
];

// =========================================================
// Layout
// =========================================================

export default function SiteInstitucionalAdmin() {
  return (
    <AdminPageLayout>
      <AdminTabs defaultValue="dashboard">
        <TabsList className="w-full grid grid-cols-7 gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Visão Geral</TabsTrigger>
          <TabsTrigger value="pages"><FileText className="w-4 h-4 mr-2" />Páginas</TabsTrigger>
          <TabsTrigger value="services"><Briefcase className="w-4 h-4 mr-2" />Serviços</TabsTrigger>
          <TabsTrigger value="team"><Users className="w-4 h-4 mr-2" />Equipe</TabsTrigger>
          <TabsTrigger value="blog"><Newspaper className="w-4 h-4 mr-2" />Blog</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 mr-2" />Mensagens</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Config.</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="p-6"><DashboardTab /></TabsContent>
        <TabsContent value="pages" className="p-6"><PagesTab /></TabsContent>
        <TabsContent value="services" className="p-6"><ServicesTab /></TabsContent>
        <TabsContent value="team" className="p-6"><TeamTab /></TabsContent>
        <TabsContent value="blog" className="p-6"><BlogTab /></TabsContent>
        <TabsContent value="messages" className="p-6"><MessagesTab /></TabsContent>
        <TabsContent value="settings" className="p-6"><SettingsTab /></TabsContent>
      </AdminTabs>
    </AdminPageLayout>
  );
}

// =========================================================
// Dashboard
// =========================================================

function DashboardTab() {
  const unread = MOCK_MESSAGES.filter(m => !m.isRead).length;
  const stats = [
    { label: "Páginas Publicadas", value: `${MOCK_PAGES.filter(p => p.isPublished).length}/${MOCK_PAGES.length}`, icon: "📄", color: "var(--brand-cyan)" },
    { label: "Serviços Ativos", value: String(MOCK_SERVICES.length), icon: "💼", color: "var(--text-success)" },
    { label: "Posts no Blog", value: String(MOCK_POSTS.filter(p => p.status === "published").length), icon: "📰", color: "var(--brand-amber)" },
    { label: "Visitas no Blog (30d)", value: "860", icon: "👀", color: "var(--text-primary)" },
    { label: "Mensagens não lidas", value: String(unread), icon: "✉️", color: unread > 0 ? "var(--text-danger)" : "var(--text-secondary)" },
    { label: "Membros da Equipe", value: String(MOCK_TEAM.length), icon: "👥", color: "var(--text-secondary)" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Visão Geral — Nexis Contabilidade</h2>

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
        <AdminSection title="Últimas Mensagens" icon={Mail} className="card">
          <ul className="divide-y divide-[var(--border-default)]">
            {MOCK_MESSAGES.slice(0, 3).map(m => (
              <li key={m.id} className="py-3 flex items-start gap-3">
                <span className={clsx("w-2 h-2 rounded-full mt-2 flex-shrink-0", m.isRead ? "bg-[var(--text-muted)]" : "bg-[var(--brand-cyan)]")} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{m.name} <span className="text-xs text-[var(--text-muted)] font-normal">• {m.subject}</span></p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{m.message}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{formatDate(m.date)}</span>
              </li>
            ))}
          </ul>
        </AdminSection>

        <AdminSection title="Status das Páginas" icon={FileText} className="card">
          <ul className="divide-y divide-[var(--border-default)]">
            {MOCK_PAGES.map(p => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{p.title}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{p.slug} • {p.blocks} blocos</p>
                </div>
                <span className={clsx("badge px-2 py-1", p.isPublished ? "badge-success" : "badge-outline")}>
                  {p.isPublished ? "Publicada" : "Rascunho"}
                </span>
              </li>
            ))}
          </ul>
        </AdminSection>
      </div>
    </div>
  );
}

// =========================================================
// Páginas
// =========================================================

function PagesTab() {
  const { toast } = useAdminToast();
  const [pages, setPages] = useState(MOCK_PAGES);

  const togglePublish = (id: string) => {
    setPages(prev => prev.map(p => (p.id === id ? { ...p, isPublished: !p.isPublished } : p)));
    toast({ title: "Status da página atualizado", variant: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Páginas</h2>
        <AdminButton icon={Plus} onClick={() => toast({ title: "Editor de páginas: em produção, abre o construtor visual de blocos", variant: "success" })}>
          Nova Página
        </AdminButton>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "title", header: "Título" },
            { key: "slug", header: "URL", render: (p: any) => <span className="font-mono text-xs text-[var(--text-muted)]">{p.slug}</span> },
            { key: "blocks", header: "Blocos", width: "w-20" },
            { key: "isPublished", header: "Status", width: "w-32", render: (p: any) => (
              <button onClick={() => togglePublish(p.id)} className={clsx("badge px-2 py-1 cursor-pointer", p.isPublished ? "badge-success" : "badge-outline")}>
                {p.isPublished ? "Publicada" : "Rascunho"}
              </button>
            )},
            { key: "actions", header: "", width: "w-24", render: (p: any) => (
              <div className="flex gap-1">
                <button onClick={() => toast({ title: "Editor visual de blocos", description: `Editando ${p.title}`, variant: "success" })} className="btn btn-ghost p-1.5" aria-label={`Editar ${p.title}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setPages(prev => prev.filter(x => x.id !== p.id)); toast({ title: "Página removida" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${p.title}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={pages}
          emptyMessage="Nenhuma página"
        />
      </AdminSection>

      <div className="card p-4 text-sm text-[var(--text-muted)]">
        💡 O construtor visual de blocos (hero, texto, features, galeria, depoimentos, CTA, formulário e estatísticas) permite montar páginas sem código. Em produção, o botão "Nova Página" abre esse editor.
      </div>
    </div>
  );
}

// =========================================================
// Serviços
// =========================================================

function ServicesTab() {
  const { toast } = useAdminToast();
  const [services, setServices] = useState(MOCK_SERVICES);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_SERVICES)[0] | null>(null);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setServices(prev => prev.map(s => (s.id === editing.id ? { ...s, ...data, price: data.price ? Number(data.price) : null } : s)));
      toast({ title: "Serviço atualizado", variant: "success" });
    } else {
      setServices(prev => [...prev, { ...data, id: `s-${Date.now()}`, price: data.price ? Number(data.price) : null, featured: false }]);
      toast({ title: "Serviço criado", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Serviços</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Novo Serviço
        </AdminButton>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "title", header: "Serviço" },
            { key: "price", header: "Preço", width: "w-44", render: (s: any) =>
              s.price != null ? (
                <span className="font-semibold text-[var(--brand-cyan)]">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.price / 100)}
                  <span className="text-xs font-normal text-[var(--text-muted)] ml-1">{s.priceNote}</span>
                </span>
              ) : "Sob consulta"
            },
            { key: "featured", header: "Destaque", width: "w-24", render: (s: any) => s.featured ? "⭐" : "—" },
            { key: "actions", header: "", width: "w-24", render: (s: any) => (
              <div className="flex gap-1">
                <button onClick={() => { setEditing(s); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${s.title}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setServices(prev => prev.filter(x => x.id !== s.id)); toast({ title: "Serviço removido" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${s.title}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={services}
          emptyMessage="Nenhum serviço"
        />
      </AdminSection>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Serviço" : "Novo Serviço"}
        fields={[
          { name: "title", label: "Título", type: "text", required: true, defaultValue: editing?.title },
          { name: "price", label: "Preço em centavos (vazio = sob consulta)", type: "number", defaultValue: editing?.price ?? undefined },
          { name: "priceNote", label: "Nota de preço (ex: /mês)", type: "text", defaultValue: editing?.priceNote ?? "" },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Equipe
// =========================================================

function TeamTab() {
  const { toast } = useAdminToast();
  const [team, setTeam] = useState(MOCK_TEAM);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof MOCK_TEAM)[0] | null>(null);

  const handleSave = (data: Record<string, any>) => {
    if (editing) {
      setTeam(prev => prev.map(t => (t.id === editing.id ? { ...t, ...data } : t)));
      toast({ title: "Membro atualizado", variant: "success" });
    } else {
      setTeam(prev => [...prev, { ...data, id: `t-${Date.now()}`, hasPhoto: false }]);
      toast({ title: "Membro adicionado", variant: "success" });
    }
    setEditorOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Equipe</h2>
        <AdminButton onClick={() => { setEditing(null); setEditorOpen(true); }} icon={Plus}>
          Adicionar Membro
        </AdminButton>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => (
          <AdminSection key={member.id} className="card p-5 text-center">
            <span className="w-16 h-16 mx-auto rounded-full bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] flex items-center justify-center text-xl font-bold mb-3">
              {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </span>
            <p className="font-bold text-[var(--text-primary)]">{member.name}</p>
            <p className="text-sm text-[var(--text-muted)] mb-3">{member.role}</p>
            <div className="flex justify-center gap-1">
              <button onClick={() => { setEditing(member); setEditorOpen(true); }} className="btn btn-ghost p-1.5" aria-label={`Editar ${member.name}`}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => { setTeam(prev => prev.filter(x => x.id !== member.id)); toast({ title: "Membro removido" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Remover ${member.name}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </AdminSection>
        ))}
      </div>

      <AdminEditorModal
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditing(null); }}
        title={editing ? "Editar Membro" : "Novo Membro"}
        fields={[
          { name: "name", label: "Nome", type: "text", required: true, defaultValue: editing?.name },
          { name: "role", label: "Cargo", type: "text", required: true, defaultValue: editing?.role },
          { name: "bio", label: "Mini bio", type: "textarea", defaultValue: editing?.bio ?? "" },
        ]}
        onSave={handleSave}
      />
    </div>
  );
}

// =========================================================
// Blog
// =========================================================

function BlogTab() {
  const { toast } = useAdminToast();
  const [posts, setPosts] = useState(MOCK_POSTS);

  const togglePublish = (id: string) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p)));
    toast({ title: "Status do post atualizado", variant: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Blog</h2>
        <AdminButton icon={Plus} onClick={() => toast({ title: "Editor de posts: em produção, abre o editor de artigos com Markdown", variant: "success" })}>
          Novo Post
        </AdminButton>
      </div>

      <AdminSection className="card">
        <AdminTable
          columns={[
            { key: "title", header: "Post" },
            { key: "date", header: "Data", width: "w-28", render: (p: any) => formatDate(p.date) },
            { key: "views", header: "Views", width: "w-20" },
            { key: "status", header: "Status", width: "w-32", render: (p: any) => (
              <button onClick={() => togglePublish(p.id)} className={clsx("badge px-2 py-1 cursor-pointer", p.status === "published" ? "badge-success" : "badge-outline")}>
                {p.status === "published" ? "Publicado" : "Rascunho"}
              </button>
            )},
            { key: "actions", header: "", width: "w-24", render: (p: any) => (
              <div className="flex gap-1">
                <button onClick={() => toast({ title: "Editor de posts", description: p.title, variant: "success" })} className="btn btn-ghost p-1.5" aria-label={`Editar ${p.title}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setPosts(prev => prev.filter(x => x.id !== p.id)); toast({ title: "Post removido" }); }} className="btn btn-ghost p-1.5 text-[var(--text-danger)]" aria-label={`Excluir ${p.title}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )},
          ]}
          data={posts}
          emptyMessage="Nenhum post"
        />
      </AdminSection>
    </div>
  );
}

// =========================================================
// Mensagens
// =========================================================

function MessagesTab() {
  const { toast } = useAdminToast();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<(typeof MOCK_MESSAGES)[0] | null>(null);

  const filtered = useMemo(() => {
    if (filter === "unread") return messages.filter(m => !m.isRead);
    if (filter === "read") return messages.filter(m => m.isRead);
    return messages;
  }, [messages, filter]);

  const openMessage = (m: (typeof MOCK_MESSAGES)[0]) => {
    setSelected(m);
    setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, isRead: true } : x)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Mensagens</h2>
        <div className="w-40">
          <AdminSelect
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
            options={[
              { value: "all", label: "Todas" },
              { value: "unread", label: "Não lidas" },
              { value: "read", label: "Lidas" },
            ]}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <AdminSection className="card">
          <ul className="divide-y divide-[var(--border-default)]">
            {filtered.length === 0 && (
              <li className="py-8 text-center text-sm text-[var(--text-muted)]">Nenhuma mensagem</li>
            )}
            {filtered.map(m => (
              <li key={m.id}>
                <button
                  onClick={() => openMessage(m)}
                  className={clsx(
                    "w-full text-left p-4 hover:bg-[var(--bg-secondary)] transition-colors",
                    selected?.id === m.id && "bg-[var(--bg-secondary)]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!m.isRead && <span className="w-2 h-2 rounded-full bg-[var(--brand-cyan)]" aria-hidden="true" />}
                    <p className={clsx("text-sm", m.isRead ? "text-[var(--text-secondary)]" : "font-semibold text-[var(--text-primary)]")}>
                      {m.name}
                    </p>
                    <span className="text-xs text-[var(--text-muted)] ml-auto">{formatDate(m.date)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">{m.subject}: {m.message}</p>
                </button>
              </li>
            ))}
          </ul>
        </AdminSection>

        {/* Detalhe */}
        <AdminSection className="card p-6">
          {selected ? (
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">{selected.subject}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                De <strong>{selected.name}</strong> • {selected.email}
              </p>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line mb-6">{selected.message}</p>
              <div className="flex gap-2">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} className="btn btn-primary text-sm">
                  <Mail className="w-4 h-4 mr-1" /> Responder por email
                </a>
                <button onClick={() => { setMessages(prev => prev.filter(x => x.id !== selected.id)); setSelected(null); toast({ title: "Mensagem excluída" }); }} className="btn btn-ghost text-sm text-[var(--text-danger)]">
                  Excluir
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <Mail className="w-12 h-12 text-[var(--text-muted)] mb-3" aria-hidden="true" />
              <p className="text-sm text-[var(--text-muted)]">Selecione uma mensagem para ler</p>
            </div>
          )}
        </AdminSection>
      </div>
    </div>
  );
}

// =========================================================
// Configurações
// =========================================================

function SettingsTab() {
  const { toast } = useAdminToast();
  const [config, setConfig] = useState({
    companyName: "Nexis Contabilidade",
    tagline: "Sua contabilidade em dia, sua empresa no rumo certo",
    contactEmail: "contato@nexiscontabil.com.br",
    contactPhone: "(11) 3555-4433",
    enableBlog: true,
    enableTeam: true,
  });

  const switchStyle = (key: keyof typeof config, label: string, description?: string) => (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-muted)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
      </div>
      <AdminSwitch
        value={config[key] ? "on" : "off"}
        onChange={(v: string) => setConfig(prev => ({ ...prev, [key]: v === "on" }))}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h2>

      <AdminSection title="Identidade" icon={Settings} className="card p-5 space-y-4">
        <AdminField label="Nome da empresa">
          <AdminInput value={config.companyName} onChange={(e: any) => setConfig(prev => ({ ...prev, companyName: e.target.value }))} />
        </AdminField>
        <AdminField label="Slogan">
          <AdminInput value={config.tagline} onChange={(e: any) => setConfig(prev => ({ ...prev, tagline: e.target.value }))} />
        </AdminField>
      </AdminSection>

      <AdminSection title="Contato" icon={Mail} className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="Email">
            <AdminInput value={config.contactEmail} onChange={(e: any) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))} />
          </AdminField>
          <AdminField label="Telefone">
            <AdminInput value={config.contactPhone} onChange={(e: any) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="Seções do Site" icon={Eye} className="card p-5">
        {switchStyle("enableBlog", "Blog", "Exibe seção de artigos no site")}
        {switchStyle("enableTeam", "Equipe", "Exibe seção 'Quem somos' com a equipe")}
      </AdminSection>

      <div className="flex justify-end">
        <AdminButton onClick={() => toast({ title: "Configurações salvas", variant: "success" })} variant="primary">
          Salvar Configurações
        </AdminButton>
      </div>
    </div>
  );
}
