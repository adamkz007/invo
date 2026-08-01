const PLACEHOLDER_SECRETS = new Set(['your-secret-key', 'change-me', '']);

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret || PLACEHOLDER_SECRETS.has(secret)) {
      throw new Error(
        'JWT_SECRET must be set to a strong value in production',
      );
    }
    return secret;
  }

  return secret || 'your-secret-key';
}

export function getEinvoiceEncryptionKey(): Buffer | null {
  const raw = process.env.EINVOICE_ENCRYPTION_KEY;
  if (!raw) {
    return null;
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('EINVOICE_ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  }

  return key;
}
