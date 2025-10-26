/**
 * Auth0 API Routes
 * 
 * Uses Auth0Client middleware to handle all authentication routes
 * 
 * Supported routes (handled by Auth0 middleware):
 * - /api/auth/login - Initiates Auth0 login
 * - /api/auth/logout - Logs out the user
 * - /api/auth/callback - Handles Auth0 callback after login
 * - /api/auth/me - Returns current user info
 */

import { auth0 } from '@/lib/auth0'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return auth0.middleware(request)
}
