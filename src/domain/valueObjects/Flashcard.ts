export type FlashcardVO = {
  question: string
  answer: string
  hints?: string[]
}

export function createFlashcard(question: string, answer: string, hints?: string[]): FlashcardVO {
  if (!question || !answer) throw new Error('Flashcard requires question and answer')
  return { question: question.trim(), answer: answer.trim(), hints }
}

export default FlashcardVO
