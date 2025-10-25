import { NextResponse } from 'next/server'

// Gemini (notes, quiz, etc.)
export async function POST(req: Request) {
  // TODO: call model client to generate notes/quiz/flashcards, etc.
  return NextResponse.json({ ok: true, endpoint: 'generate' })
}
