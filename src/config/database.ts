import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from './env';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaMariaDb(env.DATABASE_URL);

  return new PrismaClient({
    adapter,
    log:
      process.env['NODE_ENV'] === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('MySQL database connected successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    logger.error({ error }, `Database connection failed: ${message}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('MySQL database disconnected');
}

