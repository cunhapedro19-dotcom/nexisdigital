import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client singleton para evitar múltiplas instâncias em dev (hot reload).
 * Em produção, cria nova instância a cada request (serverless) ou reusa (long-running).
 */
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

/**
 * Middleware para Row-Level Security (RLS) automático via tenantId.
 * Injeta tenantId em todas as queries quando disponível no contexto.
 */
export function withTenant<T extends PrismaClient>(client: T, tenantId: string): T {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Injeta tenantId em create, update, delete, findUnique, findMany, etc.
          if (args.where) {
            args.where = { ...args.where, tenantId };
          } else {
            args.where = { tenantId };
          }
          return query(args);
        },
      },
    },
  }) as T;
}

/**
 * Helper para transações com tenant isolado
 */
export async function withTenantTransaction<T>(
  tenantId: string,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const tx = prisma.$transaction(async (tx) => {
    const tenantTx = withTenant(tx, tenantId);
    return fn(tenantTx);
  });
  return tx;
}

export default prisma;