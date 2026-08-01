import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getProductImageStore } from '@/lib/product-image-store';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path } = await params;
    const objectKey = path.join('/');

    const expectedPrefix = `products/${user.id}/`;
    if (!objectKey.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ext = objectKey.split('.').pop()?.toLowerCase();
    if (ext === 'svg' || ext === 'svgz') {
      return NextResponse.json({ error: 'SVG images are not allowed' }, { status: 403 });
    }

    const store = getProductImageStore();
    const blob = await store.get(objectKey, { type: 'arrayBuffer' });

    if (!blob) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = contentTypeMap[ext || ''] || 'image/jpeg';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching product image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
