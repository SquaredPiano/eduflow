export interface IAgent {
  name: string
  respond(input: { messages: Array<{ role: 'user' | 'assistant'; content: string }> }): Promise<string>
}
