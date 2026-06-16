import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const jwtSecretKey = new TextEncoder().encode(JWT_SECRET);

const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/invoices',
  '/customers',
  '/inventory',
  '/pos',
  '/accounting',
  '/receipts',
  '/settings',
] as const;

// Cache for token verification results to avoid repeated verification
const tokenCache = new Map<string, { isValid: boolean; timestamp: number }>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000;

function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function verifyTokenEdge(token: string): Promise<boolean> {
  const cleanToken = token.trim().split(';')[0];

  const now = Date.now();
  const cachedResult = tokenCache.get(cleanToken);

  if (cachedResult && now - cachedResult.timestamp < TOKEN_CACHE_TTL) {
    return cachedResult.isValid;
  }

  try {
    await jwtVerify(cleanToken, jwtSecretKey, {
      algorithms: ['HS256'],
    });

    tokenCache.set(cleanToken, { isValid: true, timestamp: now });
    return true;
  } catch {
    tokenCache.set(cleanToken, { isValid: false, timestamp: now });
    return false;
  }
}

function cleanupTokenCache() {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(token);
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupTokenCache, 10 * 60 * 1000);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/landing' || path === '/home') {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const isValidToken = token ? await verifyTokenEdge(token) : false;

  if (isProtectedRoute(path) && !isValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((path === '/login' || path === '/') && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
