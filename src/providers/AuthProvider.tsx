'use client'
import type { ReactNode } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'

export function AuthProvider({ children }: { children: ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''

  // Auth0Provider expects client-side values; this component is a client component.
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : undefined,
      }}
    >
      {children}
    </Auth0Provider>
  )
}

export default AuthProvider
