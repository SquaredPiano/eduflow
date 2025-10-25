'use client'

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'
export interface AuthUser { id: string; name?: string | null; email?: string | null }

export function useAuth() {
  // TODO: Wire to Auth0
  const user: AuthUser | null = null
  const status: AuthStatus = 'unauthenticated'
  // Avoid constant comparison in stub; wire real auth state later
  const isAuthenticated = false
  return { user, status, isAuthenticated }
}

export default useAuth
