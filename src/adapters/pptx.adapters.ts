// src/adapters/pptx.adapter.ts
import JSZip from 'jszip';

export class PPTXAdapter {
  async extractText(fileUrl: string): Promise<string> {
    try {
      console.log(`Extracting text from PPTX: ${fileUrl}`);
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PPTX: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      
      const textContent: string[] = [];
      
      // PPTX files store slides in ppt/slides/slide*.xml
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      ).sort((a, b) => {
        // Sort slides by number
        const aNum = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
        const bNum = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
        return aNum - bNum;
      });
      
      for (const slideFile of slideFiles) {
        const slideContent = await zip.file(slideFile)?.async('text');
        if (slideContent) {
          const slideText = this.extractTextFromSlideXml(slideContent);
          if (slideText.trim()) {
            const slideNum = slideFile.match(/slide(\d+)\.xml/)?.[1] || 'unknown';
            textContent.push(`--- Slide ${slideNum} ---`);
            textContent.push(slideText);
          }
        }
      }
      
      const extractedText = textContent.join('\n');
      console.log(`PPTX extraction completed. Extracted ${extractedText.length} characters from ${slideFiles.length} slides`);
      return extractedText;
      
    } catch (error) {
      console.error('PPTX extraction error:', error);
      throw new Error(`Failed to extract text from PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextWithStyles(fileUrl: string): Promise<{
    text: string;
    formatted: string;
    messages: string[];
  }> {
    try {
      const text = await this.extractText(fileUrl);
      
      return {
        text: text,
        formatted: this.formatAsHtml(text),
        messages: [] // No messages from simple extraction
      };
    } catch (error) {
      console.error('PPTX extraction with styles error:', error);
      throw new Error(`Failed to extract styled text from PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTextFromSlideXml(xmlContent: string): string {
    // Extract text from XML by removing tags and cleaning up
    return xmlContent
      .replace(/<[^>]*>/g, ' ') // Replace tags with spaces
      .replace(/&[^;]+;/g, ' ') // Replace XML entities
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim();
  }

  private formatAsHtml(text: string): string {
    // Simple formatting for presentation
    const lines = text.split('\n');
    const htmlLines: string[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('--- Slide')) {
        const slideNum = line.match(/Slide (\d+)/)?.[1] || 'unknown';
        htmlLines.push(`<div class="slide"><h2>Slide ${slideNum}</h2>`);
      } else if (line.trim()) {
        htmlLines.push(`<p>${line.trim()}</p>`);
      } else {
        htmlLines.push('</div>');
      }
    });
    
    return htmlLines.join('\n');
  }
}
