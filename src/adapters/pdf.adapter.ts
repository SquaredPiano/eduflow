// src/adapters/pdf.adapter.ts
const pdfParse = require('pdf-parse');

export class PDFAdapter {
  async extractText(fileUrl: string): Promise<string> {
    try {
      console.log(`Extracting text from PDF: ${fileUrl}`);
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Direct function call
      const data = await pdfParse(Buffer.from(buffer));
      
      const cleanedText = data.text
        .replace(/\n+/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`PDF extraction completed. Extracted ${cleanedText.length} characters`);
      return cleanedText;
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
