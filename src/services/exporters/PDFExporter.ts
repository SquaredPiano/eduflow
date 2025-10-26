/**
 * PDFExporter - Export notes to PDF format
 * 
 * Purpose: Converts markdown notes into formatted PDF documents
 * using jsPDF library
 */

import { jsPDF } from 'jspdf'
import { IExporter } from '@/domain/interfaces/IExporter'
import { OutputEntity } from '@/domain/entities/OutputEntity'

export class PDFExporter implements IExporter {
  getMimeType(): string {
    return 'application/pdf'
  }

  getFileExtension(): string {
    return '.pdf'
  }

  async export(output: OutputEntity): Promise<Buffer> {
    const doc = new jsPDF()
    
    // Set up document
    doc.setFont('helvetica')
    
    // Add title
    doc.setFontSize(20)
    doc.text('EduFlow Study Notes', 20, 20)
    
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)
    
    // Process content
    let content: string
    if (typeof output.content === 'string') {
      content = output.content
    } else {
      content = JSON.stringify(output.content, null, 2)
    }
    
    // Remove markdown formatting for better PDF rendering
    content = this.stripMarkdown(content)
    
    // Add content with text wrapping
    doc.setFontSize(12)
    const pageWidth = doc.internal.pageSize.getWidth()
    const margins = { left: 20, right: 20, top: 40 }
    const maxLineWidth = pageWidth - margins.left - margins.right
    
    const lines = doc.splitTextToSize(content, maxLineWidth)
    let y = 50
    
    for (const line of lines) {
      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        y = 20
      }
      
      doc.text(line, margins.left, y)
      y += 7
    }
    
    // Add footer
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    return pdfBuffer
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/`(.+?)`/g, '$1') // Remove code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/^[-*+]\s/gm, '• ') // Convert lists
  }
}
