/**
 * OpenRouterAdapter - Implementation of IModelClient for OpenRouter API
 * 
 * Purpose: Adapter for OpenRouter API, providing access to multiple LLM providers
 * (Claude, GPT-4, Gemini, etc.) through a unified interface
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles OpenRouter API communication
 * - Open/Closed: Implements IModelClient interface for extensibility
 * - Liskov Substitution: Can be replaced with any IModelClient implementation
 * - Dependency Inversion: Depends on IModelClient abstraction
 */

import { IModelClient, CompletionOptions } from "@/domain/interfaces/IModelClient";

export class OpenRouterAdapter implements IModelClient {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private defaultModel = "anthropic/claude-3.5-sonnet"; // Powerful, reliable model

  constructor(apiKey: string, model?: string) {
    if (!apiKey) {
      throw new Error("OpenRouter API key is required");
    }
    this.apiKey = apiKey;
    if (model) {
      this.defaultModel = model;
    }
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    try {
      const messages = [];
      
      // Add system message if provided
      if (options?.systemPrompt) {
        messages.push({
          role: "system",
          content: options.systemPrompt,
        });
      }
      
      // Add user prompt
      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "EduFlow AI Study Companion",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenRouter API");
      }

      const content = data.choices[0].message?.content;
      if (!content) {
        throw new Error("Empty response from OpenRouter API");
      }

      return content;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw new Error(
        `Failed to generate completion: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
