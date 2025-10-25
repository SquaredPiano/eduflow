import { NextResponse } from 'next/server'

// Generate & serve exports (PDF/PPTX)
export async function POST(req: Request) {
  // TODO: generate export and return a job id or download url
  return NextResponse.json({ ok: true, endpoint: 'export' })
}
