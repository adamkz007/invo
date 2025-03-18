import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new PrismaClient using the DATABASE_URL from environment variables
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] // Removed 'query' to reduce logging overhead
      : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Fix EventEmitter memory leak by increasing the max listeners
if (typeof process !== 'undefined') {
  process.setMaxListeners(20);
}

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
  return prisma.$transaction(async (tx) => {
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
