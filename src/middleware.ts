import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth/auth'; 

export async function middleware(request: NextRequest) {
  // const session = await auth();

  // const { pathname } = request.nextUrl;

  // // Define protected routes
  // const protectedRoutes = ['/profile', '/settings'];

  // // Redirect unauthenticated users from protected routes to /auth
  // if (protectedRoutes.some((route) => pathname.startsWith(route))) {
  //   if (!session) {
  //     return NextResponse.redirect(new URL('/auth', request.url));
  //   }
  // }

  // // Redirect authenticated users away from /auth
  // if (pathname === '/auth' && session) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  return NextResponse.next();
}