import 'dotenv/config';

// Ensure a default for local dev if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
}

import type { PrismaClient as PrismaClientType } from '@prisma/client';
// Import PrismaClient after env is set
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client') as { PrismaClient: typeof PrismaClientType };

// Postgres client (used when DATABASE_URL is postgres but Prisma schema provider is sqlite)
import { Client as PgClient } from 'pg';

const prisma = new PrismaClient({ log: ['warn', 'error'] });
let pgClient: PgClient | null = null;

function getProvider(): 'sqlite' | 'postgres' | 'unknown' {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('file:')) return 'sqlite';
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgres';
  return 'unknown';
}

function qIdent(name: string): string {
  // Quote identifier safely (limited to known candidates in this script)
  return '"' + name.replace(/"/g, '""') + '"';
}

async function getPg(): Promise<PgClient> {
  if (!pgClient) {
    pgClient = new PgClient({ connectionString: process.env.DATABASE_URL });
    await pgClient.connect();
  }
  return pgClient;
}

async function findUserTable(): Promise<string> {
  const provider = getProvider();
  const candidates = ['User', 'users'];

  if (provider === 'sqlite') {
    for (const tbl of candidates) {
      const rows = (await prisma.$queryRawUnsafe<any[]>(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tbl}'`)) as { name: string }[];
      if (rows.length > 0) return tbl;
    }
  } else if (provider === 'postgres') {
    const pg = await getPg();
    const res = await pg.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
      [[...candidates]]
    );
    if (res.rows.length > 0) return res.rows[0].table_name;
  }
  throw new Error('Could not find User table (tried "User" and "users").');
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const provider = getProvider();
  if (provider === 'sqlite') {
    const rows = (await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info('${table}')`)) as Array<{ name: string }>;
    return rows.some((r) => r.name === column);
  }
  if (provider === 'postgres') {
    const pg = await getPg();
    const res = await pg.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
      [table, column]
    );
    return res.rows.length > 0;
  }
  return false;
}

async function indexExists(table: string, indexName: string): Promise<boolean> {
  const provider = getProvider();
  if (provider === 'sqlite') {
    const rows = (await prisma.$queryRawUnsafe<any[]>(`PRAGMA index_list('${table}')`)) as Array<{ name: string }>;
    return rows.some((r) => r.name === indexName);
  }
  if (provider === 'postgres') {
    const pg = await getPg();
    const res = await pg.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1`,
      [indexName]
    );
    return res.rows.length > 0;
  }
  return false;
}

async function main() {
  const provider = getProvider();
  console.log(`Detected provider: ${provider}`);
  const table = await findUserTable();
  console.log(`Using user table: ${table}`);

  const col = 'clerkUserId';
  const hasColumn = await columnExists(table, col);
  if (!hasColumn) {
    console.log(`Adding column ${col} to ${table}...`);
    if (provider === 'sqlite') {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${qIdent(table)} ADD COLUMN ${qIdent(col)} TEXT`);
    } else if (provider === 'postgres') {
      const pg = await getPg();
      await pg.query(`ALTER TABLE ${qIdent('public')}.${qIdent(table)} ADD COLUMN IF NOT EXISTS ${qIdent(col)} text`);
    } else {
      throw new Error(`Unsupported provider for adding column: ${provider}`);
    }
  } else {
    console.log(`Column ${col} already exists on ${table}.`);
  }

  // Create a unique index for non-null clerkUserId values
  const indexBase = `${table.toLowerCase()}_clerkuserid_unique`; // e.g. user_clerkuserid_unique
  const hasIndex = await indexExists(table, indexBase);
  if (!hasIndex) {
    console.log(`Creating unique index ${indexBase} on ${table}(${col}) where not null...`);
    if (provider === 'sqlite') {
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS ${qIdent(indexBase)} ON ${qIdent(table)} (${qIdent(col)}) WHERE ${qIdent(col)} IS NOT NULL`
      );
    } else if (provider === 'postgres') {
      const pg = await getPg();
      // IF NOT EXISTS is not allowed with CONCURRENTLY; we did existence pre-check above
      await pg.query(
        `CREATE UNIQUE INDEX CONCURRENTLY ${qIdent(indexBase)} ON ${qIdent('public')}.${qIdent(table)} (${qIdent(col)}) WHERE ${qIdent(col)} IS NOT NULL`
      );
    } else {
      throw new Error(`Unsupported provider for creating index: ${provider}`);
    }
  } else {
    console.log(`Index ${indexBase} already exists.`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
    try {
      if (pgClient) await pgClient.end();
    } catch {}
  });