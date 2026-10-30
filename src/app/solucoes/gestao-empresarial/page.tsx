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
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
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
}

// ---------- Dados iniciais ----------
const INITIAL_PRODUCTS: Product[] = [
  { id: "pr1", name: "Cadeira Escritório Ergo", sku: "CAD-001", price: 899, cost: 420, stock: 24, minStock: 5, category: "Mobiliário" },
  { id: "pr2", name: "Mesa 1,40m", sku: "MES-010", price: 1299, cost: 640, stock: 8, minStock: 3, category: "Mobiliário" },
  { id: "pr3", name: "Monitor 27\" IPS", sku: "MON-270", price: 1599, cost: 900, stock: 12, minStock: 4, category: "Eletrônicos" },
  { id: "pr4", name: "Teclado Mecânico", sku: "TEC-MEC", price: 499, cost: 220, stock: 3, minStock: 5, category: "Periféricos" },
  { id: "pr5", name: "Mouse Sem Fio", sku: "MOU-SF", price: 179, cost: 80, stock: 40, minStock: 10, category: "Periféricos" },
  { id: "pr6", name: "Webcam Full HD", sku: "WEB-FHD", price: 349, cost: 160, stock: 15, minStock: 5, category: "Periféricos" },
  { id: "pr7", name: "Luminária LED", sku: "LUM-LED", price: 189, cost: 90, stock: 2, minStock: 5, category: "Acessórios" },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Ana Martins", email: "ana@empresa.com", phone: "(11) 98765-4321", city: "São Paulo" },
  { id: "c2", name: "Bruno Lima", email: "bruno@studio.com", phone: "(21) 99876-1234", city: "Rio de Janeiro" },
  { id: "c3", name: "Carla Duarte", email: "carla@agencia.com", phone: "(31) 97654-3210", city: "Belo Horizonte" },
  { id: "c4", name: "Diego Ramos", email: "diego@loja.com", phone: "(41) 98123-4567", city: "Curitiba" },
];

