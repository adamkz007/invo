import { PrismaClient } from '@prisma/client';

// Fix EventEmitter memory leak by increasing the max listeners
if (typeof process !== 'undefined') {
  process.setMaxListeners(20);
}

const auditableModels = new Set([
  'Account', 'JournalEntry', 'JournalLine', 'Expense', 'TaxRate', 'BankAccount', 'BankTransaction', 'Invoice'
]);

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error']
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelName = typeof model === 'string' ? model : null;
          const isAuditable = modelName !== null && auditableModels.has(modelName);
          let before: any = null;

          if (isAuditable && (operation === 'update' || operation === 'delete')) {
            try {
              const recordId = (args as { where?: { id?: string } })?.where?.id;
              if (recordId) {
                before = await (client as any)[modelName].findUnique({ where: { id: recordId } });
              }
            } catch {}
          }

          const result = await query(args);

          if (isAuditable && (operation === 'create' || operation === 'update' || operation === 'delete')) {
            const after: any = operation === 'create' || operation === 'update' ? result : null;
            const entityId = (after && after.id) || (before && before.id) || '';
            const userId = (after && after.userId) || (before && before.userId);

            if (userId && entityId) {
              try {
                await client.auditLog.create({
                  data: {
                    entity: modelName,
                    entityId,
                    action: operation,
                    userId,
                    before: before ? JSON.stringify(before) : null,
                    after: after ? JSON.stringify(after) : null,
                  },
                });
              } catch {}
            }
          }

          return result;
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma?: ExtendedPrismaClient };

// Create a new PrismaClient using the DATABASE_URL from environment variables
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add a connection test function
export async function testConnection() {
  try {
    // Test the connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Helper function to batch database operations
export async function batchTransactions<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
  return prisma.$transaction(async () => {
    const results: T[] = [];
    for (const operation of operations) {
      results.push(await operation());
    }
    return results;
  });
}

// Clean up Prisma connection when the application is shutting down
if (typeof window === 'undefined') { // Only in Node.js environment
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
