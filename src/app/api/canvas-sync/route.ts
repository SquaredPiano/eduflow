import { NextResponse } from 'next/server'
import { CanvasAdapter } from '@/adapters/canvas.adapter'
import { SupabaseAdapter } from '@/adapters/supabase.adapter'
import { CanvasService } from '@/services/canvas.service'
import { logger } from '@/lib/logger'

const CANVAS_BASE_URL = process.env.CANVAS_BASE_URL || 'https://q.utoronto.ca'

export async function POST(req: Request) {
  try {
    // TODO: Get actual user from session once Auth0 is fully implemented
    const { canvasToken, userId } = await req.json()

    if (!canvasToken) {
      return NextResponse.json({ error: 'Canvas token required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Initialize services
    const canvasAdapter = new CanvasAdapter(CANVAS_BASE_URL)
    const repository = new SupabaseAdapter()
    const canvasService = new CanvasService(canvasAdapter, repository)

    // Verify and store token
    const isValid = await canvasService.verifyAndStoreToken(userId, canvasToken)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Canvas token' }, { status: 400 })
    }

    // Sync courses
    const result = await canvasService.syncCourses(userId, canvasToken)

    logger.info(`Canvas sync complete for user ${userId}`, result)

    return NextResponse.json({
      ok: true,
      coursesAdded: result.coursesAdded,
      filesAdded: result.filesAdded
    })
  } catch (error) {
    logger.error('Canvas sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Canvas sync failed' },
      { status: 500 }
    )
  }
}
