import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cache for token verification results to avoid repeated verification
// Format: { token: { isValid: boolean, timestamp: number } }
const tokenCache = new Map<string, { isValid: boolean; timestamp: number }>();
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Parse auth token from cookie string
 */
function parseAuthTokenFromCookie(cookieString: string): string | null {
  if (!cookieString) return null;
  
  // Parse the cookie string
  const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies.auth_token || null;
}

/**
 * Lightweight token verification for Edge Runtime with caching
 */
function verifyTokenEdge(token: string): boolean {
  // Clean up token if it comes from a cookie
  const cleanToken = token.trim().split(';')[0];
  
  // Check cache first
  const now = Date.now();
  const cachedResult = tokenCache.get(cleanToken);
  
  if (cachedResult && (now - cachedResult.timestamp < TOKEN_CACHE_TTL)) {
    return cachedResult.isValid;
  }
  
  try {
    // Basic structure check
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      // Cache the invalid result
      tokenCache.set(cleanToken, { isValid: false, timestamp: now });
      return false;
    }

    // Attempt to parse payload without using Buffer
    const payloadBase64 = parts[1];
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    );
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const currentTime = Math.floor(Date.now() / 1000);
    const isValid = !(payload.exp && payload.exp < currentTime);
    
    // Cache the result
    tokenCache.set(cleanToken, { isValid, timestamp: now });
    
    return isValid;
  } catch (error) {
    // Cache the invalid result
    tokenCache.set(cleanToken, { isValid: false, timestamp: now });
    return false;
  }
}

// Clean up expired cache entries periodically
function cleanupTokenCache() {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(token);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupTokenCache, 10 * 60 * 1000);
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected (e.g. dashboard routes)
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/invoices') || 
                           path.startsWith('/customers') ||
                           path.startsWith('/inventory') ||
                           path.startsWith('/pos');
  
  // Special case for the landing page routes
  if (path === '/landing' || path === '/home') {
    // Allow access to landing page regardless of authentication status
    return NextResponse.next();
  }
  
  // Extract token using multiple methods
  const token = request.cookies.get('auth_token')?.value;
  
  // Log cookies for debugging
  console.log('Cookies via NextRequest:', request.cookies.getAll());
  
  // Verify token if it exists
  let isValidToken = false;
  if (token) {
    isValidToken = verifyTokenEdge(token);
  }
  
  // If the path is protected and there's no valid token, redirect to login
  if (isProtectedRoute && !isValidToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access login page but already authenticated, redirect to dashboard
  if ((path === '/login' || path === '/') && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
