
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// The cookie name for the Firebase session
const FIREBASE_SESSION_COOKIE = '__session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session cookie
  const sessionCookie = request.cookies.get(FIREBASE_SESSION_COOKIE);
  const isAuthenticated = !!sessionCookie;

  // Define public pages (accessible to everyone)
  const publicPages = ['/login', '/signup', '/'];
  
  // Define pages that unauthenticated users should be redirected from
  const authenticatedPages = ['/account', '/history', '/admin', '/buy-data', '/buy-airtime', '/tv-subscription', '/airtime-to-cash'];

  // If user is authenticated
  if (isAuthenticated) {
    // If user is trying to access login, signup, or landing page, redirect to account
    if (publicPages.includes(pathname)) {
       return NextResponse.redirect(new URL('/account', request.url));
    }
  } 
  // If user is not authenticated
  else {
    // If user is trying to access a page that requires authentication, redirect to login
    if (authenticatedPages.some(page => pathname.startsWith(page))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

    