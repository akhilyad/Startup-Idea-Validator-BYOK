import { PrismaClient } from '@prisma/client';
import { env, isProduction } from '@sift/config';

/**
 * A single PrismaClient per process. In development the instance is cached on
 * `globalThis` so hot-reload does not exhaust the connection pool.
 */
const globalForPrisma = globalThis as unknown as { __siftPrisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__siftPrisma ??
  new PrismaClient({
    log: env.LOG_LEVEL === 'debug' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (!isProduction) {
  globalForPrisma.__siftPrisma = prisma;
}

export type { PrismaClient };
export { Prisma } from '@prisma/client';

/**
 * Health check used by `/health` endpoints and the readiness probe.
 * Returns false rather than throwing so callers can degrade gracefully.
 */
export async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
