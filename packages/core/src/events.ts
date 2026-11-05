import { EventEmitter } from "eventemitter3";

/**
 * Event System — Eventos internos e SSE para real-time
 * Admin ↔ Site sync, plugin events, audit logs
 */

// =========================================================
// Event Types
// =========================================================

export interface PlatformEvent<T = any> {
  id: string;
  type: string;
  tenantId: string;
  userId?: string;
  payload: T;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type EventHandler<T = any> = (event: PlatformEvent<T>) => Promise<void> | void;

// Eventos padrão da plataforma
export const PLATFORM_EVENTS = {
  // Tenant lifecycle
  "tenant.created": "Tenant criado",
  "tenant.updated": "Tenant atualizado",
  "tenant.deleted": "Tenant deletado",
  "tenant.status_changed": "Status do tenant alterado",
  "tenant.plan_changed": "Plano do tenant alterado",
  "tenant.domain_verified": "Domínio customizado verificado",

  // User & Membership
  "user.created": "Usuário criado",
  "user.updated": "Usuário atualizado",
  "user.deleted": "Usuário deletado",
  "user.invited": "Usuário convidado",
  "user.role_changed": "Role do usuário alterada",
  "user.removed": "Usuário removido do tenant",
  "membership.created": "Membership criada",
  "membership.updated": "Membership atualizada",
  "membership.deleted": "Membership removida",

  // Plugin lifecycle
  "plugin.installed": "Plugin instalado",
  "plugin.uninstalled": "Plugin desinstalado",
  "plugin.enabled": "Plugin habilitado",
  "plugin.disabled": "Plugin desabilitado",
  "plugin.configured": "Plugin configurado",
  "plugin.upgraded": "Plugin atualizado",

  // Billing
  "subscription.created": "Assinatura criada",
  "subscription.updated": "Assinatura atualizada",
  "subscription.cancelled": "Assinatura cancelada",
  "subscription.resumed": "Assinatura reativada",
  "subscription.payment_succeeded": "Pagamento bem-sucedido",
  "subscription.payment_failed": "Pagamento falhou",
  "invoice.created": "Fatura criada",
  "invoice.paid": "Fatura paga",
  "invoice.payment_failed": "Pagamento de fatura falhou",

  // Plugin-specific (emitidos pelos plugins)
  "pousadas.booking.created": "Nova reserva",
  "pousadas.booking.confirmed": "Reserva confirmada",
  "pousadas.booking.cancelled": "Reserva cancelada",
  "pousadas.booking.checked_in": "Check-in realizado",
  "pousadas.booking.checked_out": "Check-out realizado",
  "pousadas.availability.updated": "Disponibilidade alterada",

  "livrarias.order.created": "Novo pedido",
  "livrarias.order.paid": "Pedido pago",
  "livrarias.order.shipped": "Pedido enviado",
  "livrarias.order.delivered": "Pedido entregue",
  "livrarias.order.cancelled": "Pedido cancelado",
  "livrarias.book.low_stock": "Estoque baixo",

  "cardapio.order.created": "Novo pedido no cardápio",
  "cardapio.order.ready": "Pedido pronto",
  "cardapio.order.paid": "Pedido pago",
  "cardapio.table.occupied": "Mesa ocupada",
  "cardapio.table.freed": "Mesa liberada",

  "catalogo.inquiry.created": "Novo orçamento solicitado",

  "site.page.published": "Página publicada",
  "site.post.published": "Post publicado",

  "gestao.sale.created": "Nova venda",
  "gestao.invoice.authorized": "NF-e autorizada",
  "gestao.receivable.received": "Recebimento confirmado",

  "rh.employee.hired": "Colaborador contratado",
  "rh.employee.terminated": "Colaborador desligado",
  "rh.payroll.processed": "Folha processada",
  "rh.leave.approved": "Férias/licença aprovada",
} as const;

export type PlatformEventType = keyof typeof PLATFORM_EVENTS;

// =========================================================
// Event Bus (Server-side)
// =========================================================

class ServerEventBus extends EventEmitter<Record<string, EventHandler[]>> {
  private handlers = new Map<string, EventHandler[]>();
  private middleware: Array<(event: PlatformEvent) => PlatformEvent | null> = [];

  emit<T>(type: string, event: PlatformEvent<T>): boolean {
    // Aplicar middleware
    let processedEvent: PlatformEvent<T> | null = event;
    for (const mw of this.middleware) {
      processedEvent = mw(processedEvent);
      if (!processedEvent) return false; // middleware bloqueou
    }

    // Emit para handlers locais
    const handlers = this.handlers.get(type) || [];
    const wildcardHandlers = this.handlers.get("*") || [];

    for (const handler of [...handlers, ...wildcardHandlers]) {
      try {
        handler(processedEvent!);
      } catch (error) {
        console.error(`Erro no handler de ${type}:`, error);
      }
    }

    // Emit para EventEmitter base (para SSE)
    return super.emit(type, processedEvent!);
  }

  on<T>(type: string, handler: EventHandler<T>): this {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler as EventHandler);
    return this;
  }

  off(type: string, handler: EventHandler): this {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    }
    return this;
  }

  onAny(handler: EventHandler): this {
    return this.on("*", handler);
  }

  use(middleware: (event: PlatformEvent) => PlatformEvent | null): this {
    this.middleware.push(middleware);
    return this;
  }

  // Helper para emitir eventos tipados
  emitTyped<T>(type: PlatformEventType, payload: T, context: {
    tenantId: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }): void {
    const event: PlatformEvent<T> = {
      id: crypto.randomUUID(),
      type,
      tenantId: context.tenantId,
      userId: context.userId,
      payload,
      timestamp: new Date(),
      metadata: context.metadata,
    };
    this.emit(type, event);
  }
}

