/**
 * /api/files/[fileId]/transcript - Get transcript for a file
 * 
 * Purpose: Retrieves the transcript associated with a file
 * Required for proper generation flow (fileId → transcriptId → generate)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * GET /api/files/[fileId]/transcript
 * 
 * Returns the most recent transcript for the specified file
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Get the most recent transcript for this file
    const transcript = await prisma.transcript.findFirst({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        fileId: true,
        createdAt: true,
      },
    });

    if (!transcript) {
      return NextResponse.json(
        {
          error: 'No transcript found for this file',
          message: 'This file may not have been processed yet. Please wait for text extraction or transcription to complete.',
        },
        { status: 404 }
      );
    }

    logger.info(`Retrieved transcript ${transcript.id} for file ${fileId}`);

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    logger.error('Error retrieving transcript:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve transcript',
      },
      { status: 500 }
    );
  }
}
