import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // If not logged in, redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const userRole = token.role as string;

  // Role-based route protection
  if (pathname.startsWith('/database')) {
    // Only superadmin can access database
    if (userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/rekap')) {
    // Only adminverif and superadmin can access rekap
    if (userRole !== 'adminverif' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/absen')) {
    // All authenticated users can access absen
    // But redirect based on their primary role
    if (userRole === 'superadmin') {
      return NextResponse.redirect(new URL('/database', request.url));
    }
    if (userRole === 'adminverif') {
      return NextResponse.redirect(new URL('/rekap', request.url));
    }
  }

  if (pathname.startsWith('/verifikasi')) {
    // Only adminverif and superadmin can access verifikasi
    if (userRole !== 'adminverif' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/rekap-pegawai')) {
    // Only adminverif and superadmin can access rekap-pegawai
    if (userRole !== 'adminverif' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/database/:path*',
    '/rekap/:path*',
    '/absen/:path*',
    '/verifikasi/:path*',
    '/rekap-pegawai/:path*'
  ],
};
