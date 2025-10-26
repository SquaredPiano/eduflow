// src/app/auth/callback/route.ts
import { handleCallback } from '@auth0/nextjs-auth0'
import { NextRequest } from 'next/server'

export const GET = async (req: NextRequest) => {
  return handleCallback(req, {
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
  })
}