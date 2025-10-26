/**
 * Text Extractor Interface
 * 
 * Defines the contract for extracting text from various document formats.
 * Implementations should handle file downloading, parsing, and text extraction
 * while maintaining consistent error handling and logging.
 */

export interface ITextExtractor {
  /**
   * Extract plain text from a PDF file
   * @param fileUrl - URL of the PDF file to extract text from
   * @returns Extracted text content
   * @throws Error if extraction fails
   */
  extractFromPDF(fileUrl: string): Promise<string>;

  /**
   * Extract plain text from a PowerPoint (PPTX) file
   * @param fileUrl - URL of the PPTX file to extract text from
   * @returns Extracted text content
   * @throws Error if extraction fails
   */
  extractFromPPTX(fileUrl: string): Promise<string>;

  /**
   * Extract plain text from a Word (DOCX) file
   * @param fileUrl - URL of the DOCX file to extract text from
   * @returns Extracted text content
   * @throws Error if extraction fails
   */
  extractFromDOCX(fileUrl: string): Promise<string>;
}
