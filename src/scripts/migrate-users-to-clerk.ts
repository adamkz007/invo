import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
}

import type { PrismaClient as PrismaClientType } from '@prisma/client';
// Import Prisma after env ready
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client') as { PrismaClient: typeof PrismaClientType };

import fetch from 'node-fetch';
import { Client as PgClient } from 'pg';
import crypto from 'crypto';

const prisma = new PrismaClient({ log: ['warn', 'error'] });
let pgClient: PgClient | null = null;

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const CLERK_BASE_URL = process.env.CLERK_API_URL || 'https://api.clerk.com/v1';

if (!CLERK_SECRET_KEY) {
  console.warn('CLERK_SECRET_KEY not set. Exiting migration to avoid errors.');
  process.exit(0);
}

function getProvider(): 'sqlite' | 'postgres' | 'unknown' {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('file:')) return 'sqlite';
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgres';
  return 'unknown';
}

function qIdent(name: string): string {
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
  throw new Error('No user table found. Tried User and users.');
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Helper to call Clerk API
async function clerkApi(path: string, options: any) {
  const url = `${CLERK_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json?.errors) {
        throw new Error(`Clerk API ${path} failed: ${res.status} ${res.statusText} - ${JSON.stringify(json.errors)}`);
      }
    } catch {}
    throw new Error(`Clerk API ${path} failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

function getEmail(u: any): string | null {
  const email = u.email || u.emailAddress || u.primaryEmail || u.username || null;
  if (!email) return null;
  const s = String(email).trim();
  if (!s || !s.includes('@')) return null;
  return s;
}

function generateStrongPassword(length = 24): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+[]{};:,.<>?';
  const bytes = crypto.randomBytes(length);
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += alphabet[bytes[i] % alphabet.length];
  }
  // Ensure basic complexity by injecting at least one of each class if missing
  if (!/[A-Z]/.test(pwd)) pwd = 'A' + pwd.slice(1);
  if (!/[a-z]/.test(pwd)) pwd = pwd.slice(0, 1) + 'a' + pwd.slice(2);
  if (!/[0-9]/.test(pwd)) pwd = pwd.slice(0, 2) + '7' + pwd.slice(3);
  if (!/[!@#$%^&*()\-_=+\[\]{};:,.<>?]/.test(pwd)) pwd = pwd.slice(0, 3) + '!' + pwd.slice(4);
  return pwd;
}

// Fetch users from local DB
async function getLocalUsers(table: string) {
  const provider = getProvider();
  if (provider === 'sqlite') {
    const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ${qIdent(table)}`);
    return rows;
  } else if (provider === 'postgres') {
    const pg = await getPg();
    const res = await pg.query<any>(`SELECT * FROM ${qIdent('public')}.${qIdent(table)}`);
    return res.rows;
  }
  throw new Error('Unsupported provider');
}

function buildCreateUserPayload(u: any) {
  const email = getEmail(u);
  const firstName = u.name || u.firstName || u.first_name || u.given_name || null; // fall back to name
  const lastName = u.lastName || u.last_name || u.family_name || null;

  const payload: any = {
    email_address: email ? [String(email)] : undefined, // array format
    first_name: firstName ? String(firstName) : undefined,
    last_name: lastName ? String(lastName) : undefined,
    password: generateStrongPassword(),
  };

  return payload;
}

async function ensureClerkUser(u: any) {
  // Try to find existing by email
  const email = getEmail(u);
  if (email) {
    try {
      const found = await clerkApi(`/users?email_address=${encodeURIComponent(String(email))}`, {
        method: 'GET',
      });
      if (Array.isArray(found) && found.length > 0) {
        return found[0];
      }
    } catch (e) {
      // ignore; we'll attempt to create below
    }
  }

  const payload = buildCreateUserPayload(u);
  if (!payload.email_address || payload.email_address.length === 0) {
    throw new Error('No valid email on user record');
  }
  const created = await clerkApi('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return created;
}

async function updateClerkId(table: string, userId: string, clerkId: string) {
  const provider = getProvider();
  if (provider === 'sqlite') {
    await prisma.$executeRawUnsafe(
      `UPDATE ${qIdent(table)} SET ${qIdent('clerkUserId')} = $1 WHERE id = $2`,
      clerkId,
      userId
    );
    return;
  }
  if (provider === 'postgres') {
    const pg = await getPg();
    await pg.query(`UPDATE ${qIdent('public')}.${qIdent(table)} SET ${qIdent('clerkUserId')} = $1 WHERE id = $2`, [clerkId, userId]);
    return;
  }
  throw new Error('Unsupported provider');
}

async function main() {
  console.log('Starting user migration to Clerk...');
  const table = await findUserTable();
  const rows = await getLocalUsers(table);
  console.log(`Found ${rows.length} users in table ${table}.`);

  let success = 0;
  let skipped = 0;
  let failed = 0;
  let firstErrorLogged = false;

  for (const u of rows) {
    const email = getEmail(u);
    if (!email) {
      skipped++;
      continue;
    }
    try {
      const clerkUser = await ensureClerkUser(u);
      const clerkId = clerkUser?.id;
      if (clerkId) {
        await updateClerkId(table, u.id, clerkId);
        success++;
      } else {
        console.warn('No Clerk ID for user', u.id);
        skipped++;
      }
      // avoid hitting rate limits
      await delay(150);
    } catch (e: any) {
      if (!firstErrorLogged) {
        firstErrorLogged = true;
        try {
          const debugPayload = buildCreateUserPayload(u);
          console.error('Sample payload that failed (without password value):', JSON.stringify({
            ...debugPayload,
            password: '********',
          }));
        } catch {}
      }
      console.error('Failed migrating user', u.id, e?.message || e);
      failed++;
      await delay(250);
    }
  }

  console.log(`Migration complete. Success: ${success}, Skipped: ${skipped}, Failed: ${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await prisma.$disconnect(); } catch {}
    try { if (pgClient) await pgClient.end(); } catch {}
  });