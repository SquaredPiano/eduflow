import { NextResponse } from 'next/server'

// Canvas LMS API integration (sync)
export async function POST(req: Request) {
  // TODO: push/pull data with Canvas
  return NextResponse.json({ ok: true, endpoint: 'canvas-sync' })
}
