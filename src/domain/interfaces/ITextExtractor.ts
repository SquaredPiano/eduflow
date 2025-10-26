/**
 * Interface for text extraction from various document formats
 * 
 * This interface defines the contract for extracting text content
 * from PDF, PowerPoint, and Word documents. Implementations should
 * handle file downloading, parsing, and text extraction.
 * 
 * @interface ITextExtractor
 */
export interface ITextExtractor {
    /**
     * Extract text content from a PDF file
     * @param fileUrl - Public URL of the PDF file
     * @returns Extracted text content as a string
     * @throws Error if extraction fails or file format is invalid
     */
    extractFromPDF(fileUrl: string): Promise<string>;
  
    /**
     * Extract text content from a PowerPoint (PPTX) file
     * @param fileUrl - Public URL of the PPTX file
     * @returns Extracted text content from all slides as a string
     * @throws Error if extraction fails or file format is invalid
     */
    extractFromPPTX(fileUrl: string): Promise<string>;
  
    /**
     * Extract text content from a Word (DOCX) file
     * @param fileUrl - Public URL of the DOCX file
     * @returns Extracted text content as a string
     * @throws Error if extraction fails or file format is invalid
     */
    extractFromDOCX(fileUrl: string): Promise<string>;
  }