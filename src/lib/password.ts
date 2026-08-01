import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

const BCRYPT_COST = 10;

function hashLegacySha256(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2');
}

export function needsRehash(hash: string | null | undefined): boolean {
  return !hash || !isBcryptHash(hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) {
    return false;
  }

  if (isBcryptHash(hash)) {
    return bcrypt.compare(plain, hash);
  }

  return hashLegacySha256(plain) === hash;
}

export async function upgradePasswordHashIfNeeded(
  userId: string,
  plain: string,
  currentHash: string | null | undefined,
  updateFn: (userId: string, passwordHash: string) => Promise<void>,
): Promise<void> {
  if (!needsRehash(currentHash)) {
    return;
  }

  const passwordHash = await hashPassword(plain);
  await updateFn(userId, passwordHash);
}
