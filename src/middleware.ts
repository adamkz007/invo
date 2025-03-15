import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Lightweight token verification for Edge Runtime
function verifyTokenEdge(token: string): boolean {
  try {
    // Basic structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token structure');
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
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token has expired');
      return false;
    }

    return true;
  } catch (error) {
    console.log('Token verification error:', error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected (e.g. dashboard routes)
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/invoices') || 
                           path.startsWith('/customers') ||
                           path.startsWith('/inventory');
  
  // Special case for the landing page routes
  if (path === '/landing' || path === '/home') {
    // Allow access to landing page regardless of authentication status
    return NextResponse.next();
  }
  
  // Comprehensive cookie detection methods
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieObject = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  // Log all cookie detection methods
  console.log('Cookie Header:', cookieHeader);
  console.log('Parsed Cookie Object:', cookieObject);
  console.log('Cookies via NextRequest:', request.cookies.getAll());
  
  // Extract token using multiple methods
  const tokenFromHeader = cookieObject['auth_token'];
  const tokenFromCookies = request.cookies.get('auth_token')?.value;
  
  const token = tokenFromHeader || tokenFromCookies;
  
  // Detailed logging
  console.log('Token Detection:', {
    fromHeader: tokenFromHeader ? 'exists' : 'missing',
    fromCookies: tokenFromCookies ? 'exists' : 'missing',
    finalToken: token ? 'exists' : 'missing'
  });
  
  // Verify token if it exists
  let isValidToken = false;
  if (token) {
    isValidToken = verifyTokenEdge(token);
  }
  
  // If the path is protected and there's no valid token, redirect to login
  if (isProtectedRoute && !isValidToken) {
    console.log('Redirecting to login from middleware');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access login page but already authenticated, redirect to dashboard
  if ((path === '/login' || path === '/') && isValidToken) {
    console.log('Redirecting to dashboard from middleware');
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
