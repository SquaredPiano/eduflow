import { NextRequest, NextResponse } from 'next/server'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { getUserByAuth0Id } from './userSync'

const auth0 = new Auth0Client({
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '') || '',
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  appBaseUrl: process.env.AUTH0_BASE_URL!,
  secret: process.env.AUTH0_SECRET!,
});

/**
 * API Authentication Helpers
 * For use in API route handlers to verify authentication and get user
 */

/**
 * Get the authenticated user from an API request
 * Returns the database user record if authenticated, null otherwise
 * 
 * @param request - Next.js request object
 * @returns Database user or null
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get session from Auth0
    const session = await auth0.getSession()
    
    if (!session?.user?.sub) {
      return null
    }
    
    // Get user from database
    const user = await getUserByAuth0Id(session.user.sub)
    return user
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Require authentication for an API route
 * Returns unauthorized response if not authenticated
 * Otherwise returns the authenticated user
 * 
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuth(request)
 *   if (!user) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   }
 *   // ... rest of handler
 * }
 * ```
 * 
 * @param request - Next.js request object
 * @returns Database user or null if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    return null
  }
  
  return user
}

/**
 * Create an unauthorized response
 * @param message - Optional custom error message
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Wrapper for API route handlers that require authentication
 * Automatically handles auth checking and error responses
 * 
 * Usage:
 * ```typescript
 * export const GET = withAuth(async (request, user) => {
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ user })
 * })
 * ```
 * 
 * @param handler - API route handler function that receives (request, user)
 */
export function withAuth(
  handler: (request: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const user = await requireAuth(request)
    
    if (!user) {
      return unauthorizedResponse()
    }
    
    return handler(request, user)
  }
}
