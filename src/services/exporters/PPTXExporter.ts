/**
 * PPTXExporter - Export slides to PowerPoint format
 * 
 * Purpose: Converts slide data into PPTX presentation files
 * using pptxgenjs library
 */

import PptxGenJS from 'pptxgenjs'
import { IExporter } from '@/domain/interfaces/IExporter'
import { OutputEntity } from '@/domain/entities/OutputEntity'

interface Slide {
  title: string
  content?: string[]
  bullets?: string[]
}

interface SlidesContent {
  slides?: Slide[]
}

export class PPTXExporter implements IExporter {
  getMimeType(): string {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }

  getFileExtension(): string {
    return '.pptx'
  }

  async export(output: OutputEntity): Promise<Buffer> {
    // Parse slides content
    let slidesData: SlidesContent | Slide[]
    
    if (typeof output.content === 'string') {
      try {
        slidesData = JSON.parse(output.content)
      } catch {
        throw new Error('Invalid slides content format')
      }
    } else {
      slidesData = output.content as SlidesContent | Slide[]
    }

    // Extract slides array
    let slides: Slide[]
    if (Array.isArray(slidesData)) {
      slides = slidesData
    } else if (slidesData.slides && Array.isArray(slidesData.slides)) {
      slides = slidesData.slides
    } else {
      throw new Error('Slides content missing slides array')
    }

    // Create presentation
    const pptx = new PptxGenJS()
    
    // Set presentation properties
    pptx.author = 'EduFlow'
    pptx.company = 'EduFlow Study Platform'
    pptx.subject = 'AI-Generated Study Materials'
    pptx.title = 'EduFlow Presentation'

    // Add title slide
    const titleSlide = pptx.addSlide()
    titleSlide.background = { color: '1976D2' }
    
    titleSlide.addText('EduFlow Study Materials', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    })
    
    titleSlide.addText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      align: 'center'
    })

    // Add content slides
    for (const slideData of slides) {
      const slide = pptx.addSlide()
      
      // Add title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.75,
        fontSize: 32,
        bold: true,
        color: '1976D2'
      })

      // Add content bullets
      const bullets = slideData.bullets || slideData.content || []
      
      if (bullets.length > 0) {
        slide.addText(
          bullets.map(bullet => ({
            text: bullet,
            options: {
              bullet: { code: '2022' },
              breakLine: true
            }
          })),
          {
            x: 0.5,
            y: 1.5,
            w: 9,
            h: 4,
            fontSize: 18,
            color: '333333',
            valign: 'top'
          }
        )
      }
    }

    // Generate PPTX and return as buffer
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
    return pptxBuffer
  }
}
