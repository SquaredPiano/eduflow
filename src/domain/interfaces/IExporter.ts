/**
 * IExporter - Interface for content export functionality
 * 
 * Purpose: Defines contract for exporters that convert OutputEntity 
 * data into downloadable file formats
 * 
 * SOLID Principles:
 * - Interface Segregation: Focused interface for export operations
 * - Open/Closed: Extensible for new export formats without modification
 * - Dependency Inversion: High-level modules depend on this abstraction
 */

import { OutputEntity } from '../entities/OutputEntity'

export type ExportFormat = 'pdf' | 'anki' | 'csv' | 'pptx'

export interface IExporter {
  /**
   * Export an OutputEntity to a specific file format
   * 
   * @param output - The output entity to export
   * @returns Buffer containing the exported file data
   */
  export(output: OutputEntity): Promise<Buffer>

  /**
   * Get the MIME type for this export format
   * 
   * @returns MIME type string (e.g., 'application/pdf')
   */
  getMimeType(): string

  /**
   * Get the file extension for this export format
   * 
   * @returns File extension with dot (e.g., '.pdf')
   */
  getFileExtension(): string
}
