/**
 * FlashcardAgent - Generates flashcard decks from transcripts
 * 
 * Purpose: Creates spaced-repetition flashcards that test understanding
 * and facilitate active recall
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles flashcard generation
 * - Open/Closed: Extends IAgent interface without modification
 * - Dependency Inversion: Depends on IModelClient abstraction
 */

import { IAgent } from "@/domain/interfaces/IAgent";
import { IModelClient } from "@/domain/interfaces/IModelClient";
import { AGENT_PROMPTS } from "@/domain/types/prompts";

export class FlashcardAgent implements IAgent {
  name = "Flashcard Agent";

  constructor(private modelClient: IModelClient) {}

  async process(input: { transcript: string }): Promise<string> {
    if (!input.transcript || input.transcript.trim().length === 0) {
      throw new Error("Transcript is required for flashcard generation");
    }

    const prompt = AGENT_PROMPTS.flashcards.template(input.transcript);

    try {
      const flashcards = await this.modelClient.complete(prompt, {
        systemPrompt: AGENT_PROMPTS.flashcards.system,
        temperature: 0.4, // Slightly higher for varied question phrasing
        maxTokens: 3072,
      });

      // Validate JSON structure
      try {
        const parsed = JSON.parse(flashcards);
        if (!Array.isArray(parsed)) {
          throw new Error("Response is not an array");
        }
        
        // Ensure each flashcard has front and back
        for (const card of parsed) {
          if (!card.front || !card.back) {
            throw new Error("Invalid flashcard structure");
          }
        }
      } catch (parseError) {
        throw new Error("Failed to parse flashcard JSON response");
      }

      return flashcards;
    } catch (error) {
      throw new Error(
        `Failed to generate flashcards: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
