import { NextResponse } from 'next/server'

// Auth0 callback endpoint (stub)
export async function GET() {
  // TODO: exchange code for tokens and set cookies/session
  return NextResponse.json({ ok: true, endpoint: 'auth/callback' })
}
