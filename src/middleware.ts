import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cache for token verification results to avoid repeated verification
// Format: { token: { isValid: boolean, timestamp: number } }
const tokenCache = new Map<string, { isValid: boolean; timestamp: number }>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function parseAuthTokenFromCookie(cookieString: string): string | null {
  if (!cookieString) return null;
  const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies.auth_token || null;
}

function verifyTokenEdge(token: string): boolean {
  const cleanToken = token.trim().split(';')[0];
  const now = Date.now();
  const cachedResult = tokenCache.get(cleanToken);
  if (cachedResult && (now - cachedResult.timestamp < TOKEN_CACHE_TTL)) {
    return cachedResult.isValid;
  }
  try {
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      tokenCache.set(cleanToken, { isValid: false, timestamp: now });
      return false;
    }
    const payloadBase64 = parts[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);
    const currentTime = Math.floor(Date.now() / 1000);
    const isValid = !(payload.exp && payload.exp < currentTime);
    tokenCache.set(cleanToken, { isValid, timestamp: now });
    return isValid;
  } catch (error) {
    tokenCache.set(cleanToken, { isValid: false, timestamp: now });
    return false;
  }
}

function cleanupTokenCache() {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > TOKEN_CACHE_TTL) tokenCache.delete(token);
  }
}
if (typeof setInterval !== 'undefined') setInterval(cleanupTokenCache, 10 * 60 * 1000);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/invoices(.*)',
  '/customers(.*)',
  '/inventory(.*)',
  '/pos(.*)'
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const path = request.nextUrl.pathname;

  if (path === '/landing' || path === '/home') {
    return NextResponse.next();
  }

  if (clerkEnabled) {
    const session = await auth();
    if (isProtectedRoute(request) && !session.userId) {
      // Redirect unauthenticated users trying to access protected routes
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((path === '/login' || path === '/sign-in' || path === '/signup' || path === '/sign-up' || path === '/') && session.userId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Fallback to legacy token check when Clerk not configured
  const token = request.cookies.get('auth_token')?.value || parseAuthTokenFromCookie(request.headers.get('cookie') || '');
  const hasValidToken = token ? verifyTokenEdge(token) : false;

  if (isProtectedRoute(request) && !hasValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if ((path === '/login' || path === '/sign-in' || path === '/signup' || path === '/sign-up' || path === '/') && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
