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
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return res;
  }

  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isLoginRoute = pathname === '/login';

  // Protect only the dashboard area. Avoid intercepting Next internals/assets.
  if (!session && isDashboardRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Logged in users should not stay on the login page.
  if (session && isLoginRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Apply middleware to all routes except for static assets and the Next.js internals
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
