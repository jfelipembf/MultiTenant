import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
      ]
      : ['error'],
  });

// Log de queries em desenvolvimento
if (process.env.NODE_ENV === 'development' && !globalForPrisma.prisma) {
  prisma.$on('query', (e) => {
    console.log(`[PRISMA] Query: ${e.query.substring(0, 100)}...`);
    console.log(`[PRISMA] Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
