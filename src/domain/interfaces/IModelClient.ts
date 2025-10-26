/**
 * IModelClient - Interface for AI model abstraction
 * 
 * Purpose: Defines contract for interacting with various AI model providers
 * (Gemini, OpenRouter, etc.) to enable dependency injection and testability
 */

export interface CompletionOptions {
  /**
   * Controls randomness in generation (0.0 = deterministic, 1.0 = creative)
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate
   */
  maxTokens?: number;

  /**
   * System-level instructions that guide the model's behavior
   */
  systemPrompt?: string;
}

export interface IModelClient {
  /**
   * Generate text completion from a prompt
   * 
   * @param prompt - The user prompt/content to process
   * @param options - Optional completion parameters
   * @returns Generated text response
   */
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
}

export default IModelClient;
