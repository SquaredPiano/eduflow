'use client'

import { useUser } from '@auth0/nextjs-auth0/client'

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'
export interface AuthUser { 
  id: string
  name?: string | null
  email?: string | null
  picture?: string | null
}

/**
 * Custom auth hook that wraps Auth0's useUser hook
 * Provides a consistent interface for authentication state
 */
export function useAuth() {
  const { user: auth0User, error, isLoading } = useUser()
  
  // Determine status based on loading and user state
  const status: AuthStatus = isLoading 
    ? 'loading' 
    : auth0User 
      ? 'authenticated' 
      : 'unauthenticated'
  
  const isAuthenticated = !!auth0User && !isLoading
  
  // Map Auth0 user to our AuthUser interface
  const user: AuthUser | null = auth0User ? {
    id: auth0User.sub || '',
    name: auth0User.name || null,
    email: auth0User.email || null,
    picture: auth0User.picture || null,
  } : null
  
  return { 
    user, 
    status, 
    isAuthenticated,
    error,
    isLoading 
  }
}

export default useAuth
