export interface IModelClient {
  generateNotes(input: { transcript: string }): Promise<{ notes: string }>
  generateQuiz(input: { transcript: string }): Promise<{ questions: string[] }>
  chat?(input: { messages: Array<{ role: 'user' | 'assistant'; content: string }> }): Promise<{ reply: string }>
}
