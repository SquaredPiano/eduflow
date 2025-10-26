/**
 * Quiz Serializers - Convert quiz data to various formats
 * 
 * Purpose: Provides functions to serialize quiz questions into CSV and other formats
 */

import { Quiz, QuizQuestion, SerializerResult } from './types';

/**
 * Convert quiz to CSV format
 * Format: Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation
 */
export async function quizToCsv(
  quizData: Quiz | QuizQuestion[],
  title = 'quiz'
): Promise<SerializerResult> {
  // Normalize input to array of questions
  const questions: QuizQuestion[] = Array.isArray(quizData) ? quizData : quizData.questions;
  
  // CSV Header
  const csvLines = ['Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation'];
  
  // Add each question as a CSV row
  for (const q of questions) {
    const question = escapeCSV(q.question);
    const options = q.options.map(opt => escapeCSV(opt));
    
    // Pad options to 4 if less
    while (options.length < 4) {
      options.push('');
    }
    
    // Get correct answer (support both 'correct' and 'correctAnswer' fields)
    const correctIndex = q.correct ?? q.correctAnswer ?? 0;
    const correctAnswer = q.options[correctIndex] || '';
    const explanation = escapeCSV(q.explanation || '');
    
    csvLines.push(
      `${question},${options[0]},${options[1]},${options[2]},${options[3]},${escapeCSV(correctAnswer)},${explanation}`
    );
  }
  
  const csvContent = csvLines.join('\n');
  const buffer = Buffer.from(csvContent, 'utf-8');
  
  return {
    buffer,
    mimeType: 'text/csv',
    fileName: `${sanitizeFilename(title)}-quiz-${Date.now()}.csv`,
  };
}

/**
 * Convert quiz to formatted PDF
 */
export async function quizToPdf(
  quizData: Quiz | QuizQuestion[],
  title = 'quiz'
): Promise<SerializerResult> {
  // TODO: Re-implement with a Next.js compatible PDF library
  throw new Error('PDF export temporarily unavailable - use CSV instead');
  
  /* Disabled due to html-pdf-node compatibility issues
  // Dynamic import for server-side only dependencies
  const htmlPdf = await import('html-pdf-node').then(m => m.default || m);
  
  // Normalize input to array of questions
  const questions: QuizQuestion[] = Array.isArray(quizData) ? quizData : quizData.questions;
  
  // Convert quiz to HTML
  const html = quizToHTML(questions, title);
  
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
      fileName: `${sanitizeFilename(title)}-quiz-${Date.now()}.pdf`,
    };
  } catch (error) {
    throw new Error(`Failed to generate quiz PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
  */
}

/**
 * Convert quiz to answer key CSV
 * Format: Question Number,Correct Answer,Explanation
 */
export async function quizToAnswerKeyCsv(
  quizData: Quiz | QuizQuestion[],
  title = 'quiz'
): Promise<SerializerResult> {
  // Normalize input to array of questions
  const questions: QuizQuestion[] = Array.isArray(quizData) ? quizData : quizData.questions;
  
  // CSV Header
  const csvLines = ['Question Number,Correct Answer,Explanation'];
  
  // Add each answer as a CSV row
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const questionNumber = i + 1;
    
    // Get correct answer (support both 'correct' and 'correctAnswer' fields)
    const correctIndex = q.correct ?? q.correctAnswer ?? 0;
    const correctAnswer = q.options[correctIndex] || '';
    const explanation = escapeCSV(q.explanation || 'No explanation provided');
    
    csvLines.push(
      `${questionNumber},${escapeCSV(correctAnswer)},${explanation}`
    );
  }
  
  const csvContent = csvLines.join('\n');
  const buffer = Buffer.from(csvContent, 'utf-8');
  
  return {
    buffer,
    mimeType: 'text/csv',
    fileName: `${sanitizeFilename(title)}-answer-key-${Date.now()}.csv`,
  };
}

// ============= Helper Functions =============

/**
 * Convert quiz to HTML for PDF generation
 */
function quizToHTML(questions: QuizQuestion[], title: string): string {
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
      color: #2563EB;
      border-bottom: 3px solid #2563EB;
      padding-bottom: 10px;
      text-align: center;
    }
    .question {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .question-number {
      font-weight: bold;
      color: #2563EB;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .question-text {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 15px;
      color: #1F2937;
    }
    .options {
      list-style: none;
      padding: 0;
      margin-left: 20px;
    }
    .option {
      margin-bottom: 8px;
      padding: 10px;
      background-color: #F9FAFB;
      border-radius: 5px;
      border-left: 3px solid #E5E7EB;
    }
    .option.correct {
      background-color: #ECFDF5;
      border-left-color: #10B981;
    }
    .explanation {
      margin-top: 15px;
      padding: 12px;
      background-color: #EFF6FF;
      border-left: 4px solid #3B82F6;
      border-radius: 5px;
    }
    .explanation-label {
      font-weight: bold;
      color: #1E40AF;
      margin-bottom: 5px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #6B7280;
      font-size: 12px;
      border-top: 1px solid #E5E7EB;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <h1>${escapeHTML(title)}</h1>
  <p style="text-align: center; color: #6B7280; margin-bottom: 30px;">
    Total Questions: ${questions.length}
  </p>
`;
  
  // Add each question
  questions.forEach((q, index) => {
    const correctIndex = q.correct ?? q.correctAnswer ?? 0;
    
    html += `
  <div class="question">
    <div class="question-number">Question ${index + 1}</div>
    <div class="question-text">${escapeHTML(q.question)}</div>
    <ul class="options">
`;
    
    q.options.forEach((option, optIndex) => {
      const isCorrect = optIndex === correctIndex;
      const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
      html += `      <li class="option${isCorrect ? ' correct' : ''}">
        <strong>${optionLetter}.</strong> ${escapeHTML(option)}${isCorrect ? ' ✓' : ''}
      </li>\n`;
    });
    
    html += `    </ul>\n`;
    
    if (q.explanation) {
      html += `
    <div class="explanation">
      <div class="explanation-label">Explanation:</div>
      ${escapeHTML(q.explanation)}
    </div>
`;
    }
    
    html += `  </div>\n`;
  });
  
  html += `
  <div class="footer">
    Generated by EduFlow AI • ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Escape CSV special characters
 */
function escapeCSV(value: string): string {
  // If the value contains comma, quote, or newline, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape existing quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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
