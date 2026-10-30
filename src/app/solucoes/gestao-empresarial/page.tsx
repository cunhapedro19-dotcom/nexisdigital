"use client";

import { useMemo, useState } from "react";
import { DemoShell } from "@/components/layout/DemoShell";
import { useLocalStorage } from "@/lib/use-local-storage";
import { currencyBRL, formatDate } from "@/lib/cn";
import { nextId } from "@/lib/id";
import { useModalA11y } from "@/lib/use-modal-a11y";

// ---------- Modelos ----------
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  supplier?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  document?: string; // CPF/CNPJ
  address?: string;
}

interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface Sale {
  id: string;
  date: string;
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  total: number;
  status: "completed" | "pending" | "cancelled";
  paymentMethod?: string;
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson?: string;
  categories: string[];
}

interface PurchaseOrder {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: Array<{ productId: string; name: string; qty: number; unitCost: number }>;
  total: number;
  status: "ordered" | "received" | "cancelled";
  expectedDate?: string;
}

interface AccountPayable {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  category: string;
}

interface AccountReceivable {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "received" | "overdue";
  saleId?: string;
}

// ---------- Dados iniciais ----------
const INITIAL_PRODUCTS: Product[] = [
  { id: "pr1", name: "Cadeira Escritório Ergo", sku: "CAD-001", price: 899, cost: 420, stock: 24, minStock: 5, category: "Mobiliário", supplier: "Móveis Brasil" },
  { id: "pr2", name: "Mesa 1,40m", sku: "MES-010", price: 1299, cost: 640, stock: 8, minStock: 3, category: "Mobiliário", supplier: "Móveis Brasil" },
  { id: "pr3", name: "Monitor 27\" IPS", sku: "MON-270", price: 1599, cost: 900, stock: 12, minStock: 4, category: "Eletrônicos", supplier: "TechDistribuidora" },
  { id: "pr4", name: "Teclado Mecânico", sku: "TEC-MEC", price: 499, cost: 220, stock: 3, minStock: 5, category: "Periféricos", supplier: "TechDistribuidora" },
  { id: "pr5", name: "Mouse Sem Fio", sku: "MOU-SF", price: 179, cost: 80, stock: 40, minStock: 10, category: "Periféricos", supplier: "TechDistribuidora" },
  { id: "pr6", name: "Webcam Full HD", sku: "WEB-FHD", price: 349, cost: 160, stock: 15, minStock: 5, category: "Periféricos", supplier: "Importados LTDA" },
  { id: "pr7", name: "Luminária LED", sku: "LUM-LED", price: 189, cost: 90, stock: 2, minStock: 5, category: "Acessórios", supplier: "Iluminações SA" },
  { id: "pr8", name: "Headset Gamer 7.1", sku: "HED-G71", price: 599, cost: 280, stock: 18, minStock: 5, category: "Periféricos", supplier: "TechDistribuidora" },
  { id: "pr9", name: "SSD NVMe 1TB", sku: "SSD-1TB", price: 489, cost: 260, stock: 25, minStock: 8, category: "Eletrônicos", supplier: "TechDistribuidora" },
  { id: "pr10", name: "Hub USB-C 7 em 1", sku: "HUB-7IN1", price: 249, cost: 110, stock: 30, minStock: 10, category: "Acessórios", supplier: "Importados LTDA" },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ana Martins", email: "ana@empresa.com", phone: "(11) 98765-4321", city: "São Paulo", document: "12.345.678/0001-90", address: "Av. Paulista, 1000" },
  { id: "c2", name: "Bruno Lima", email: "bruno@studio.com", phone: "(21) 99876-1234", city: "Rio de Janeiro", document: "98.765.432/0001-10", address: "Rua das Laranjeiras, 50" },
  { id: "c3", name: "Carla Duarte", email: "carla@agencia.com", phone: "(31) 97654-3210", city: "Belo Horizonte", document: "11.222.333/0001-44", address: "Av. Afonso Pena, 200" },
  { id: "c4", name: "Diego Ramos", email: "diego@loja.com", phone: "(41) 98123-4567", city: "Curitiba", document: "55.666.777/0001-88", address: "Rua XV de Novembro, 300" },
  { id: "c5", name: "Fernanda Oliveira", email: "fernanda@ecommerce.com", phone: "(51) 99123-4567", city: "Porto Alegre", document: "77.888.999/0001-00", address: "Av. Ipiranga, 400" },
];

const todayISO = () => new Date().toISOString();
const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
};
const daysFromNow = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

const INITIAL_SALES: Sale[] = [
  {
    id: "s1",
    date: daysAgo(1),
    customerId: "c1",
    customerName: "Ana Martins",
    items: [
      { productId: "pr1", name: "Cadeira Escritório Ergo", qty: 2, unitPrice: 899 },
      { productId: "pr5", name: "Mouse Sem Fio", qty: 2, unitPrice: 179 },
    ],
    total: 2 * 899 + 2 * 179,
    status: "completed",
    paymentMethod: "PIX",
    notes: "Entrega agendada para amanhã",
  },
  {
    id: "s2",
    date: daysAgo(3),
    customerId: "c2",
    customerName: "Bruno Lima",
    items: [{ productId: "pr3", name: "Monitor 27\" IPS", qty: 1, unitPrice: 1599 }],
    total: 1599,
    status: "completed",
    paymentMethod: "Cartão de crédito",
  },
  {
    id: "s3",
    date: daysAgo(7),
    customerId: "c3",
    customerName: "Carla Duarte",
    items: [
      { productId: "pr2", name: "Mesa 1,40m", qty: 1, unitPrice: 1299 },
      { productId: "pr6", name: "Webcam Full HD", qty: 1, unitPrice: 349 },
    ],
    total: 1299 + 349,
    status: "pending",
    paymentMethod: "Boleto",
    notes: "Aguardando confirmação",
  },
  {
    id: "s4",
    date: daysAgo(10),
    customerId: "c4",
    customerName: "Diego Ramos",
    items: [{ productId: "pr9", name: "SSD NVMe 1TB", qty: 5, unitPrice: 489 }],
    total: 5 * 489,
    status: "completed",
    paymentMethod: "PIX",
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: "sup1", name: "Móveis Brasil", email: "vendas@moveisbrasil.com", phone: "(11) 3333-4444", contactPerson: "Roberto Silva", categories: ["Mobiliário"] },
  { id: "sup2", name: "TechDistribuidora", email: "comercial@techdist.com", phone: "(11) 4444-5555", contactPerson: "Marina Costa", categories: ["Eletrônicos", "Periféricos"] },
  { id: "sup3", name: "Importados LTDA", email: "import@importadosltda.com", phone: "(11) 5555-6666", contactPerson: "Carlos Eduardo", categories: ["Periféricos", "Acessórios"] },
  { id: "sup4", name: "Iluminações SA", email: "vendas@iluminacoes.com", phone: "(11) 6666-7777", contactPerson: "Patricia Lima", categories: ["Acessórios"] },
];

