/**
 * GeminiAdapter - Implementation of IModelClient for Google Gemini API
 * 
 * Purpose: Adapter for Google's Gemini 1.5 Pro model, providing text generation
 * capabilities for educational content processing
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles Gemini API communication
 * - Open/Closed: Implements IModelClient interface for extensibility
 * - Liskov Substitution: Can be replaced with any IModelClient implementation
 * - Dependency Inversion: Depends on IModelClient abstraction
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { IModelClient, CompletionOptions } from "@/domain/interfaces/IModelClient";

export class GeminiAdapter implements IModelClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Using Gemini 2.5 Flash - fastest and most cost-effective
        systemInstruction: options?.systemPrompt,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      
      if (!response || !response.text) {
        throw new Error("Empty response from Gemini API");
      }

      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(
        `Failed to generate completion: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
