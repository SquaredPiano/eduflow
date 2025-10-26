/**
 * SlidesAgent - Extracts presentation slides from transcripts
 * 
 * Purpose: Distills lecture content into key points suitable for
 * presentation slides
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles slide extraction
 * - Open/Closed: Extends IAgent interface without modification
 * - Dependency Inversion: Depends on IModelClient abstraction
 */

import { IAgent } from "@/domain/interfaces/IAgent";
import { IModelClient } from "@/domain/interfaces/IModelClient";
import { AGENT_PROMPTS } from "@/domain/types/prompts";

export class SlidesAgent implements IAgent {
  name = "Slides Agent";

  constructor(private modelClient: IModelClient) {}

  async process(input: { transcript: string }): Promise<string> {
    if (!input.transcript || input.transcript.trim().length === 0) {
      throw new Error("Transcript is required for slide generation");
    }

    const prompt = AGENT_PROMPTS.slides.template(input.transcript);

    try {
      const slides = await this.modelClient.complete(prompt, {
        systemPrompt: AGENT_PROMPTS.slides.system,
        temperature: 0.4, // Lower temperature for focused, concise output
        maxTokens: 2048,
      });

      // Extract JSON from response (handles markdown code blocks or extra text)
      let jsonText = slides.trim();
      
      // Remove markdown code block if present
      if (jsonText.startsWith("```")) {
        const lines = jsonText.split("\n");
        jsonText = lines.slice(1, -1).join("\n"); // Remove first and last lines
        if (jsonText.startsWith("json")) {
          jsonText = jsonText.substring(4); // Remove "json" language identifier
        }
        jsonText = jsonText.trim();
      }
      
      // Try to find JSON array if there's extra text
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // Validate JSON structure
      try {
        const parsed = JSON.parse(jsonText);
        if (!Array.isArray(parsed)) {
          throw new Error("Response is not an array");
        }

        // Validate each slide
        for (const slide of parsed) {
          if (
            !slide.title ||
            !Array.isArray(slide.bullets) ||
            slide.bullets.length === 0
          ) {
            throw new Error("Invalid slide structure");
          }
        }
        
        return jsonText; // Return cleaned JSON
      } catch (parseError) {
        console.error("Slides parsing error:", parseError);
        console.error("Response received:", slides.substring(0, 500));
        throw new Error("Failed to parse slides JSON response");
      }
    } catch (error) {
      throw new Error(
        `Failed to generate slides: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