// Singleton
let serverEventBus: ServerEventBus | null = null;

export function getServerEventBus(): ServerEventBus {
  if (!serverEventBus) {
    serverEventBus = new ServerEventBus();
    // Middleware de logging
    serverEventBus.use((event) => {
      console.log(`[EVENT] ${event.type} | tenant:${event.tenantId} | user:${event.userId || "system"}`);
      return event;
    });
  }
  return serverEventBus;
}

// =========================================================
// SSE Connection Manager (para real-time admin ↔ site)
// =========================================================

interface SSEConnection {
  id: string;
  tenantId: string;
  userId?: string;
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
  lastPing: Date;
  filters?: string[]; // tipos de evento para filtrar
}

class SSEManager {
  private connections = new Map<string, SSEConnection>();
  private eventBus: ServerEventBus;
  private pingInterval: NodeJS.Timeout;

  constructor(eventBus: ServerEventBus) {
    this.eventBus = eventBus;
    this.pingInterval = setInterval(() => this.ping(), 30000);
    // Escutar eventos do bus e distribuir
    this.eventBus.onAny((event) => this.broadcast(event));
  }

  addConnection(connection: SSEConnection): void {
    this.connections.set(connection.id, connection);
    console.log(`[SSE] Conexão aberta: ${connection.id} (tenant: ${connection.tenantId})`);
  }

  removeConnection(id: string): void {
    const conn = this.connections.get(id);
    if (conn) {
      try {
        conn.controller.close();
      } catch {}
      this.connections.delete(id);
      console.log(`[SSE] Conexão fechada: ${id}`);
    }
  }

  private broadcast(event: PlatformEvent): void {
    const message = `data: ${JSON.stringify(event)}\n\n`;

    for (const conn of this.connections.values()) {
      // Filtrar por tenant
      if (conn.tenantId !== event.tenantId) continue;

      // Filtrar por tipo se especificado
      if (conn.filters && conn.filters.length > 0 && !conn.filters.includes(event.type)) continue;

      try {
        conn.controller.enqueue(message);
      } catch {
        // Conexão quebrada, remover
        this.removeConnection(conn.id);
      }
    }
  }

  private ping(): void {
    const now = new Date();
    const pingMessage = `: ping\n\n`;

    for (const conn of this.connections.values()) {
      // Remover conexões mortas (> 60s sem ping)
      if (now.getTime() - conn.lastPing.getTime() > 60000) {
        this.removeConnection(conn.id);
        continue;
      }

      try {
        conn.controller.enqueue(pingMessage);
        conn.lastPing = now;
      } catch {
        this.removeConnection(conn.id);
      }
    }
  }

  getConnectionCount(tenantId?: string): number {
    if (!tenantId) return this.connections.size;
    return Array.from(this.connections.values()).filter((c) => c.tenantId === tenantId).length;
  }

  shutdown(): void {
    clearInterval(this.pingInterval);
    for (const conn of this.connections.values()) {
      try {
        conn.controller.close();
      } catch {}
    }
    this.connections.clear();
  }
}

let sseManager: SSEManager | null = null;

export function getSSEManager(): SSEManager {
  if (!sseManager) {
    sseManager = new SSEManager(getServerEventBus());
  }
  return sseManager;
}

// =========================================================
// Client-side SSE Hook (para uso no browser)
// =========================================================

/**
 * Hook para conectar ao SSE do servidor
 * Uso no cliente (Next.js "use client")
 */
export function createSSEClient(tenantId: string, token: string, filters?: string[]) {
  const url = new URL("/api/events/stream", window.location.origin);
  url.searchParams.set("tenantId", tenantId);
  if (filters?.length) url.searchParams.set("filters", filters.join(","));

  const eventSource = new EventSource(url.toString(), {
    // headers não suportado nativamente, usar cookie auth
  });

  return eventSource;
}

// =========================================================
// Audit Log Integration
// =========================================================

/**
 * Middleware para gravar eventos no audit log automaticamente
 */
export function createAuditMiddleware(prisma: any) {
  return async (event: PlatformEvent): Promise<PlatformEvent | null> => {
    // Não auditar eventos de auditoria (evitar loop)
    if (event.type.startsWith("audit.")) return event;

    try {
      await prisma.auditLog.create({
        data: {
          tenantId: event.tenantId,
          userId: event.userId,
          action: event.type,
          entity: event.metadata?.entity || "Event",
          entityId: event.metadata?.entityId,
          before: event.metadata?.before,
          after: event.payload,
          metadata: event.metadata,
          ip: event.metadata?.ip,
          userAgent: event.metadata?.userAgent,
        },
      });
    } catch (error) {
      console.error("Falha ao gravar audit log:", error);
      // Não bloquear evento por falha de auditoria
    }

    return event;
  };
}

// =========================================================
// Event Schemas (Zod) para validação
// =========================================================

import { z } from "zod";

export const platformEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  tenantId: z.string().cuid(),
  userId: z.string().cuid().optional(),
  payload: z.unknown(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export const eventFiltersSchema = z.object({
  tenantId: z.string().cuid(),
  types: z.array(z.string()).optional(),
  userId: z.string().cuid().optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;