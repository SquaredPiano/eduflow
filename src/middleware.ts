import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";
<<<<<<< HEAD
import { syncUserToDatabase } from "./lib/userSync";
=======
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6

export async function middleware(request: NextRequest) {
  // Let Auth0 handle its own routes first
  const response = await auth0.middleware(request);
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes that require authentication
<<<<<<< HEAD
  const protectedRoutes = [
    '/dashboard',
    '/example-uploader',
    '/api/generate',
    '/api/transcribe',
    '/api/export',
    '/api/ingest',
    '/api/canvas-sync'
  ];
=======
  const protectedRoutes = ['/dashboard', '/api/generate', '/api/transcribe', '/api/export', '/api/ingest', '/api/canvas-sync'];
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Skip protection for auth routes and uploadthing
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/uploadthing')) {
    return response;
  }
  
<<<<<<< HEAD
  // For protected routes, check if user is authenticated and sync to database
=======
  // For protected routes, check if user is authenticated
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6
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
<<<<<<< HEAD
      
      // Sync authenticated user to database (creates if doesn't exist)
      // This ensures every authenticated user has a database record
      await syncUserToDatabase(session);
      
=======
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6
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
