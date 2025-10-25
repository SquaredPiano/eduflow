import { NextResponse } from 'next/server'

// Whisper transcription (stub)
export async function POST(req: Request) {
  // TODO: accept a file reference and perform transcription
  return NextResponse.json({ ok: true, endpoint: 'transcribe' })
}
