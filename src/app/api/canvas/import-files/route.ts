import { NextRequest, NextResponse } from 'next/server';
import { createCanvasClient } from '@/lib/canvas.client';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/canvas/import-files
 * Import files from Canvas to a project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, canvasUrl, apiKey, fileIds } = body;

    if (!projectId || !canvasUrl || !apiKey || !fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json(
        { error: 'Project ID, Canvas URL, API key, and file IDs are required' },
        { status: 400 }
      );
    }

    const client = createCanvasClient(canvasUrl, apiKey);
    const importedFiles = [];

    // Download and import each file
    for (const fileId of fileIds) {
      try {
        // Get file metadata
        const fileMetadata = await client.getFile(fileId);
        
        // Download the file
        const fileBlob = await client.downloadFile(fileId);
        const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());

        // Create file record in database
        const file = await prisma.file.create({
          data: {
            name: fileMetadata.display_name || fileMetadata.filename,
            type: 'CANVAS_IMPORT',
            url: fileMetadata.url,
            key: `canvas-import-${fileId}-${Date.now()}`,
            size: fileMetadata.size,
            mimeType: fileMetadata['content-type'] || fileMetadata.content_type,
            projectId,
            userId: '', // This should be set from session
          },
        });

        importedFiles.push(file);
      } catch (error) {
        console.error(`Failed to import file ${fileId}:`, error);
        // Continue with other files
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedFiles.length,
      files: importedFiles,
    });
  } catch (error) {
    console.error('Canvas file import error:', error);
    return NextResponse.json(
      { error: 'Failed to import files' },
      { status: 500 }
    );
  }
}
