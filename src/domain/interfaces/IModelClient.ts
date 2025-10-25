/**
 * Lightweight model client abstraction.
 * Prefer a single `complete`/`call` method so implementations can adapt to many LLM providers.
 */
export interface IModelClient {
  complete(prompt: string, options?: Record<string, unknown>): Promise<string>
}

export default IModelClient
