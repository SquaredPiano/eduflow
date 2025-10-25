import { NextResponse } from 'next/server'

// Handles uploads & preprocessing
export async function POST(req: Request) {
  // TODO: parse multipart/form-data, store file, enqueue preprocessing
  return NextResponse.json({ ok: true, endpoint: 'ingest' })
}