const INITIAL_PURCHASES: PurchaseOrder[] = [
  {
    id: "po1",
    date: daysAgo(5),
    supplierId: "sup1",
    supplierName: "Móveis Brasil",
    items: [
      { productId: "pr1", name: "Cadeira Escritório Ergo", qty: 20, unitCost: 420 },
      { productId: "pr2", name: "Mesa 1,40m", qty: 10, unitCost: 640 },
    ],
    total: 20 * 420 + 10 * 640,
    status: "ordered",
    expectedDate: daysFromNow(10),
  },
  {
    id: "po2",
    date: daysAgo(15),
    supplierId: "sup2",
    supplierName: "TechDistribuidora",
    items: [
      { productId: "pr3", name: "Monitor 27\" IPS", qty: 15, unitCost: 900 },
      { productId: "pr9", name: "SSD NVMe 1TB", qty: 30, unitCost: 260 },
    ],
    total: 15 * 900 + 30 * 260,
    status: "received",
  },
];

const INITIAL_PAYABLES: AccountPayable[] = [
  { id: "ap1", date: daysAgo(10), supplierId: "sup1", supplierName: "Móveis Brasil", description: "NF 1234 - Móveis escritório", amount: 14800, dueDate: daysFromNow(20), status: "pending", category: "Fornecedores" },
  { id: "ap2", date: daysAgo(20), supplierId: "sup2", supplierName: "TechDistribuidora", description: "NF 5678 - Eletrônicos", amount: 22500, dueDate: daysAgo(5), status: "overdue", category: "Fornecedores" },
  { id: "ap3", date: daysAgo(2), supplierId: "sup3", supplierName: "Importados LTDA", description: "NF 9012 - Acessórios", amount: 8900, dueDate: daysFromNow(15), status: "pending", category: "Fornecedores" },
  { id: "ap4", date: daysAgo(30), supplierId: "sup4", supplierName: "Iluminações SA", description: "NF 3456 - Luminárias", amount: 3600, dueDate: daysAgo(10), status: "paid", category: "Fornecedores" },
];

const INITIAL_RECEIVABLES: AccountReceivable[] = [
  { id: "ar1", date: daysAgo(1), customerId: "c1", customerName: "Ana Martins", description: "Venda s1 - Equipamentos", amount: 2 * 899 + 2 * 179, dueDate: daysFromNow(10), status: "pending", saleId: "s1" },
  { id: "ar2", date: daysAgo(3), customerId: "c2", customerName: "Bruno Lima", description: "Venda s2 - Monitor", amount: 1599, dueDate: daysAgo(2), status: "overdue", saleId: "s2" },
  { id: "ar3", date: daysAgo(7), customerId: "c3", customerName: "Carla Duarte", description: "Venda s3 - Mesa + Webcam", amount: 1299 + 349, dueDate: daysFromNow(5), status: "pending", saleId: "s3" },
  { id: "ar4", date: daysAgo(10), customerId: "c4", customerName: "Diego Ramos", description: "Venda s4 - SSDs", amount: 5 * 489, dueDate: daysAgo(5), status: "received", saleId: "s4" },
];

