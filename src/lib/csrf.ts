import { NextResponse } from 'next/server';

const EXCLUDED_PATH_PREFIXES = [
  '/api/subscription/webhook',
  '/api/auth/login',
  '/api/auth/login-password',
  '/api/auth/register',
  '/api/auth/request-tac',
  '/api/auth/logout',
];

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function validateCsrfOrigin(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  if (!MUTATING_METHODS.has(method)) {
    return null;
  }

  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  if (EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
  }

  let expectedHost: string;
  try {
    expectedHost = new URL(appUrl).host;
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const source = origin || referer;

  if (!source) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
  }

  try {
    const sourceHost = new URL(source).host;
    if (sourceHost !== expectedHost) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
