import type { PluginInstance, PluginContext } from "@nexis/core/plugins";
import { pousadasConfigSchema } from "./types";

/**
 * @nexis/plugin-pousadas — Plugin de Gestão de Pousadas
 *
 * Este plugin implementa um sistema completo de reservas e gestão hoteleira
 * com disponibilidade em tempo real, check-in/out, relatórios e integração
 * com canais de venda (OTAs).
 */

// Re-exportar tipos públicos
export * from "./types";
export * from "./utils";
export * from "./hooks";
export * from "./components";
export * from "./pages";
export * from "./admin";
export * from "./api";

// =========================================================
// Plugin Instance
// =========================================================

const pousadasPlugin: PluginInstance = {
  manifest: {
    key: "pousadas",
    name: "Gestão de Pousadas",
    description: "Sistema completo de reservas, disponibilidade e gestão de quartos para pousadas e hotéis",
    version: "1.0.0",
    author: "Nexis Digital",
    license: "COMMERCIAL",
    category: "hospitality",
    icon: "bed",
    tags: ["hospitalidade", "reservas", "pousada", "hotel", "booking"],
    minPlatformVersion: "0.1.0",
    capabilities: ["database", "api", "admin-ui", "public-site", "webhooks", "payments", "email", "realtime"],
    configSchema: pousadasConfigSchema,
    defaultConfig: {
      checkInTime: "14:00",
      checkOutTime: "11:00",
      allowOnlineBooking: true,
      requireDeposit: false,
      depositPercentage: 30,
      cancellationPolicy: "moderate",
      maxAdvanceBookingDays: 365,
      minStayNights: 1,
      maxStayNights: 30,
    },
    routes: [
      { path: "/pousadas", type: "page", component: "pages/PousadasPage" },
      { path: "/pousadas/[slug]", type: "page", component: "pages/PousadaDetailPage" },
      { path: "/pousadas/[slug]/reserva", type: "page", component: "pages/BookingPage" },
      { path: "/api/pousadas/*", type: "api", handler: "api/pousadas" },
      { path: "/admin/pousadas", type: "admin", component: "admin/PousadasAdmin" },
    ],
    adminMenus: [
      { key: "rooms", label: "Quartos", icon: "bed", path: "/admin/pousadas", order: 1 },
      { key: "bookings", label: "Reservas", icon: "calendar", path: "/admin/pousadas", order: 2 },
      { key: "availability", label: "Disponibilidade", icon: "calendar-days", path: "/admin/pousadas", order: 3 },
      { key: "settings", label: "Configurações", icon: "settings", path: "/admin/pousadas", order: 99 },
    ],
    webhooks: [
      { event: "booking.created", description: "Nova reserva criada", payloadSchema: pousadasConfigSchema },
      { event: "booking.confirmed", description: "Reserva confirmada", payloadSchema: pousadasConfigSchema },
      { event: "booking.cancelled", description: "Reserva cancelada", payloadSchema: pousadasConfigSchema },
      { event: "booking.checked_in", description: "Check-in realizado", payloadSchema: pousadasConfigSchema },
      { event: "booking.checked_out", description: "Check-out realizado", payloadSchema: pousadasConfigSchema },
      { event: "availability.updated", description: "Disponibilidade alterada", payloadSchema: pousadasConfigSchema },
    ],
    requiredPermissions: ["plugin.data.read", "plugin.data.write", "plugin.configure"],
  },

  async onLoad(context: PluginContext) {
    console.log(`[Plugin:Pousadas] Carregado para tenant ${context.tenantId}`);

    // Registrar modelos no Prisma (em produção seria via Prisma Client extendido)
    // context.prisma.$extends(...)

    // Configurar webhooks
    // context.eventEmitter.on("booking.created", handleBookingCreated)

    // Inicializar dados padrão se necessário
    // await initializeDefaultData(context)
  },

  async onUnload() {
    console.log("[Plugin:Pousadas] Descarregado");
    // Limpar listeners, fechar conexões, etc.
  },

  async onConfigUpdate(config: Record<string, unknown>) {
    console.log("[Plugin:Pousadas] Configuração atualizada:", config);
    // Validar e aplicar nova config
    const validated = pousadasConfigSchema.parse(config);
    // Aplicar mudanças (ex: atualizar horários de check-in/out)
  },

  async onTenantActivate() {
    console.log("[Plugin:Pousadas] Tenant ativado");
    // Criar dados iniciais, configurar webhooks externos, etc.
  },

  async onTenantDeactivate() {
    console.log("[Plugin:Pousadas] Tenant desativado");
    // Pausar sincronizações, desabilitar webhooks, etc.
  },

  async onInstall() {
    console.log("[Plugin:Pousadas] Instalado no tenant");
    // Criar tabelas, seed data, configurar integrações padrão
  },

  async onUninstall() {
    console.log("[Plugin:Pousadas] Desinstalado do tenant");
    // Limpar dados, remover webhooks, cancelar assinaturas
  },

  async onUpgrade(fromVersion: string) {
    console.log(`[Plugin:Pousadas] Atualizado da versão ${fromVersion}`);
    // Migrações de dados, compatibilidade
  },
};

export default pousadasPlugin;