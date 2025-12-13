import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_PREFIX = 'image/';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string' || !(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
  }

  if (!file.type?.startsWith(ALLOWED_MIME_PREFIX)) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 5MB)' }, { status: 413 });
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const objectKey = `products/${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  try {
    const store = getStore('product-images');
    const result = await store.set(objectKey, await file.arrayBuffer(), {
      metadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    return NextResponse.json({ path: objectKey, etag: result.etag });
  } catch (error) {
    console.error('Error uploading product image to Netlify Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 },
    );
  }
}



