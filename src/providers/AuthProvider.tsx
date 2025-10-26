// src/providers/AuthProvider.tsx
'use client'
import type { ReactNode } from 'react'
import { UserProvider } from '@auth0/nextjs-auth0/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}

export default AuthProvider