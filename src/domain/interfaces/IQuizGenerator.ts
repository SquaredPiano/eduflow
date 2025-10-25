export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface IQuizGenerator {
  generateQuiz(input: { transcript: string }): Promise<{ questions: QuizQuestion[] }>
}

export default IQuizGenerator
