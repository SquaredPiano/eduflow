/**
 * ExportService - Orchestrates export operations for different formats
 * 
 * Purpose: Manages exporter selection and execution for converting
 * OutputEntity data into downloadable files
 * 
 * SOLID Principles:
 * - Single Responsibility: Coordinates export operations
 * - Open/Closed: Extensible for new exporters via map
 * - Dependency Inversion: Depends on IExporter abstraction
 */

import { IExporter, ExportFormat } from '@/domain/interfaces/IExporter'
import { OutputEntity, OutputKind } from '@/domain/entities/OutputEntity'
import { PDFExporter } from './exporters/PDFExporter'
import { AnkiExporter } from './exporters/AnkiExporter'
import { CSVExporter } from './exporters/CSVExporter'
import { PPTXExporter } from './exporters/PPTXExporter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ExportService {
  private exporters: Map<ExportFormat, IExporter>

  constructor() {
    this.exporters = new Map<ExportFormat, IExporter>([
      ['pdf', new PDFExporter()],
      ['anki', new AnkiExporter()],
      ['csv', new CSVExporter()],
      ['pptx', new PPTXExporter()],
    ])
  }

  /**
   * Export an output to a specific format
   * 
   * @param outputId - The output ID to export
   * @param format - The export format (pdf, anki, csv, pptx)
   * @returns Object containing buffer, MIME type, and filename
   */
  async export(
    outputId: string,
    format: ExportFormat
  ): Promise<{
    buffer: Buffer
    mimeType: string
    filename: string
  }> {
    // Get the output from database
    const outputRecord = await prisma.output.findUnique({
      where: { id: outputId },
    })

    if (!outputRecord) {
      throw new Error(`Output not found: ${outputId}`)
    }

    // Create OutputEntity
    const output = new OutputEntity(
      outputRecord.id,
      outputRecord.type as OutputKind,
      outputRecord.content,
      outputRecord.transcriptId || undefined
    )

    // Get the appropriate exporter
    const exporter = this.exporters.get(format)

    if (!exporter) {
      throw new Error(`Unsupported export format: ${format}`)
    }

    // Validate format compatibility with content type
    this.validateFormatCompatibility(output.kind, format)

    // Perform export
    try {
      const buffer = await exporter.export(output)

      const filename = `eduflow-${output.kind}-${Date.now()}${exporter.getFileExtension()}`

      return {
        buffer,
        mimeType: exporter.getMimeType(),
        filename,
      }
    } catch (error) {
      throw new Error(
        `Export failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Get available export formats for a content type
   * 
   * @param contentType - The output content type (notes, flashcards, quiz, slides)
   * @returns Array of compatible export formats
   */
  getAvailableFormats(contentType: string): ExportFormat[] {
    const formatMap: Record<string, ExportFormat[]> = {
      notes: ['pdf'],
      flashcards: ['anki', 'pdf'],
      quiz: ['csv', 'pdf'],
      slides: ['pptx', 'pdf'],
    }

    return formatMap[contentType] || []
  }

  /**
   * Validate that the export format is compatible with content type
   */
  private validateFormatCompatibility(contentType: string, format: ExportFormat): void {
    const availableFormats = this.getAvailableFormats(contentType)
    
    if (!availableFormats.includes(format)) {
      throw new Error(
        `Format '${format}' is not compatible with content type '${contentType}'. ` +
        `Available formats: ${availableFormats.join(', ')}`
      )
    }
  }
}

// Legacy export function for backward compatibility
export async function exportContent(_input: { kind: 'pdf' | 'pptx'; content: unknown }): Promise<{ url: string }> {
  return { url: '/api/export/download/example' }
}
