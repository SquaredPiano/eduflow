/**
 * IAgent - Interface for AI agent implementations
 * 
 * Purpose: Defines contract for specialized agents that process transcripts
 * and generate specific types of educational content (notes, flashcards, etc.)
 */

export interface IAgent {
  /**
   * Human-readable name of the agent
   */
  name: string;

  /**
   * Process input data and generate output
   * 
   * @param input - Input data containing transcript and optional metadata
   * @returns Generated content as string (may be JSON for structured outputs)
   */
  process(input: { transcript: string; [key: string]: any }): Promise<string>;
}
