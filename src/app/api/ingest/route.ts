import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { IngestService } from '@/services/ingest.service';
import { PrismaClient } from '@prisma/client';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/ingest
 * 
 * Handles file ingestion requests after files have been uploaded to storage.
 * This endpoint processes the uploaded file by extracting text content,
 * saving metadata to the database, and preparing it for AI processing.
 * 
 * Request Body:
 * {
 *   fileUrl: string;      // Public URL of the uploaded file
 *   fileName: string;     // Original filename
 *   fileType: string;     // MIME type (e.g., 'application/pdf')
 *   fileKey: string;      // UploadThing file key
 *   fileSize: number;     // File size in bytes
 *   courseId?: string;    // Optional course ID
 * }
 * 
 * Response:
 * Success (200):
 * {
 *   success: true,
 *   fileId: string,
 *   fileName: string,
 *   message: string
 * }
 * 
 * Error (4xx/5xx):
 * {
 *   error: string,
 *   details?: string
 * }
 */
export async function POST(req: Request) {
  let prisma: PrismaClient | null = null;

  try {
    // STEP 1: Verify authentication
    console.log('[Ingest API] Verifying authentication...');
    const session = await getSession();

    if (!session?.user) {
      console.warn('[Ingest API] Unauthorized request - no session');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to upload files' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    console.log(`[Ingest API] Authenticated user: ${userId}`);

    // STEP 2: Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[Ingest API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body - expected JSON' },
        { status: 400 }
      );
    }

    const { fileUrl, fileName, fileType, fileKey, fileSize, courseId } = body;

    // STEP 3: Validate required inputs
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: fileUrl' },
        { status: 400 }
      );
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: fileName' },
        { status: 400 }
      );
    }

    if (!fileType || typeof fileType !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: fileType' },
        { status: 400 }
      );
    }

    if (!fileKey || typeof fileKey !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: fileKey' },
        { status: 400 }
      );
    }

    if (!fileSize || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: fileSize' },
        { status: 400 }
      );
    }

    // Validate courseId if provided
    if (courseId !== undefined && typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid courseId - must be a string' },
        { status: 400 }
      );
    }

    console.log(`[Ingest API] Processing file: ${fileName} (${fileType})`);

    // STEP 4: Initialize dependencies (lazy import to avoid build-time issues)
    prisma = new PrismaClient();
    const { TextExtractorAdapter } = await import('@/adapters/text-extractor.adapter');
    const textExtractor = new TextExtractorAdapter();
    const ingestService = new IngestService(prisma, textExtractor);

    // STEP 5: Process the file through the ingestion pipeline
    const fileEntity = await ingestService.processFile(
      fileUrl,
      fileName,
      fileType,
      fileKey,
      fileSize,
      userId,
      courseId
    );

    // STEP 6: Clean up database connection
    await prisma.$disconnect();
    prisma = null;

    // STEP 7: Return success response
    console.log(`[Ingest API] File ingested successfully: ${fileEntity.id}`);
    return NextResponse.json(
      {
        success: true,
        fileId: fileEntity.id,
        fileName: fileEntity.name,
        fileType: fileEntity.mimeType,
        message: 'File ingested successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the full error for debugging
    console.error('[Ingest API] Error during file ingestion:', error);

    // Clean up database connection if still open
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('[Ingest API] Error disconnecting Prisma:', disconnectError);
      }
    }

    // Return user-friendly error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('Unsupported file type') ? 400 : 500;

    return NextResponse.json(
      {
        error: 'Failed to ingest file',
        details: errorMessage,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/ingest
 * 
 * Health check endpoint to verify the ingest service is available
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'ingest',
      message: 'Ingest service is running',
    },
    { status: 200 }
  );
}