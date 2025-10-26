// src/adapters/docx.adapter.ts
import mammoth from 'mammoth';

export class DOCXAdapter {
  async extractText(fileUrl: string): Promise<string> {
    try {
      console.log(`Extracting text from DOCX: ${fileUrl}`);
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch DOCX: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      const result = await mammoth.extractRawText({ 
        buffer: Buffer.from(buffer) 
      });
      
      // Log warnings if any
      if (result.messages.length > 0) {
        const warnings = result.messages.map(msg => `${msg.type}: ${msg.message}`);
        console.warn('DOCX extraction warnings:', warnings);
      }
      
      const cleanedText = result.value
        .replace(/\n+/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`DOCX extraction completed. Extracted ${cleanedText.length} characters`);
      return cleanedText;
      
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextWithStyles(fileUrl: string): Promise<{
    text: string;
    formatted: string;
    messages: string[];
  }> {
    try {
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      
      const result = await mammoth.convertToHtml({ 
        buffer: Buffer.from(buffer) 
      });
      
      // Convert message objects to string array using type inference
      const messageStrings = result.messages.map(msg => {
        // TypeScript will infer the structure automatically
        return `${msg.type}: ${msg.message}`;
      });

      return {
        text: result.value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
        formatted: result.value,
        messages: messageStrings
      };
    } catch (error) {
      console.error('DOCX extraction with styles error:', error);
      throw new Error(`Failed to extract styled text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}