import { withAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';
import { UserRole, AUTH_ROUTES } from '@multi-shop/shared';

export default withAuth(
  function middleware(req: NextRequest) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Allow access to public routes
    if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
      return;
    }

    // Redirect to login if no token
    if (!token) {
      const loginUrl = new URL(AUTH_ROUTES.LOGIN, req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return Response.redirect(loginUrl);
    }

    // Check if user is active
    if (!token.isActive) {
      const loginUrl = new URL(AUTH_ROUTES.LOGIN, req.url);
      loginUrl.searchParams.set('error', 'inactive');
      return Response.redirect(loginUrl);
    }

    // Admin route protection
    if (pathname.startsWith('/admin') && token.role !== UserRole.ADMIN) {
      return new Response('Forbidden', { status: 403 });
    }

    // Shop-specific route protection
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/trpc')) {
      // Users must have a shop assigned
      if (token.role === UserRole.USER && !token.shopId) {
        const loginUrl = new URL(AUTH_ROUTES.LOGIN, req.url);
        loginUrl.searchParams.set('error', 'no-shop');
        return Response.redirect(loginUrl);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages and API routes
        if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
};