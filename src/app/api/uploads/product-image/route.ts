import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getProductImageStore } from '@/lib/product-image-store';
import {
  isBlockedImageExtension,
  validateImageMagicBytes,
} from '@/lib/image-validation';
import { safeErrorResponse } from '@/lib/api-error';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string' || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
  }

  if (!file.type || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, GIF, and WebP uploads are allowed' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 5MB)' }, { status: 413 });
  }

  const fileName = file instanceof File ? file.name : 'upload.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';

  if (isBlockedImageExtension(extension)) {
    return NextResponse.json({ error: 'SVG uploads are not allowed' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (!validateImageMagicBytes(arrayBuffer)) {
    return NextResponse.json({ error: 'File content does not match a supported image format' }, { status: 400 });
  }

  const objectKey = `products/${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  try {
    const store = getProductImageStore();
    await store.set(objectKey, arrayBuffer);

    const url = `/api/uploads/product-image/${encodeURIComponent(objectKey)}`;
    return NextResponse.json({ url, path: objectKey });
  } catch (error: unknown) {
    return safeErrorResponse(error, 'Failed to upload image');
  }
}
