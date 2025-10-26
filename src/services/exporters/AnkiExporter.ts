/**
 * AnkiExporter - Export flashcards to Anki-compatible format
 * 
 * Purpose: Converts flashcard data into Anki's tab-separated text format
 * which can be imported into Anki desktop application
 * 
 * Note: Exports as .txt format that Anki can import directly
 * Format: front\tback (tab-separated)
 */

import { IExporter } from '@/domain/interfaces/IExporter'
import { OutputEntity } from '@/domain/entities/OutputEntity'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardContent {
  cards?: Flashcard[]
}

export class AnkiExporter implements IExporter {
  getMimeType(): string {
    return 'text/plain'
  }

  getFileExtension(): string {
    return '.txt'
  }

  async export(output: OutputEntity): Promise<Buffer> {
    // Parse flashcard content
    let flashcardData: FlashcardContent | Flashcard[]
    
    if (typeof output.content === 'string') {
      try {
        flashcardData = JSON.parse(output.content)
      } catch {
        throw new Error('Invalid flashcard content format')
      }
    } else {
      flashcardData = output.content as FlashcardContent | Flashcard[]
    }

    // Extract cards array
    let cards: Flashcard[]
    if (Array.isArray(flashcardData)) {
      cards = flashcardData
    } else if (flashcardData.cards && Array.isArray(flashcardData.cards)) {
      cards = flashcardData.cards
    } else {
      throw new Error('Flashcard content missing cards array')
    }

    if (cards.length === 0) {
      throw new Error('No flashcards to export')
    }

    // Create Anki-compatible format (tab-separated values)
    // Format: front\tback\ttags
    const ankiLines = cards.map(card => {
      // Clean up the content (remove tabs and newlines that would break format)
      const front = this.cleanText(card.front)
      const back = this.cleanText(card.back)
      const tags = 'eduflow generated'
      
      return `${front}\t${back}\t${tags}`
    })

    // Add header comment
    const header = '# EduFlow Flashcards - Import this file into Anki\n' +
                   '# Format: Front\\tBack\\tTags\n' +
                   '# To import: Anki → File → Import → Select this file\n' +
                   '#\n'

    const content = header + ankiLines.join('\n')
    
    return Buffer.from(content, 'utf-8')
  }

  private cleanText(text: string): string {
    return text
      .replace(/\t/g, ' ')      // Replace tabs with spaces
      .replace(/\r?\n/g, '<br>') // Convert newlines to HTML breaks (Anki supports HTML)
      .trim()
  }
}
