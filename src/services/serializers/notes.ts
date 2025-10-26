/**
 * Notes Serializers - Convert markdown notes to various formats
 * 
 * Purpose: Provides functions to serialize notes into DOCX, PDF, and other formats
 */

import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { SerializerResult } from './types';

/**
 * Convert markdown notes to DOCX format
 */
export async function notesToDocx(
  markdown: string,
  title = 'notes'
): Promise<SerializerResult> {
  // Parse markdown into paragraphs
  const paragraphs: Paragraph[] = [];
  
  // Add document title
  paragraphs.push(
    new Paragraph({
      text: title.replace(/_/g, ' ').toUpperCase(),
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  // Split markdown by lines
  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle headings
    if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace('### ', ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    }
    // Handle bullet points
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          text: line.trim().replace(/^[-*]\s+/, ''),
          bullet: { level: 0 },
          spacing: { before: 50, after: 50 },
        })
      );
    }
    // Handle numbered lists
    else if (line.trim().match(/^\d+\.\s/)) {
      paragraphs.push(
        new Paragraph({
          text: line.trim().replace(/^\d+\.\s+/, ''),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { before: 50, after: 50 },
        })
      );
    }
    // Handle bold and italic text
    else if (line.trim().length > 0) {
      const textRuns = parseInlineFormatting(line);
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          spacing: { before: 100, after: 100 },
        })
      );
    }
    // Handle empty lines
    else {
      paragraphs.push(new Paragraph({ text: '' }));
    }
  }
  
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
  });
  
  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  
  return {
    buffer: Buffer.from(buffer),
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileName: `${sanitizeFilename(title)}-notes-${Date.now()}.docx`,
  };
}

/**
 * Convert markdown notes to PDF format
 * Note: This creates an HTML intermediary and converts to PDF
 */
export async function notesToPdf(
  markdown: string,
  title = 'notes'
): Promise<SerializerResult> {
  const htmlPdf = require('html-pdf-node');
  
  // Convert markdown to HTML
  const html = markdownToHTML(markdown, title);
  
  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
  };
  
  const file = { content: html };
  
  try {
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    return {
      buffer: pdfBuffer,
      mimeType: 'application/pdf',
      fileName: `${sanitizeFilename(title)}-notes-${Date.now()}.pdf`,
    };
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============= Helper Functions =============

/**
 * Parse inline formatting (bold, italic) into TextRuns
 */
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentText = '';
  let isBold = false;
  let isItalic = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    // Handle **bold**
    if (char === '*' && nextChar === '*') {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
        currentText = '';
      }
      isBold = !isBold;
      i++; // Skip next asterisk
    }
    // Handle *italic*
    else if (char === '*') {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
        currentText = '';
      }
      isItalic = !isItalic;
    }
    // Handle `code`
    else if (char === '`') {
      if (currentText) {
        runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
        currentText = '';
      }
      // Find closing backtick
      const endIndex = text.indexOf('`', i + 1);
      if (endIndex !== -1) {
        const codeText = text.substring(i + 1, endIndex);
        runs.push(new TextRun({ text: codeText, font: 'Courier New', shading: { fill: 'E5E5E5' } }));
        i = endIndex;
      }
    } else {
      currentText += char;
    }
  }
  
  if (currentText) {
    runs.push(new TextRun({ text: currentText, bold: isBold, italics: isItalic }));
  }
  
  return runs.length > 0 ? runs : [new TextRun({ text })];
}

/**
 * Convert markdown to HTML for PDF generation
 */
function markdownToHTML(markdown: string, title: string): string {
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h2 {
      color: #34495e;
      border-bottom: 2px solid #95a5a6;
      padding-bottom: 8px;
      margin-top: 25px;
    }
    h3 {
      color: #555;
      margin-top: 20px;
    }
    ul, ol {
      margin-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    strong {
      color: #2c3e50;
    }
    p {
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <h1>${escapeHTML(title)}</h1>
`;
  
  // Simple markdown to HTML conversion
  const lines = markdown.split('\n');
  let inList = false;
  let inOrderedList = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Handle headings
    if (trimmed.startsWith('### ')) {
      html += `  <h3>${escapeHTML(trimmed.replace('### ', ''))}</h3>\n`;
    } else if (trimmed.startsWith('## ')) {
      html += `  <h2>${escapeHTML(trimmed.replace('## ', ''))}</h2>\n`;
    } else if (trimmed.startsWith('# ')) {
      html += `  <h1>${escapeHTML(trimmed.replace('# ', ''))}</h1>\n`;
    }
    // Handle bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        html += '  <ul>\n';
        inList = true;
      }
      html += `    <li>${formatInlineHTML(trimmed.replace(/^[-*]\s+/, ''))}</li>\n`;
    }
    // Handle numbered lists
    else if (trimmed.match(/^\d+\.\s/)) {
      if (!inOrderedList) {
        html += '  <ol>\n';
        inOrderedList = true;
      }
      html += `    <li>${formatInlineHTML(trimmed.replace(/^\d+\.\s+/, ''))}</li>\n`;
    }
    // Regular paragraph
    else if (trimmed.length > 0) {
      if (inList) {
        html += '  </ul>\n';
        inList = false;
      }
      if (inOrderedList) {
        html += '  </ol>\n';
        inOrderedList = false;
      }
      html += `  <p>${formatInlineHTML(trimmed)}</p>\n`;
    }
    // Empty line
    else {
      if (inList) {
        html += '  </ul>\n';
        inList = false;
      }
      if (inOrderedList) {
        html += '  </ol>\n';
        inOrderedList = false;
      }
    }
  }
  
  // Close any remaining lists
  if (inList) html += '  </ul>\n';
  if (inOrderedList) html += '  </ol>\n';
  
  html += `
</body>
</html>`;
  
  return html;
}

/**
 * Format inline markdown elements (bold, italic, code)
 */
function formatInlineHTML(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.+?)`/g, '<code>$1</code>') // Code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}
