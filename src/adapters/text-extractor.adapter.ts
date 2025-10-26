/**
 * Text Extractor Adapter
 * 
 * Unified adapter that implements ITextExtractor and delegates to specific
 * file format adapters (PDF, DOCX, PPTX) based on the file type.
 * 
 * This provides a single interface for all text extraction operations,
 * making it easy to swap out implementations or add new file formats.
 */

import { ITextExtractor } from '@/domain/interfaces/ITextExtractor';
import { PDFAdapter } from './pdf.adapter';
import { DOCXAdapter } from './docx.adapter';
import { PPTXAdapter } from './pptx.adapters';

export class TextExtractorAdapter implements ITextExtractor {
  private pdfAdapter: PDFAdapter;
  private docxAdapter: DOCXAdapter;
  private pptxAdapter: PPTXAdapter;

  constructor() {
    this.pdfAdapter = new PDFAdapter();
    this.docxAdapter = new DOCXAdapter();
    this.pptxAdapter = new PPTXAdapter();
  }

  /**
   * Extract text from a PDF file
   * @param fileUrl - URL of the PDF file
   * @returns Extracted text content
   */
  async extractFromPDF(fileUrl: string): Promise<string> {
    return this.pdfAdapter.extractText(fileUrl);
  }

  /**
   * Extract text from a PowerPoint (PPTX) file
   * @param fileUrl - URL of the PPTX file
   * @returns Extracted text content
   */
  async extractFromPPTX(fileUrl: string): Promise<string> {
    return this.pptxAdapter.extractText(fileUrl);
  }

  /**
   * Extract text from a Word (DOCX) file
   * @param fileUrl - URL of the DOCX file
   * @returns Extracted text content
   */
  async extractFromDOCX(fileUrl: string): Promise<string> {
    return this.docxAdapter.extractText(fileUrl);
  }

  /**
   * Extract text from any supported file type based on MIME type
   * @param fileUrl - URL of the file
   * @param mimeType - MIME type of the file
   * @returns Extracted text content or null if unsupported
   */
  async extractText(fileUrl: string, mimeType: string): Promise<string | null> {
    switch (mimeType) {
      case 'application/pdf':
        return this.extractFromPDF(fileUrl);
      
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return this.extractFromPPTX(fileUrl);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractFromDOCX(fileUrl);
      
      case 'video/mp4':
      case 'audio/mpeg':
      case 'audio/mp3':
        // Video and audio files will be handled by transcription service (Phase 3)
        console.log(`File type ${mimeType} requires transcription - skipping text extraction`);
        return null;
      
      default:
        console.warn(`Unsupported file type for text extraction: ${mimeType}`);
        return null;
    }
  }
}
