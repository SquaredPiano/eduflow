/**
 * /api/export - Export endpoint
 * 
 * Purpose: Handles requests to export generated content in various formats
 * (PDF, Anki, CSV, PPTX)
 * 
 * Routes:
 * - POST /api/export - Export an output to a specific format
 */

import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/services/export.service'
import { ExportFormat } from '@/domain/interfaces/IExporter'
import { logger } from '@/lib/logger'

/**
 * POST /api/export
 * 
 * Body:
 * {
 *   outputId: string;    // The output ID to export
 *   format: ExportFormat; // Export format (pdf, anki, csv, pptx)
 * }
 * 
 * Returns: Binary file download
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { outputId, format } = body

    // Validate required fields
    if (!outputId) {
      return NextResponse.json(
        { error: 'outputId is required' },
        { status: 400 }
      )
    }

    if (!format) {
      return NextResponse.json(
        { error: 'format is required' },
        { status: 400 }
      )
    }

    // Validate format
    const validFormats: ExportFormat[] = ['pdf', 'anki', 'csv', 'pptx']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      )
    }

    // Initialize export service
    const exportService = new ExportService()

    // Perform export
    const { buffer, mimeType, filename } = await exportService.export(
      outputId,
      format as ExportFormat
    )

    logger.info(`Exported ${outputId} as ${format}: ${filename}`)

    // Return file as download
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    logger.error('Export error:', error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Export failed',
      },
      { status: 500 }
    )
  }
}
