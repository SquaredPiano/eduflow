/**
 * useGenerate - Custom React hooks for AI content generation
 * 
 * Purpose: Provides client-side interface for generating educational
 * content from transcripts using AI agents
 * 
 * Hooks:
 * - useGenerate: Generate content (single type or all types)
 * - useOutput: Fetch specific output by ID
 * - useOutputsByTranscript: Fetch all outputs for a transcript
 */

'use client';

import { useState, useCallback } from 'react';

export type AgentType = 'notes' | 'flashcards' | 'quiz' | 'slides';

export interface GenerateOptions {
  transcriptId: string;
  type?: AgentType;
  options?: Record<string, any>;
}

export interface Output {
  id: string;
  type: AgentType;
  content: unknown;
  transcriptId: string;
}

/**
 * Hook for generating content from transcripts
 */
export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (options: GenerateOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    isGenerating,
    error,
  };
}

/**
 * Hook for fetching a specific output by ID
 */
export function useOutput(outputId: string | null) {
  const [output, setOutput] = useState<Output | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOutput = useCallback(async () => {
    if (!outputId) {
      setOutput(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/generate?id=${outputId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch output');
      }

      const data = await response.json();
      setOutput(data.output);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [outputId]);

  return {
    output,
    isLoading,
    error,
    refetch: fetchOutput,
  };
}

/**
 * Hook for fetching all outputs for a transcript
 */
export function useOutputsByTranscript(transcriptId: string | null) {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOutputs = useCallback(async () => {
    if (!transcriptId) {
      setOutputs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/generate?transcriptId=${transcriptId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch outputs');
      }

      const data = await response.json();
      setOutputs(data.outputs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [transcriptId]);

  return {
    outputs,
    isLoading,
    error,
    refetch: fetchOutputs,
  };
}

export default useGenerate;

