import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Get the database URL from environment variables
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Ensure the URL starts with the correct protocol
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.warn('DATABASE_URL does not start with postgresql:// or postgres://, adding prefix');
  databaseUrl = `postgresql://${databaseUrl}`;
}

// Add connection parameters if they don't exist
if (!databaseUrl.includes('?')) {
  databaseUrl += '?connection_limit=5&pool_timeout=10&connect_timeout=30&sslmode=require';
} else if (!databaseUrl.includes('sslmode=')) {
  databaseUrl += '&sslmode=require';
}

// Create a new PrismaClient instance with connection retry logic
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Attach PrismaClient to the `global` object in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add a connection test function with retry logic
export async function testConnection(retries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Test the connection by running a simple query
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Database connection attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next attempt (exponential backoff)
        delay *= 2;
      }
    }
  }
  
  console.error(`All ${retries} connection attempts failed. Last error:`, lastError);
  return false;
}

// Helper function for transactions with retry logic
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        return await fn(tx as unknown as PrismaClient);
      });
    } catch (error: any) {
      lastError = error;
      // Only retry on connection errors
      if (!error.message?.includes('connection') && !error.message?.includes('timeout')) {
        throw error;
      }
      
      console.error(`Transaction attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying transaction in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Helper function to batch database operations with retry logic
export async function batchTransactions<T>(
  operations: (() => Promise<T>)[],
  retries = 3
): Promise<T[]> {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return prisma.$transaction(async (tx) => {
        const results: T[] = [];
        for (const operation of operations) {
          results.push(await operation());
        }
        return results;
      });
    } catch (error: any) {
      lastError = error;
      // Only retry on connection errors
      if (!error.message?.includes('connection') && !error.message?.includes('timeout')) {
        throw error;
      }
      
      console.error(`Batch transaction attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying batch transaction in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Clean up Prisma connection when the application is shutting down
if (typeof window === 'undefined') { // Only in Node.js environment
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Export a default instance
export default prisma;
