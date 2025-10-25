export type Flashcard = { question: string; answer: string; hints?: string[] }

export interface IFlashcardGenerator {
  generateFlashcards(input: { transcript: string }): Promise<{ flashcards: Flashcard[] }>
}

export default IFlashcardGenerator
