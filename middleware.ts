import { NextRequest, NextResponse } from 'next/server';
import { getAdminCookieName, verifyAdminToken } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Login page must stay public
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAdminCookieName())?.value;
  const isLoggedIn = await verifyAdminToken(token);

  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
