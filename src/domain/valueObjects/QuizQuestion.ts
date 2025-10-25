export type QuizQuestionVO = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export function createQuizQuestion(
  id: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation?: string
): QuizQuestionVO {
  if (!id) throw new Error('QuizQuestion requires id')
  if (!question) throw new Error('QuizQuestion requires question')
  if (!Array.isArray(options) || options.length < 2) throw new Error('QuizQuestion requires at least 2 options')
  if (correctIndex < 0 || correctIndex >= options.length) throw new Error('correctIndex out of range')
  return { id, question: question.trim(), options, correctIndex, explanation }
}

export default QuizQuestionVO
