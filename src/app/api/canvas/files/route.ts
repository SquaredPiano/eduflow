import { NextRequest, NextResponse } from 'next/server';
import { createCanvasClient } from '@/lib/canvas.client';

/**
 * POST /api/canvas/files
 * Fetch files from a Canvas course
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { canvasUrl, apiKey, courseId } = body;

    if (!canvasUrl || !apiKey || !courseId) {
      return NextResponse.json(
        { error: 'Canvas URL, API key, and course ID are required' },
        { status: 400 }
      );
    }

    const client = createCanvasClient(canvasUrl, apiKey);

    // Fetch files from the course
    const files = await client.getFiles(courseId);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Canvas files fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course files' },
      { status: 500 }
    );
  }
}