const todayISO = () => new Date().toISOString();
const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
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
  },
  {
    id: "s2",
    date: daysAgo(3),
    customerId: "c2",
    customerName: "Bruno Lima",
    items: [{ productId: "pr3", name: "Monitor 27\" IPS", qty: 1, unitPrice: 1599 }],
    total: 1599,
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
  },
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

  const [tab, setTab] = useState<
    "dashboard" | "sales" | "products" | "stock" | "customers" | "reports"
  >("dashboard");

  function resetAll() {
    if (confirm("Restaurar dados de demonstração? Suas alterações locais serão perdidas.")) {
      resetProducts();
      resetCustomers();
      resetSales();
    }
  }

  return (
    <DemoShell
      title="Gestão empresarial"
      subtitle="Painel administrativo com vendas, estoque e clientes"
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

        {tab === "dashboard" && <Dashboard products={products} sales={sales} customers={customers} />}
        {tab === "sales" && (
          <SalesTab
            sales={sales}
            setSales={setSales}
            products={products}
            setProducts={setProducts}
            customers={customers}
          />
        )}
        {tab === "products" && <ProductsTab products={products} setProducts={setProducts} />}
        {tab === "stock" && <StockTab products={products} setProducts={setProducts} />}
        {tab === "customers" && <CustomersTab customers={customers} setCustomers={setCustomers} />}
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
}: {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
}) {
  // Calculado uma vez por montagem/entrada: evita chamada impura
  // (new Date()) durante o render.
  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }, []);
  const salesMonth = sales.filter((s) => new Date(s.date).getTime() >= monthStart);
  const revenue = salesMonth.reduce((s, x) => s + x.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const itemsSold = salesMonth.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);

  const kpis = [
    { label: "Receita no mês", value: currencyBRL(revenue), hint: `${salesMonth.length} vendas` },
    { label: "Itens vendidos", value: String(itemsSold), hint: "no mês" },
    { label: "Produtos ativos", value: String(products.length), hint: "cadastrados" },
    { label: "Estoque baixo", value: String(lowStock), hint: "abaixo do mínimo" },
    { label: "Clientes", value: String(customers.length), hint: "cadastrados" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-nx-border bg-nx-surface p-4">
            <p className="text-xs text-nx-muted">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
            <p className="text-xs text-nx-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
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
}: {
  sales: Sale[];
  setSales: (fn: (p: Sale[]) => Sale[]) => void;
  products: Product[];
  setProducts: (fn: (p: Product[]) => Product[]) => void;
  customers: Customer[];
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
    // baixa de estoque
    setProducts((list) =>
      list.map((prod) => {
        const it = sale.items.find((i) => i.productId === prod.id);
        if (!it) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - it.qty) };
      }),
    );
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
                      <td className="px-4 py-3 text-right font-semibold">
                        {currencyBRL(s.total)}
                      </td>
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

      <div className="mt-4 flex items-center justify-between rounded-lg border border-nx-border bg-nx-surface p-3">
        <span className="text-sm text-nx-muted">Total</span>
        <span className="text-lg font-semibold">{currencyBRL(total)}</span>
      </div>

      {errors && <p className="mt-2 text-xs text-rose-400">{errors}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center rounded-lg border border-nx-border px-4 text-sm hover:bg-nx-surface-alt"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={submit}
          className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400"
        >
          Confirmar venda
        </button>
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
    (p.name + " " + p.sku + " " + p.category).toLowerCase().includes(query.toLowerCase()),
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
          placeholder="Pesquisar por nome, SKU ou categoria..."
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
                  <th className="px-4 py-3 text-right">Preço</th>
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
                    <td className="px-4 py-3 text-right">{currencyBRL(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          p.stock <= p.minStock
                            ? "text-rose-300"
                            : p.stock <= p.minStock * 2
                            ? "text-amber-300"
                            : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          Excluir
                        </button>
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
        <ProductForm
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
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      minStock: Number(minStock),
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar produto" : "Novo produto"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="SKU" error={errors.sku}>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Categoria">
          <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Preço de venda" error={errors.price}>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Custo" error={errors.cost}>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Estoque atual" error={errors.stock}>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Estoque mínimo" error={errors.minStock}>
          <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className={inputCls} />
        </Labeled>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button type="button" onClick={submit} className="btn-primary-sky">
          Salvar
        </button>
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
              filter === f
                ? "border-sky-500/50 bg-sky-500/10 text-white"
                : "border-nx-border bg-nx-surface text-nx-muted hover:text-white"
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
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            low
                              ? "bg-rose-500/10 text-rose-300"
                              : "bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {low ? "Baixo" : "Ok"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 rounded-md border border-nx-border">
                          <button
                            type="button"
                            onClick={() => adjust(p.id, -1)}
                            className="h-8 w-8 text-sm hover:bg-nx-surface"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => adjust(p.id, 1)}
                            className="h-8 w-8 text-sm hover:bg-nx-surface"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => adjust(p.id, 10)}
                            className="h-8 px-2 text-xs hover:bg-nx-surface"
                          >
                            +10
                          </button>
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
    (c.name + " " + c.email + " " + c.city).toLowerCase().includes(query.toLowerCase()),
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
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-black hover:bg-sky-400"
        >
          + Novo cliente
        </button>
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
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="rounded-md border border-nx-border px-2 py-1 text-xs hover:bg-nx-surface-alt"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="rounded-md border border-nx-border px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <CustomerForm
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "E-mail inválido.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: initial?.id ?? nextId("c"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
    });
  }

  return (
    <Modal onClose={onClose} title={initial ? "Editar cliente" : "Novo cliente"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Nome" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="E-mail" error={errors.email}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Telefone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </Labeled>
        <Labeled label="Cidade">
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
        </Labeled>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancelar
        </button>
        <button type="button" onClick={submit} className="btn-primary-sky">
          Salvar
        </button>
      </div>
    </Modal>
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
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sales.forEach((s) =>
      s.items.forEach((i) => {
        const cur = map.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.qty;
        cur.revenue += i.qty * i.unitPrice;
        map.set(i.productId, cur);
      }),
    );
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const avgTicket = sales.length ? totalRevenue / sales.length : 0;
  const totalItems = sales.reduce((s, x) => s + x.items.reduce((a, b) => a + b.qty, 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Receita total" value={currencyBRL(totalRevenue)} hint={`${sales.length} vendas`} />
        <KpiCard label="Ticket médio" value={currencyBRL(avgTicket)} hint="por venda" />
        <KpiCard label="Itens vendidos" value={String(totalItems)} hint="em todos os períodos" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Produtos mais vendidos</p>
          {byProduct.length === 0 ? (
            <p className="mt-3 text-sm text-nx-muted">Sem dados ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-nx-border">
              {byProduct.slice(0, 6).map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-nx-muted">{p.qty} unidades</p>
                  </div>
                  <p className="font-semibold">{currencyBRL(p.revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
          <p className="text-sm font-semibold">Resumo geral</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Produtos cadastrados" v={String(products.length)} />
            <Row k="Produtos com estoque baixo" v={String(products.filter((p) => p.stock <= p.minStock).length)} />
            <Row k="Clientes cadastrados" v={String(customers.length)} />
            <Row k="Vendas registradas" v={String(sales.length)} />
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-nx-border/70 pb-2 last:border-0">
      <dt className="text-nx-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
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
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-nx-border bg-nx-surface p-5 outline-none"
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
