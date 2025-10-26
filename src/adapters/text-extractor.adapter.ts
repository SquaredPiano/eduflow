import { ITextExtractor } from '@/domain/interfaces/ITextExtractor';
import { PDFAdapter } from './pdf.adapter';
import { DOCXAdapter } from './docx.adapter';
import { PPTXAdapter } from './pptx.adapter';

/**
 * Unified text extractor adapter that delegates to specific file type adapters
 * 
 * This adapter implements the ITextExtractor interface and coordinates
 * text extraction across different document formats by delegating to
 * specialized adapters (PDF, DOCX, PPTX).
 * 
 * @class TextExtractorAdapter
 * @implements {ITextExtractor}
 */
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
   * @param fileUrl - Public URL of the PDF file
   * @returns Extracted text content
   */
  async extractFromPDF(fileUrl: string): Promise<string> {
    try {
      return await this.pdfAdapter.extractText(fileUrl);
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(
        `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract text from a PowerPoint (PPTX) file
   * @param fileUrl - Public URL of the PPTX file
   * @returns Extracted text content from all slides
   */
  async extractFromPPTX(fileUrl: string): Promise<string> {
    try {
      return await this.pptxAdapter.extractText(fileUrl);
    } catch (error) {
      console.error('PPTX extraction failed:', error);
      throw new Error(
        `Failed to extract text from PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract text from a Word (DOCX) file
   * @param fileUrl - Public URL of the DOCX file
   * @returns Extracted text content
   */
  async extractFromDOCX(fileUrl: string): Promise<string> {
    try {
      return await this.docxAdapter.extractText(fileUrl);
    } catch (error) {
      console.error('DOCX extraction failed:', error);
      throw new Error(
        `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}