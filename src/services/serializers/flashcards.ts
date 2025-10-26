/**
 * Flashcard Serializers - Convert flashcards to various formats
 * 
 * Purpose: Provides functions to serialize flashcard data into CSV, Anki, and other formats
 */

import { Flashcard, SerializerResult } from './types';

/**
 * Convert flashcards to CSV format
 * Format: Front,Back,Difficulty
 */
export async function flashcardsToCsv(
  flashcards: Flashcard[],
  title = 'flashcards'
): Promise<SerializerResult> {
  // CSV Header
  const csvLines = ['Front,Back,Difficulty'];
  
  // Add each flashcard as a CSV row
  for (const card of flashcards) {
    const front = escapeCSV(card.front);
    const back = escapeCSV(card.back);
    const difficulty = card.difficulty || 'medium';
    csvLines.push(`${front},${back},${difficulty}`);
  }
  
  const csvContent = csvLines.join('\n');
  const buffer = Buffer.from(csvContent, 'utf-8');
  
  return {
    buffer,
    mimeType: 'text/csv',
    fileName: `${sanitizeFilename(title)}-flashcards-${Date.now()}.csv`,
  };
}

/**
 * Convert flashcards to Anki text format (tab-separated)
 * Format: Front\tBack\tTags
 */
export async function flashcardsToAnkiTxt(
  flashcards: Flashcard[],
  title = 'flashcards'
): Promise<SerializerResult> {
  const ankiLines: string[] = [];
  
  for (const card of flashcards) {
    // Anki format uses tabs to separate fields
    // Replace any existing tabs with spaces to avoid breaking the format
    const front = card.front.replace(/\t/g, ' ').trim();
    const back = card.back.replace(/\t/g, ' ').trim();
    const tags = card.difficulty ? card.difficulty : '';
    
    ankiLines.push(`${front}\t${back}\t${tags}`);
  }
  
  const ankiContent = ankiLines.join('\n');
  const buffer = Buffer.from(ankiContent, 'utf-8');
  
  return {
    buffer,
    mimeType: 'text/plain',
    fileName: `${sanitizeFilename(title)}-anki-${Date.now()}.txt`,
  };
}

/**
 * Convert flashcards to enhanced Anki format with metadata
 */
export async function flashcardsToEnhancedAnki(
  flashcards: Flashcard[],
  title = 'flashcards'
): Promise<SerializerResult> {
  const lines: string[] = [
    '# Anki Flashcard Import',
    `# Deck: ${title}`,
    `# Created: ${new Date().toISOString()}`,
    `# Total Cards: ${flashcards.length}`,
    '#',
    '# Import Instructions:',
    '# 1. Open Anki',
    '# 2. File → Import',
    '# 3. Select this file',
    '# 4. Set "Fields separated by: Tab"',
    '# 5. Set "Allow HTML in fields"',
    '#',
    '',
  ];
  
  for (const card of flashcards) {
    const front = card.front.replace(/\t/g, ' ').trim();
    const back = card.back.replace(/\t/g, ' ').trim();
    const difficulty = card.difficulty || 'medium';
    
    lines.push(`${front}\t${back}\t${difficulty}`);
  }
  
  const content = lines.join('\n');
  const buffer = Buffer.from(content, 'utf-8');
  
  return {
    buffer,
    mimeType: 'text/plain',
    fileName: `${sanitizeFilename(title)}-anki-enhanced-${Date.now()}.txt`,
  };
}

// ============= Helper Functions =============

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
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}