// ---------- Componente principal ----------
export default function GestaoEmpresarialPage() {
  const { value: products, setValue: setProducts, reset: resetProducts } = useLocalStorage<Product[]>(
    "nexis:erp:products",
    INITIAL_PRODUCTS,
  );
  const { value: customers, setValue: setCustomers, reset: resetCustomers } = useLocalStorage<Customer[]>(
    "nexis:erp:customers",
    INITIAL_CUSTOMERS,
  );
  const { value: sales, setValue: setSales, reset: resetSales } = useLocalStorage<Sale[]>(
    "nexis:erp:sales",
    INITIAL_SALES,
  );
  const { value: suppliers, setValue: setSuppliers, reset: resetSuppliers } = useLocalStorage<Supplier[]>(
    "nexis:erp:suppliers",
    INITIAL_SUPPLIERS,
  );
  const { value: purchases, setValue: setPurchases, reset: resetPurchases } = useLocalStorage<PurchaseOrder[]>(
    "nexis:erp:purchases",
    INITIAL_PURCHASES,
  );
  const { value: payables, setValue: setPayables, reset: resetPayables } = useLocalStorage<AccountPayable[]>(
    "nexis:erp:payables",
    INITIAL_PAYABLES,
  );
  const { value: receivables, setValue: setReceivables, reset: resetReceivables } = useLocalStorage<AccountReceivable[]>(
    "nexis:erp:receivables",
    INITIAL_RECEIVABLES,
  );

  const [tab, setTab] = useState<
    "dashboard" | "sales" | "products" | "stock" | "customers" | "suppliers" | "purchases" | "financial" | "reports"
  >("dashboard");

  function resetAll() {
    if (confirm("Restaurar dados de demonstração? Suas alterações locais serão perdidas.")) {
      resetProducts();
      resetCustomers();
      resetSales();
      resetSuppliers();
      resetPurchases();
      resetPayables();
      resetReceivables();
    }
  }

  return (
    <DemoShell
      title="Gestão empresarial"
      subtitle="Sistema completo: vendas, estoque, clientes, fornecedores, financeiro"
      kind="Demonstração funcional"
      solutionSlug="gestao-empresarial"
      accent="sky"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
              Demo · Ambiente administrativo fictício
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">Painel Operações</h1>
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
              ["sales", "Vendas"],
              ["products", "Produtos"],
              ["stock", "Estoque"],
              ["customers", "Clientes"],
              ["suppliers", "Fornecedores"],
              ["purchases", "Compras"],
              ["financial", "Financeiro"],
              ["reports", "Relatórios"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`border-b-2 px-3 py-2 text-sm transition ${
                tab === k
                  ? "border-sky-400 text-white"
                  : "border-transparent text-nx-muted hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && <Dashboard products={products} sales={sales} customers={customers} payables={payables} receivables={receivables} />}
        {tab === "sales" && (
          <SalesTab
            sales={sales}
            setSales={setSales}
            products={products}
            setProducts={setProducts}
            customers={customers}
            receivables={receivables}
            setReceivables={setReceivables}
          />
        )}
        {tab === "products" && <ProductsTab products={products} setProducts={setProducts} />}
        {tab === "stock" && <StockTab products={products} setProducts={setProducts} />}
        {tab === "customers" && <CustomersTab customers={customers} setCustomers={setCustomers} />}
        {tab === "suppliers" && <SuppliersTab suppliers={suppliers} setSuppliers={setSuppliers} />}
        {tab === "purchases" && (
          <PurchasesTab
            purchases={purchases}
            setPurchases={setPurchases}
            suppliers={suppliers}
            products={products}
            setProducts={setProducts}
            payables={payables}
            setPayables={setPayables}
          />
        )}
        {tab === "financial" && <FinancialTab payables={payables} setPayables={setPayables} receivables={receivables} setReceivables={setReceivables} />}
        {tab === "reports" && <Reports products={products} sales={sales} customers={customers} />}
      </div>
    </DemoShell>
  );
}

// ---------- Dashboard ----------
function Dashboard({
  products,
  sales,
  customers,
  payables,
  receivables,
}: {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  payables: AccountPayable[];
  receivables: AccountReceivable[];
}) {
  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }, []);
  const salesMonth = sales.filter((s) => new Date(s.date).getTime() >= monthStart);
  const revenue = salesMonth.reduce((s, x) => s + x.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const itemsSold = salesMonth.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);
  const pendingReceivables = receivables.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const overdueReceivables = receivables.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0);
  const pendingPayables = payables.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const overduePayables = payables.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);

  const kpis = [
    { label: "Receita no mês", value: currencyBRL(revenue), hint: `${salesMonth.length} vendas` },
    { label: "Itens vendidos", value: String(itemsSold), hint: "no mês" },
    { label: "Produtos ativos", value: String(products.length), hint: "cadastrados" },
    { label: "Estoque baixo", value: String(lowStock), hint: "abaixo do mínimo", alert: lowStock > 0 },
    { label: "A receber (pendente)", value: currencyBRL(pendingReceivables), hint: "clientes" },
    { label: "A pagar (pendente)", value: currencyBRL(pendingPayables), hint: "fornecedores" },
    { label: "Atrasados (receber)", value: currencyBRL(overdueReceivables), hint: "vencidos", alert: overdueReceivables > 0 },
    { label: "Atrasados (pagar)", value: currencyBRL(overduePayables), hint: "vencidos", alert: overduePayables > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl border border-nx-border bg-nx-surface p-4 ${k.alert ? "border-amber-500/30" : ""}`}>
            <p className="text-xs text-nx-muted">{k.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${k.alert ? "text-amber-300" : ""}`}>{k.value}</p>
            <p className="text-xs text-nx-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-2">
          <p className="text-sm font-semibold">Últimas vendas</p>
          {sales.length === 0 ? (
            <p className="mt-3 text-sm text-nx-muted">Sem vendas registradas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-nx-border">
              {sales
                .slice()
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .slice(0, 5)
                .map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium">{s.customerName || "Cliente avulso"}</p>
                      <p className="text-xs text-nx-muted">
                        {formatDate(s.date)} · {s.items.length} {s.items.length === 1 ? "item" : "itens"}
                        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                          s.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                          s.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                          "bg-rose-500/20 text-rose-300"
                        }`}>
                          {s.status === "completed" ? "Concluída" : s.status === "pending" ? "Pendente" : "Cancelada"}
                        </span>
                      </p>
                    </div>
                    <p className="font-semibold">{currencyBRL(s.total)}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Alertas de estoque</p>
          {lowStock === 0 ? (
            <p className="mt-3 text-sm text-nx-muted">Todos os produtos acima do mínimo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-nx-border">
              {products
                .filter((p) => p.stock <= p.minStock)
                .map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-nx-muted">SKU {p.sku}</p>
                    </div>
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300">
                      {p.stock} un. · mín. {p.minStock}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-2">
          <p className="text-sm font-semibold">Financeiro - Próximos vencimentos</p>
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-amber-300">Contas a receber (vencendo)</div>
            {receivables
              .filter((r) => r.status === "pending" || r.status === "overdue")
              .slice()
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm py-1 border-b border-nx-border/50">
                  <span>{r.customerName}</span>
                  <span className={`${r.status === "overdue" ? "text-rose-300" : "text-white"}`}>
                    {currencyBRL(r.amount)} · {formatDate(r.dueDate)}
                  </span>
                </div>
              ))}
            <div className="mt-2 text-xs font-medium text-sky-300">Contas a pagar (vencendo)</div>
            {payables
              .filter((p) => p.status === "pending" || p.status === "overdue")
              .slice()
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 3)
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-nx-border/50">
                  <span>{p.supplierName}</span>
                  <span className={`${p.status === "overdue" ? "text-rose-300" : "text-white"}`}>
                    {currencyBRL(p.amount)} · {formatDate(p.dueDate)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-1">
          <p className="text-sm font-semibold">Top 5 produtos (mês)</p>
          <div className="mt-3 space-y-2">
            {(() => {
              const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
              salesMonth.forEach((s) =>
                s.items.forEach((i) => {
                  const cur = byProduct.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
                  cur.qty += i.qty;
                  cur.revenue += i.qty * i.unitPrice;
                  byProduct.set(i.productId, cur);
                })
              );
              return Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
            })().map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-nx-muted">{p.qty} un. vendidas</p>
                </div>
                <span className="font-semibold text-sky-300">{currencyBRL(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Vendas ----------
function SalesTab({
  sales,
  setSales,
  products,
  setProducts,
  customers,
  receivables,
  setReceivables,
}: {
  sales: Sale[];
  setSales: (fn: (p: Sale[]) => Sale[]) => void;
  products: Product[];
  setProducts: (fn: (p: Product[]) => Product[]) => void;
  customers: Customer[];
  receivables: AccountReceivable[];
  setReceivables: (fn: (p: AccountReceivable[]) => AccountReceivable[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = sales.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      s.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  function register(sale: Sale) {
    setSales((p) => [sale, ...p]);
    setProducts((list) =>
      list.map((prod) => {
        const it = sale.items.find((i) => i.productId === prod.id);
        if (!it) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - it.qty) };
      }),
    );
    // criar conta a receber
    if (sale.status !== "cancelled") {
      setReceivables((list) => [
        ...list,
        {
          id: nextId("ar"),
          date: sale.date,
          customerId: sale.customerId ?? "",
          customerName: sale.customerName,
          description: `Venda ${sale.id} - ${sale.items.map(i => i.name).join(", ")}`,
          amount: sale.total,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: "pending",
          saleId: sale.id,
        },
      ]);
    }
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar venda por cliente ou produto..."
          className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400"
        >
          + Registrar venda
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhuma venda encontrada." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-nx-surface-alt">
                      <td className="px-4 py-3">{formatDate(s.date)}</td>
                      <td className="px-4 py-3">{s.customerName || "Avulso"}</td>
                      <td className="px-4 py-3 text-nx-muted">
                        {s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          s.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                          s.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                          "bg-rose-500/20 text-rose-300"
                        }`}>
                          {s.status === "completed" ? "Concluída" : s.status === "pending" ? "Pendente" : "Cancelada"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-nx-muted">{s.paymentMethod || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{currencyBRL(s.total)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <SaleModal
          products={products}
          customers={customers}
          onClose={() => setOpen(false)}
          onSave={register}
        />
      )}
    </div>
  );
}

function SaleModal({
  products,
  customers,
  onClose,
  onSave,
}: {
  products: Product[];
  customers: Customer[];
  onClose: () => void;
  onSave: (s: Sale) => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Sale["status"]>("completed");
  const [errors, setErrors] = useState<string | null>(null);

  function addProduct(pid: string) {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === pid);
      if (existing) return prev.map((i) => (i.productId === pid ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId: p.id, name: p.name, qty: 1, unitPrice: p.price }];
    });
  }

  function updateQty(pid: string, qty: number) {
    if (qty <= 0) {
      setItems((p) => p.filter((i) => i.productId !== pid));
      return;
    }
    setItems((p) => p.map((i) => (i.productId === pid ? { ...i, qty } : i)));
  }

  const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  function submit() {
    if (items.length === 0) {
      setErrors("Adicione ao menos um produto.");
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    const sale: Sale = {
      id: nextId("s"),
      date: todayISO(),
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? "Cliente avulso",
      items,
      total,
      status,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
    };
    onSave(sale);
  }

  return (
    <Modal onClose={onClose} title="Registrar venda">
      <label className="block text-sm font-semibold">Cliente</label>
      <select
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm"
      >
        <option value="">Cliente avulso</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-sm font-semibold">Adicionar produto</label>
      <select
        onChange={(e) => {
          if (e.target.value) addProduct(e.target.value);
          e.target.value = "";
        }}
        defaultValue=""
        className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm"
      >
        <option value="">Selecione um produto...</option>
        {products.map((p) => (
          <option key={p.id} value={p.id} disabled={p.stock <= 0}>
            {p.name} — {currencyBRL(p.price)} · {p.stock} em estoque
          </option>
        ))}
      </select>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-nx-muted">Nenhum item adicionado.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li
              key={i.productId}
              className="flex items-center justify-between gap-3 rounded-lg border border-nx-border bg-nx-surface-alt p-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.name}</p>
                <p className="text-xs text-nx-muted">{currencyBRL(i.unitPrice)} · un.</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-md border border-nx-border">
                <button
                  type="button"
                  onClick={() => updateQty(i.productId, i.qty - 1)}
                  className="h-8 w-8 text-sm hover:bg-nx-surface"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{i.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(i.productId, i.qty + 1)}
                  className="h-8 w-8 text-sm hover:bg-nx-surface"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-semibold">
                {currencyBRL(i.unitPrice * i.qty)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Labeled label="Método de pagamento">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="Cartão de crédito">Cartão de crédito</option>
            <option value="Boleto">Boleto</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
          </select>
        </Labeled>
        <Labeled label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as Sale["status"])} className={inputCls}>
            <option value="completed">Concluída</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </Labeled>
      </div>

      <div className="sm:col-span-2">
        <Labeled label="Observações">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Observações internas..." />
        </Labeled>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-nx-border bg-nx-surface p-3">
        <span className="text-sm text-nx-muted">Total</span>
        <span className="text-lg font-semibold">{currencyBRL(total)}</span>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-sky">Confirmar venda</button>
      </div>
    </Modal>
  );
}

// ---------- Produtos ----------
function ProductsTab({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: (fn: (p: Product[]) => Product[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = products.filter((p) =>
    (p.name + " " + p.sku + " " + p.category + " " + (p.supplier || "")).toLowerCase().includes(query.toLowerCase()),
  );

  function save(p: Product) {
    setProducts((list) => {
      const exists = list.some((x) => x.id === p.id);
      if (exists) return list.map((x) => (x.id === p.id ? p : x));
      return [...list, p];
    });
    setEditing(null);
    setCreating(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este produto?")) return;
    setProducts((list) => list.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome, SKU, categoria ou fornecedor..."
          className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400"
        >
          + Novo produto
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum produto encontrado." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3 text-right">Preço</th>
                  <th className="px-4 py-3 text-right">Custo</th>
                  <th className="px-4 py-3 text-right">Estoque</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-nx-surface-alt">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-nx-muted">{p.sku}</td>
                    <td className="px-4 py-3 text-nx-muted">{p.category}</td>
                    <td className="px-4 py-3 text-nx-muted">{p.supplier || "—"}</td>
                    <td className="px-4 py-3 text-right">{currencyBRL(p.price)}</td>
                    <td className="px-4 py-3 text-right text-nx-muted">{currencyBRL(p.cost)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock <= p.minStock ? "text-rose-300" : p.stock <= p.minStock * 2 ? "text-amber-300" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditing(p)} className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt">Editar</button>
                        <button type="button" onClick={() => remove(p.id)} className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(editing || creating) && (
        <ProductForm initial={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={save} />
      )}
    </div>
  );
}

function ProductForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [supplier, setSupplier] = useState(initial?.supplier ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [cost, setCost] = useState(String(initial?.cost ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? ""));
  const [minStock, setMinStock] = useState(String(initial?.minStock ?? 5));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome.";
    if (!sku.trim()) e.sku = "Informe o SKU.";
    if (Number.isNaN(Number(price)) || Number(price) < 0) e.price = "Preço inválido.";
    if (Number.isNaN(Number(cost)) || Number(cost) < 0) e.cost = "Custo inválido.";
    if (Number.isNaN(Number(stock)) || Number(stock) < 0) e.stock = "Estoque inválido.";
    if (Number.isNaN(Number(minStock)) || Number(minStock) < 0) e.minStock = "Mínimo inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;

    onSave({
      id: initial?.id ?? nextId("pr"),
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim() || "Sem categoria",
      supplier: supplier.trim() || undefined,
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      minStock: Number(minStock),
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar produto" : "Novo produto"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="SKU" error={errors.sku}><input value={sku} onChange={(e) => setSku(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Categoria"><input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Fornecedor"><input value={supplier} onChange={(e) => setSupplier(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Preço de venda" error={errors.price}><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Custo" error={errors.cost}><input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Estoque atual" error={errors.stock}><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Estoque mínimo" error={errors.minStock}><input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className={inputCls} /></Labeled>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-sky">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Estoque ----------
function StockTab({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: (fn: (p: Product[]) => Product[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | "low" | "ok">("all");

  const filtered = products.filter((p) => {
    if (filter === "low") return p.stock <= p.minStock;
    if (filter === "ok") return p.stock > p.minStock;
    return true;
  });

  function adjust(id: string, delta: number) {
    setProducts((list) =>
      list.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "low", "ok"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              filter === f ? "border-sky-500/50 bg-sky-500/10 text-white" : "border-nx-border bg-nx-surface text-nx-muted hover:text-white"
            }`}
          >
            {f === "all" ? "Todos" : f === "low" ? "Estoque baixo" : "Estoque ok"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum produto neste filtro." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-right">Atual</th>
                  <th className="px-4 py-3 text-right">Mínimo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((p) => {
                  const low = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-nx-surface-alt">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-right font-semibold">{p.stock}</td>
                      <td className="px-4 py-3 text-right text-nx-muted">{p.minStock}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${low ? "bg-rose-500/10 text-rose-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                          {low ? "Baixo" : "Ok"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 rounded-md border border-nx-border">
                          <button type="button" onClick={() => adjust(p.id, -1)} className="h-8 w-8 text-sm hover:bg-nx-surface">−</button>
                          <button type="button" onClick={() => adjust(p.id, 1)} className="h-8 w-8 text-sm hover:bg-nx-surface">+</button>
                          <button type="button" onClick={() => adjust(p.id, 10)} className="h-8 px-2 text-xs hover:bg-nx-surface">+10</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Clientes ----------
function CustomersTab({
  customers,
  setCustomers,
}: {
  customers: Customer[];
  setCustomers: (fn: (p: Customer[]) => Customer[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = customers.filter((c) =>
    (c.name + " " + c.email + " " + c.city + " " + (c.document || "")).toLowerCase().includes(query.toLowerCase()),
  );

  function save(c: Customer) {
    setCustomers((list) => {
      const exists = list.some((x) => x.id === c.id);
      if (exists) return list.map((x) => (x.id === c.id ? c : x));
      return [...list, c];
    });
    setEditing(null);
    setCreating(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este cliente?")) return;
    setCustomers((list) => list.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar cliente..."
          className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none"
        />
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400">+ Novo cliente</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum cliente encontrado." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-nx-border bg-nx-surface p-4">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-nx-muted">{c.email}</p>
              <p className="text-xs text-nx-muted">{c.phone}</p>
              <p className="text-xs text-nx-muted">{c.city}</p>
              {c.document && <p className="text-xs text-nx-muted">CNPJ/CPF: {c.document}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing(c)} className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt">Editar</button>
                <button type="button" onClick={() => remove(c.id)} className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && <CustomerForm initial={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={save} />}
    </div>
  );
}

function CustomerForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Customer | null;
  onClose: () => void;
  onSave: (c: Customer) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [document, setDocument] = useState(initial?.document ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: initial?.id ?? nextId("c"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      document: document.trim() || undefined,
      address: address.trim() || undefined,
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar cliente" : "Novo cliente"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="E-mail" error={errors.email}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Telefone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Cidade"><input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="CNPJ/CPF"><input value={document} onChange={(e) => setDocument(e.target.value)} className={inputCls} /></Labeled>
        <div className="sm:col-span-2"><Labeled label="Endereço"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} /></Labeled></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-sky">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Fornecedores ----------
function SuppliersTab({
  suppliers,
  setSuppliers,
}: {
  suppliers: Supplier[];
  setSuppliers: (fn: (p: Supplier[]) => Supplier[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = suppliers.filter((s) =>
    (s.name + " " + s.email + " " + s.contactPerson + " " + s.categories.join(" ")).toLowerCase().includes(query.toLowerCase()),
  );

  function save(s: Supplier) {
    setSuppliers((list) => {
      const exists = list.some((x) => x.id === s.id);
      if (exists) return list.map((x) => (x.id === s.id ? s : x));
      return [...list, s];
    });
    setEditing(null);
    setCreating(false);
  }

  function remove(id: string) {
    if (!confirm("Remover este fornecedor?")) return;
    setSuppliers((list) => list.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar fornecedor..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none" />
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400">+ Novo fornecedor</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhum fornecedor encontrado." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border border-nx-border bg-nx-surface p-4">
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-nx-muted">{s.email}</p>
              <p className="text-xs text-nx-muted">{s.phone}</p>
              {s.contactPerson && <p className="text-xs text-nx-muted">Contato: {s.contactPerson}</p>}
              <p className="text-xs text-nx-muted">Categorias: {s.categories.join(", ")}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setEditing(s)} className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt">Editar</button>
                <button type="button" onClick={() => remove(s.id)} className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && <SupplierForm initial={editing} onClose={() => { setEditing(null); setCreating(false); }} onSave={save} />}
    </div>
  );
}

function SupplierForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Supplier | null;
  onClose: () => void;
  onSave: (s: Supplier) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [contactPerson, setContactPerson] = useState(initial?.contactPerson ?? "");
  const [categories, setCategories] = useState(initial?.categories.join(", ") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: initial?.id ?? nextId("sup"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      contactPerson: contactPerson.trim() || undefined,
      categories: categories.split(",").map(c => c.trim()).filter(Boolean),
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar fornecedor" : "Novo fornecedor"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="E-mail" error={errors.email}><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Telefone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Labeled>
        <Labeled label="Pessoa de contato"><input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputCls} /></Labeled>
        <div className="sm:col-span-2"><Labeled label="Categorias (separadas por vírgula)"><input value={categories} onChange={(e) => setCategories(e.target.value)} className={inputCls} placeholder="Ex: Eletrônicos, Periféricos" /></Labeled></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-sky">Salvar</button>
      </div>
    </Modal>
  );
}

// ---------- Compras ----------
function PurchasesTab({
  purchases,
  setPurchases,
  suppliers,
  products,
  setProducts,
  payables,
  setPayables,
}: {
  purchases: PurchaseOrder[];
  setPurchases: (fn: (p: PurchaseOrder[]) => PurchaseOrder[]) => void;
  suppliers: Supplier[];
  products: Product[];
  setProducts: (fn: (p: Product[]) => Product[]) => void;
  payables: AccountPayable[];
  setPayables: (fn: (p: AccountPayable[]) => AccountPayable[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = purchases.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return p.supplierName.toLowerCase().includes(q);
  });

  function register(purchase: PurchaseOrder) {
    setPurchases((p) => [purchase, ...p]);
    // criar conta a pagar
    setPayables((list) => [
      ...list,
      {
        id: nextId("ap"),
        date: purchase.date,
        supplierId: purchase.supplierId,
        supplierName: purchase.supplierName,
        description: `OC ${purchase.id} - ${purchase.items.map(i => i.name).join(", ")}`,
        amount: purchase.total,
        dueDate: purchase.expectedDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "pending",
        category: "Fornecedores",
      },
    ]);
    setOpen(false);
  }

  function receive(id: string) {
    const purchase = purchases.find((p) => p.id === id);
    if (!purchase || purchase.status === "received") return;
    setPurchases((list) => list.map((p) => (p.id === id ? { ...p, status: "received" as const } : p)));
    // atualizar estoque
    setProducts((list) =>
      list.map((prod) => {
        const item = purchase.items.find((i) => i.productId === prod.id);
        if (!item) return prod;
        return { ...prod, stock: prod.stock + item.qty };
      })
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar ordem de compra..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none" />
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400">+ Nova ordem de compra</button>
      </div>

      {filtered.length === 0 ? (
        <Empty label="Nenhuma ordem de compra encontrada." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
          <div className="overflow-x-auto nx-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Previsão</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-nx-surface-alt">
                    <td className="px-4 py-3">{formatDate(p.date)}</td>
                    <td className="px-4 py-3">{p.supplierName}</td>
                    <td className="px-4 py-3 text-nx-muted">{p.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                    <td className="px-4 py-3 text-nx-muted">{p.expectedDate ? formatDate(p.expectedDate) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "received" ? "bg-emerald-500/20 text-emerald-300" : p.status === "ordered" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {p.status === "received" ? "Recebido" : p.status === "ordered" ? "Aguardando" : "Cancelada"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{currencyBRL(p.total)}</td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "ordered" && (
                        <button type="button" onClick={() => receive(p.id)} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">Marcar recebido</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && <PurchaseModal suppliers={suppliers} products={products} onClose={() => setOpen(false)} onSave={register} />}
    </div>
  );
}

function PurchaseModal({
  suppliers,
  products,
  onClose,
  onSave,
}: {
  suppliers: Supplier[];
  products: Product[];
  onClose: () => void;
  onSave: (p: PurchaseOrder) => void;
}) {
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; name: string; qty: number; unitCost: number }>>([]);
  const [expectedDate, setExpectedDate] = useState("");
  const [errors, setErrors] = useState<string | null>(null);

  function addProduct(pid: string) {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === pid);
      if (existing) return prev.map((i) => (i.productId === pid ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId: p.id, name: p.name, qty: 1, unitCost: p.cost }];
    });
  }

  function updateQty(pid: string, qty: number) {
    if (qty <= 0) { setItems((p) => p.filter((i) => i.productId !== pid)); return; }
    setItems((p) => p.map((i) => (i.productId === pid ? { ...i, qty } : i)));
  }

  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0);

  function submit() {
    if (!supplierId) { setErrors("Selecione um fornecedor."); return; }
    if (items.length === 0) { setErrors("Adicione ao menos um produto."); return; }
    const supplier = suppliers.find((s) => s.id === supplierId);
    const purchase: PurchaseOrder = {
      id: nextId("po"),
      date: todayISO(),
      supplierId,
      supplierName: supplier?.name ?? "",
      items,
      total,
      status: "ordered",
      expectedDate: expectedDate || undefined,
    };
    onSave(purchase);
  }

  return (
    <Modal onClose={onClose} title="Nova ordem de compra">
      <label className="block text-sm font-semibold">Fornecedor</label>
      <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
        <option value="">Selecione...</option>
        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <label className="mt-4 block text-sm font-semibold">Adicionar produto</label>
      <select onChange={(e) => { if (e.target.value) addProduct(e.target.value); e.target.value = ""; }} defaultValue="" className="mt-1 h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm">
        <option value="">Selecione um produto...</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name} — Custo: {currencyBRL(p.cost)} · Estoque: {p.stock}</option>)}
      </select>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-nx-muted">Nenhum item adicionado.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center justify-between gap-3 rounded-lg border border-nx-border bg-nx-surface-alt p-2 text-sm">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{i.name}</p><p className="text-xs text-nx-muted">Custo: {currencyBRL(i.unitCost)} · un.</p></div>
              <div className="inline-flex items-center gap-1 rounded-md border border-nx-border">
                <button type="button" onClick={() => updateQty(i.productId, i.qty - 1)} className="h-8 w-8 text-sm hover:bg-nx-surface">−</button>
                <span className="w-6 text-center text-sm">{i.qty}</span>
                <button type="button" onClick={() => updateQty(i.productId, i.qty + 1)} className="h-8 w-8 text-sm hover:bg-nx-surface">+</button>
              </div>
              <p className="w-24 text-right font-semibold">{currencyBRL(i.unitCost * i.qty)}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Labeled label="Previsão de entrega"><input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className={inputCls} /></Labeled>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-nx-border bg-nx-surface p-3">
        <span className="text-sm text-nx-muted">Total</span>
        <span className="text-lg font-semibold">{currencyBRL(total)}</span>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
        <button type="button" onClick={submit} className="btn-primary-sky">Criar ordem</button>
      </div>
    </Modal>
  );
}

// ---------- Financeiro ----------
function FinancialTab({
  payables,
  setPayables,
  receivables,
  setReceivables,
}: {
  payables: AccountPayable[];
  setPayables: (fn: (p: AccountPayable[]) => AccountPayable[]) => void;
  receivables: AccountReceivable[];
  setReceivables: (fn: (p: AccountReceivable[]) => AccountReceivable[]) => void;
}) {
  const [payableTab, setPayableTab] = useState<"payables" | "receivables">("payables");
  const [payableQuery, setPayableQuery] = useState("");
  const [receivableQuery, setReceivableQuery] = useState("");

  const filteredPayables = payables.filter((p) => {
    if (!payableQuery.trim()) return true;
    const q = payableQuery.toLowerCase();
    return p.supplierName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });
  const filteredReceivables = receivables.filter((r) => {
    if (!receivableQuery.trim()) return true;
    const q = receivableQuery.toLowerCase();
    return r.customerName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  function markPaid(id: string) {
    setPayables((list) => list.map((p) => (p.id === id ? { ...p, status: "paid" as const } : p)));
  }
  function markReceived(id: string) {
    setReceivables((list) => list.map((r) => (r.id === id ? { ...r, status: "received" as const } : r)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-nx-border pb-2">
        {(["payables", "receivables"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setPayableTab(t)} className={`border-b-2 px-3 py-2 text-sm transition ${payableTab === t ? "border-sky-400 text-white" : "border-transparent text-nx-muted hover:text-white"}`}>
            {t === "payables" ? "Contas a pagar" : "Contas a receber"}
          </button>
        ))}
      </div>

      {payableTab === "payables" && (
        <div className="space-y-3">
          <input value={payableQuery} onChange={(e) => setPayableQuery(e.target.value)} placeholder="Pesquisar conta a pagar..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none" />
          {filteredPayables.length === 0 ? (
            <Empty label="Nenhuma conta a pagar encontrada." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
              <div className="overflow-x-auto nx-scroll">
                <table className="min-w-full text-sm">
                  <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                    <tr>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Fornecedor</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nx-border">
                    {filteredPayables.map((p) => (
                      <tr key={p.id} className={`hover:bg-nx-surface-alt ${p.status === "overdue" ? "bg-rose-500/5" : ""}`}>
                        <td className="px-4 py-3">{formatDate(p.dueDate)}</td>
                        <td className="px-4 py-3">{p.supplierName}</td>
                        <td className="px-4 py-3 text-nx-muted">{p.description}</td>
                        <td className="px-4 py-3 text-nx-muted">{p.category}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "paid" ? "bg-emerald-500/20 text-emerald-300" : p.status === "overdue" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}>
                            {p.status === "paid" ? "Pago" : p.status === "overdue" ? "Vencido" : "Pendente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{currencyBRL(p.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          {p.status === "pending" && <button type="button" onClick={() => markPaid(p.id)} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">Marcar pago</button>}
                          {p.status === "overdue" && <button type="button" onClick={() => markPaid(p.id)} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/20">Marcar pago</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {payableTab === "receivables" && (
        <div className="space-y-3">
          <input value={receivableQuery} onChange={(e) => setReceivableQuery(e.target.value)} placeholder="Pesquisar conta a receber..." className="h-10 w-full max-w-xs rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none" />
          {filteredReceivables.length === 0 ? (
            <Empty label="Nenhuma conta a receber encontrada." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface">
              <div className="overflow-x-auto nx-scroll">
                <table className="min-w-full text-sm">
                  <thead className="bg-nx-surface-alt text-left text-xs uppercase tracking-wider text-nx-muted">
                    <tr>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nx-border">
                    {filteredReceivables.map((r) => (
                      <tr key={r.id} className={`hover:bg-nx-surface-alt ${r.status === "overdue" ? "bg-rose-500/5" : ""}`}>
                        <td className="px-4 py-3">{formatDate(r.dueDate)}</td>
                        <td className="px-4 py-3">{r.customerName}</td>
                        <td className="px-4 py-3 text-nx-muted">{r.description}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "received" ? "bg-emerald-500/20 text-emerald-300" : r.status === "overdue" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}>
                            {r.status === "received" ? "Recebido" : r.status === "overdue" ? "Vencido" : "Pendente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{currencyBRL(r.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          {r.status === "pending" && <button type="button" onClick={() => markReceived(r.id)} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20">Marcar recebido</button>}
                          {r.status === "overdue" && <button type="button" onClick={() => markReceived(r.id)} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/20">Marcar recebido</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Relatórios ----------
function Reports({
  products,
  sales,
  customers,
}: {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
}) {
  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number; margin: number }>();
    sales.forEach((s) =>
      s.items.forEach((i) => {
        const prod = products.find((p) => p.id === i.productId);
        const cost = prod?.cost ?? 0;
        const cur = map.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0, margin: 0 };
        cur.qty += i.qty;
        cur.revenue += i.qty * i.unitPrice;
        cur.margin += i.qty * (i.unitPrice - cost);
        map.set(i.productId, cur);
      }),
    );
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales, products]);

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalCost = sales.reduce((s, x) => s + x.items.reduce((a, b) => {
    const prod = products.find((p) => p.id === b.productId);
    return a + b.qty * (prod?.cost ?? 0);
  }, 0), 0);
  const avgTicket = sales.length ? totalRevenue / sales.length : 0;
  const totalItems = sales.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Receita total" value={currencyBRL(totalRevenue)} hint={`${sales.length} vendas`} />
        <KpiCard label="Custo total" value={currencyBRL(totalCost)} hint="dos itens vendidos" />
        <KpiCard label="Margem bruta" value={`${grossMargin.toFixed(1)}%`} hint="rentabilidade" />
        <KpiCard label="Ticket médio" value={currencyBRL(avgTicket)} hint="por venda" />
        <KpiCard label="Itens vendidos" value={String(totalItems)} hint="em todos os períodos" />
        <KpiCard label="Clientes ativos" value={String(new Set(sales.map(s => s.customerId).filter(Boolean)).size)} hint="compraram" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 xl:col-span-2">
          <p className="text-sm font-semibold">Produtos mais vendidos (receita)</p>
          {byProduct.length === 0 ? (
            <p className="mt-3 text-sm text-nx-muted">Sem dados ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-nx-border">
              {byProduct.slice(0, 10).map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-nx-muted">{p.qty} unidades · margem: {currencyBRL(p.margin)}</p>
                  </div>
                  <p className="font-semibold">{currencyBRL(p.revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Vendas por status</p>
          <dl className="mt-3 space-y-2 text-sm">
            {["completed", "pending", "cancelled"].map((st) => {
              const count = sales.filter(s => s.status === st).length;
              const total = sales.filter(s => s.status === st).reduce((s, x) => s + x.total, 0);
              const label = st === "completed" ? "Concluídas" : st === "pending" ? "Pendentes" : "Canceladas";
              const color = st === "completed" ? "text-emerald-300" : st === "pending" ? "text-amber-300" : "text-rose-300";
              return <Row key={st} k={label} v={`${count} vendas (${currencyBRL(total)})`} color={color} />;
            })}
          </dl>
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Resumo geral</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Produtos cadastrados" v={String(products.length)} />
            <Row k="Produtos com estoque baixo" v={String(products.filter((p) => p.stock <= p.minStock).length)} />
            <Row k="Clientes cadastrados" v={String(customers.length)} />
            <Row k="Vendas registradas" v={String(sales.length)} />
            <Row k="Fornecedores" v={String(0)} /> {/* será preenchido via contexto se necessário */}
          </dl>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-nx-border bg-nx-surface p-4">
      <p className="text-xs text-nx-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-nx-muted">{hint}</p>
    </div>
  );
}

function Row({ k, v, color = "text-white" }: { k: string; v: string; color?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-nx-border/70 pb-2 last:border-0">
      <dt className="text-nx-muted">{k}</dt>
      <dd className={`font-semibold ${color}`}>{v}</dd>
    </div>
  );
}

// ---------- UI helpers ----------
const inputCls =
  "h-10 w-full rounded-lg border border-nx-border bg-nx-surface-alt px-3 text-sm focus:border-sky-500/60 focus:outline-none";

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