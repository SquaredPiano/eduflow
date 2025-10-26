/**
 * Serializer Types - Type definitions for content serialization
 * 
 * Purpose: Defines interfaces and types for converting AI-generated content
 * into various downloadable file formats
 */

// ============= Base Types =============

export interface SerializerResult {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

// ============= Content Types =============

export interface Flashcard {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  correctAnswer?: number; // Support both naming conventions
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface Slide {
  title: string;
  bullets?: string[];
  content?: string[];
  image?: string;
}

export interface Notes {
  content: string;
  markdown?: string;
}

// ============= Export Format Types =============

export type FlashcardFormat = 'csv' | 'anki-txt' | 'json';
export type NotesFormat = 'md' | 'docx' | 'pdf' | 'txt';
export type SlidesFormat = 'pptx' | 'pdf';
export type QuizFormat = 'csv' | 'json' | 'pdf';

export type SupportedFormat = FlashcardFormat | NotesFormat | SlidesFormat | QuizFormat;

// ============= Serializer Function Types =============

export type FlashcardSerializer = (
  flashcards: Flashcard[],
  title?: string
) => Promise<SerializerResult>;

export type NotesSerializer = (
  notes: string,
  title?: string
) => Promise<SerializerResult>;

export type SlidesSerializer = (
  slides: Slide[],
  title?: string
) => Promise<SerializerResult>;

export type QuizSerializer = (
  quiz: Quiz | QuizQuestion[],
  title?: string
) => Promise<SerializerResult>;
