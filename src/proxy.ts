import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";
import { syncUserToDatabase } from "./lib/userSync";

export async function proxy(request: NextRequest) {
  // Let Auth0 handle its own routes first
  const response = await auth0.middleware(request);
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/example-uploader',
    '/api/generate',
    '/api/transcribe',
    '/api/export',
    '/api/ingest',
    '/api/canvas-sync'
  ];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Skip protection for auth routes and uploadthing
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/uploadthing')) {
    return response;
  }
  
  // For protected routes, check if user is authenticated and sync to database
  if (isProtectedRoute) {
    try {
      // Pass the request to getSession (middleware signature)
      const session = await auth0.getSession(request);
      
      // If no session and trying to access protected route, redirect to login
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
      }
      
      // Sync authenticated user to database (creates if doesn't exist)
      // This ensures every authenticated user has a database record
      await syncUserToDatabase(session);
      
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
