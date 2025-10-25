/**
 * NotesAgent - Generates structured study notes from transcripts
 * 
 * Purpose: Transforms lecture transcripts into comprehensive, well-organized
 * study notes using markdown formatting
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles note generation
 * - Open/Closed: Extends IAgent interface without modification
 * - Dependency Inversion: Depends on IModelClient abstraction
 */

import { IAgent } from "@/domain/interfaces/IAgent";
import { IModelClient } from "@/domain/interfaces/IModelClient";
import { AGENT_PROMPTS } from "@/domain/types/prompts";

export class NotesAgent implements IAgent {
  name = "Notes Agent";

  constructor(private modelClient: IModelClient) {}

  async process(input: { transcript: string }): Promise<string> {
    if (!input.transcript || input.transcript.trim().length === 0) {
      throw new Error("Transcript is required for note generation");
    }

    const prompt = AGENT_PROMPTS.notes.template(input.transcript);

    try {
      const notes = await this.modelClient.complete(prompt, {
        systemPrompt: AGENT_PROMPTS.notes.system,
        temperature: 0.3, // Lower temperature for more consistent, structured output
        maxTokens: 4096,
      });

      return notes;
    } catch (error) {
      throw new Error(
        `Failed to generate notes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
