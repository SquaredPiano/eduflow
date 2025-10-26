/**
 * QuizAgent - Generates multiple-choice quizzes from transcripts
 * 
 * Purpose: Creates assessments that test student understanding with
 * various difficulty levels
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles quiz generation
 * - Open/Closed: Extends IAgent interface without modification
 * - Dependency Inversion: Depends on IModelClient abstraction
 */

import { IAgent } from "@/domain/interfaces/IAgent";
import { IModelClient } from "@/domain/interfaces/IModelClient";
import { AGENT_PROMPTS } from "@/domain/types/prompts";

export class QuizAgent implements IAgent {
  name = "Quiz Agent";

  constructor(private modelClient: IModelClient) {}

  async process(input: {
    transcript: string;
    difficulty?: "easy" | "medium" | "hard";
  }): Promise<string> {
    if (!input.transcript || input.transcript.trim().length === 0) {
      throw new Error("Transcript is required for quiz generation");
    }

    const difficulty = input.difficulty || "medium";
    const prompt = AGENT_PROMPTS.quiz.template(input.transcript, difficulty);

    try {
      const quiz = await this.modelClient.complete(prompt, {
        systemPrompt: AGENT_PROMPTS.quiz.system,
        temperature: 0.5, // Balanced for variety while maintaining accuracy
        maxTokens: 8192, // Increased for 10 questions with explanations
      });

      // Extract JSON from response (handles markdown code blocks or extra text)
      let jsonText = quiz.trim();
      
      // Remove markdown code block if present
      if (jsonText.startsWith("```")) {
        const lines = jsonText.split("\n");
        jsonText = lines.slice(1, -1).join("\n"); // Remove first and last lines
        if (jsonText.startsWith("json")) {
          jsonText = jsonText.substring(4); // Remove "json" language identifier
        }
        jsonText = jsonText.trim();
      }
      
      // Try to find JSON object if there's extra text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // Validate JSON structure
      try {
        const parsed = JSON.parse(jsonText);
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          throw new Error("Invalid quiz structure");
        }

        // Validate each question
        for (const q of parsed.questions) {
          if (
            !q.question ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            typeof q.correct !== "number" ||
            q.correct < 0 ||
            q.correct > 3 ||
            !q.explanation
          ) {
            throw new Error("Invalid question structure");
          }
        }
        
        return jsonText; // Return cleaned JSON
      } catch (parseError) {
        console.error("Quiz parsing error:", parseError);
        console.error("Response received:", quiz.substring(0, 500));
        throw new Error("Failed to parse quiz JSON response");
      }
    } catch (error) {
      throw new Error(
        `Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
