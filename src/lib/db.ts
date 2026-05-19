import { PrismaClient } from '@prisma/client';

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing database URL at runtime', {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasPrismaDatabaseUrl: Boolean(process.env.PRISMA_DATABASE_URL),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
