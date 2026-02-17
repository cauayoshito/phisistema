import { NextResponse, NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/**
 * Global middleware to protect authenticated routes. Users who are not
 * signed in are redirected to the login page. Logged in users hitting
 * the login route are redirected to the dashboard. Role-based logic
 * could also be added here if required.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // If the user is not logged in and not already on the login page, redirect them
  if (!session && pathname !== '/login') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and tries to access the login page, redirect to dashboard
  if (session && pathname === '/login') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/app/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Apply middleware to all routes except for static assets and the Next.js internals
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};