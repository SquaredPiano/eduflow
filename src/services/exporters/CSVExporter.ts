/**
 * CSVExporter - Export quiz questions to CSV format
 * 
 * Purpose: Converts quiz data into spreadsheet-compatible CSV format
 * for analysis, printing, or import into other systems
 */

import Papa from 'papaparse'
import { IExporter } from '@/domain/interfaces/IExporter'
import { OutputEntity } from '@/domain/entities/OutputEntity'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  correctAnswer?: string
  explanation?: string
}

interface QuizContent {
  questions: QuizQuestion[]
}

export class CSVExporter implements IExporter {
  getMimeType(): string {
    return 'text/csv'
  }

  getFileExtension(): string {
    return '.csv'
  }

  async export(output: OutputEntity): Promise<Buffer> {
    // Parse quiz content
    let quizData: QuizContent
    
    if (typeof output.content === 'string') {
      try {
        quizData = JSON.parse(output.content)
      } catch {
        throw new Error('Invalid quiz content format')
      }
    } else {
      quizData = output.content as QuizContent
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Quiz content missing questions array')
    }

    // Convert to CSV-friendly format
    const csvData = quizData.questions.map((q, index) => {
      const correctAnswer = q.correctAnswer || (q.options ? q.options[q.correct] : 'N/A')
      
      return {
        'Question #': index + 1,
        'Question': q.question,
        'Option A': q.options?.[0] || '',
        'Option B': q.options?.[1] || '',
        'Option C': q.options?.[2] || '',
        'Option D': q.options?.[3] || '',
        'Correct Answer': correctAnswer,
        'Explanation': q.explanation || ''
      }
    })

    // Convert to CSV string
    const csv = Papa.unparse(csvData, {
      quotes: true,
      header: true,
      newline: '\r\n'
    })

    return Buffer.from(csv, 'utf-8')
  }
}
