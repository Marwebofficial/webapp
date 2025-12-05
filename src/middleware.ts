
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// The cookie name for the Firebase session
const FIREBASE_SESSION_COOKIE = '__session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session cookie
  const sessionCookie = request.cookies.get(FIREBASE_SESSION_COOKIE);
  const isAuthenticated = !!sessionCookie;

  // Pages that should redirect to '/account' if the user is authenticated
  const publicOnlyPages = ['/login', '/signup', '/'];
  
  // Pages that require authentication
  const protectedPages = ['/account', '/history', '/admin', '/buy-data', '/buy-airtime', '/tv-subscription', '/airtime-to-cash'];

  if (isAuthenticated) {
    // If the user is authenticated and tries to access a public-only page, redirect to their account.
    if (publicOnlyPages.includes(pathname)) {
       return NextResponse.redirect(new URL('/account', request.url));
    }
  } else {
    // If the user is not authenticated and tries to access a protected page, redirect to the login page.
    if (protectedPages.some(page => pathname.startsWith(page))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to proceed if no redirect is needed
  return NextResponse.next();
}

// Config to specify which paths the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - blog (allow public access to blog posts)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|blog|contact|payment-policy|privacy-policy|terms-of-service|sitemap.xml).*)',
  ],
}
