import { NextRequest, NextResponse } from 'next/server';
import { validateCanvasCredentials } from '@/lib/canvas.client';

/**
 * POST /api/canvas/validate
 * Validate Canvas API credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseUrl, accessToken } = body;

    if (!baseUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Missing baseUrl or accessToken' },
        { status: 400 }
      );
    }

    const result = await validateCanvasCredentials(baseUrl, accessToken);

    if (result.valid) {
      return NextResponse.json({
        valid: true,
        user: result.user,
      });
    } else {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Canvas validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate Canvas credentials' },
      { status: 500 }
    );
  }
}
