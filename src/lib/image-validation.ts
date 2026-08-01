const BLOCKED_EXTENSIONS = new Set(['svg', 'svgz']);

const MAGIC_SIGNATURES: Array<{ ext: string; bytes: number[]; offset?: number }> = [
  { ext: 'jpg', bytes: [0xff, 0xd8, 0xff] },
  { ext: 'png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: 'gif', bytes: [0x47, 0x49, 0x46] },
  { ext: 'webp', bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
];

export function isBlockedImageExtension(extension: string): boolean {
  return BLOCKED_EXTENSIONS.has(extension.toLowerCase());
}

export function validateImageMagicBytes(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 12) {
    return false;
  }

  return MAGIC_SIGNATURES.some(({ bytes: signature, offset = 0 }) => {
    if (bytes.length < offset + signature.length) {
      return false;
    }
    return signature.every((byte, index) => bytes[offset + index] === byte);
  });
}
