// src/providers/AuthProvider.tsx
'use client'
import type { ReactNode } from 'react'
import { Auth0Provider } from '@auth0/nextjs-auth0/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <Auth0Provider>{children}</Auth0Provider>
}

export default AuthProvider