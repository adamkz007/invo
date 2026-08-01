import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { getEinvoiceEncryptionKey } from '@/lib/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function encryptSecret(plaintext: string): string {
  const key = getEinvoiceEncryptionKey();
  if (!key) {
    throw new Error('EINVOICE_ENCRYPTION_KEY is not configured');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `enc:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptSecret(payload: string): string {
  const key = getEinvoiceEncryptionKey();
  if (!key) {
    throw new Error('EINVOICE_ENCRYPTION_KEY is not configured');
  }

  if (!payload.startsWith('enc:')) {
    throw new Error('Invalid encrypted secret format');
  }

  const [, ivB64, tagB64, dataB64] = payload.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith('enc:'));
}
