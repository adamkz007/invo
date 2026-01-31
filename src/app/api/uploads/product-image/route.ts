import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_PREFIX = 'image/';

function getProductImageStore() {
  // For local development, pass credentials explicitly
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({
      name: 'product-images',
      siteID,
      token,
    });
  }

  // In Netlify runtime, credentials are automatic
  return getStore('product-images');
}

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
    const store = getProductImageStore();
    const arrayBuffer = await file.arrayBuffer();

    // Store the image (metadata stored separately in key for simplicity)
    await store.set(objectKey, arrayBuffer);

    // Return the URL to access the image via our GET endpoint
    const url = `/api/uploads/product-image/${encodeURIComponent(objectKey)}`;

    return NextResponse.json({ url, path: objectKey });
  } catch (error: unknown) {
    console.error('Error uploading product image to Netlify Blob:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to upload image: ${message}` },
      { status: 500 },
    );
  }
}



