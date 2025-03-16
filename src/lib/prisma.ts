import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Get the absolute path to the database file
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');

// Check if the database file exists
const dbExists = fs.existsSync(dbPath);
console.log(`Database file ${dbPath} exists: ${dbExists}`);

// Construct the database URL
const databaseUrl = process.env.DATABASE_URL;
console.log(`Using database URL: ${databaseUrl}`);

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new PrismaClient instance
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

// Attach PrismaClient to the `global` object in development
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

// Helper function for transactions
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await fn(tx as unknown as PrismaClient);
  });
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

// Export a default instance
export default prisma;
