import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Define protected routes
    const recruiterRoutes = ['/recruiter', '/recruiter/dashboard', '/recruiter/jobs'];
    const candidateRoutes = ['/candidate', '/candidate/dashboard', '/candidate/resume'];

    // Redirect to login if no token
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Check role-based access
    if (recruiterRoutes.some(route => path.startsWith(route))) {
      if (token.role !== 'recruiter') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    if (candidateRoutes.some(route => path.startsWith(route))) {
      if (token.role !== 'candidate') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/recruiter/:path*',
    '/candidate/:path*',
    '/dashboard/:path*',
  ],
};