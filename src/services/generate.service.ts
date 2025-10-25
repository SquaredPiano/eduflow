/**
 * GenerateService - Orchestrates AI agent processing
 * 
 * Purpose: Coordinates multiple specialized agents to generate educational
 * content from transcripts, with support for single and batch generation
 * 
 * SOLID Principles:
 * - Single Responsibility: Orchestrates agent execution and output persistence
 * - Open/Closed: Extensible via agent map, closed for modification
 * - Liskov Substitution: All agents implement IAgent interface
 * - Dependency Inversion: Depends on IAgent and IModelClient abstractions
 */

import { IAgent } from "@/domain/interfaces/IAgent";
import { IModelClient } from "@/domain/interfaces/IModelClient";
import { OutputEntity } from "@/domain/entities/OutputEntity";
import { TranscriptEntity } from "@/domain/entities/TranscriptEntity";
import { NotesAgent } from "./agents/NotesAgent";
import { FlashcardAgent } from "./agents/FlashcardAgent";
import { QuizAgent } from "./agents/QuizAgent";
import { SlidesAgent } from "./agents/SlidesAgent";
import { PrismaClient } from "@prisma/client";

export type AgentType = "notes" | "flashcards" | "quiz" | "slides";

const prisma = new PrismaClient();

export class GenerateService {
  private agents: Map<AgentType, IAgent>;

  constructor(private modelClient: IModelClient) {
    // Initialize all agents with the model client
    this.agents = new Map<AgentType, IAgent>([
      ["notes", new NotesAgent(modelClient)],
      ["flashcards", new FlashcardAgent(modelClient)],
      ["quiz", new QuizAgent(modelClient)],
      ["slides", new SlidesAgent(modelClient)],
    ]);
  }

  /**
   * Generate a single output type from a transcript
   * 
   * @param transcriptId - The transcript to process
   * @param type - Type of output to generate (notes, flashcards, quiz, slides)
   * @param options - Additional options (e.g., quiz difficulty)
   * @returns The generated OutputEntity
   */
  async generate(
    transcriptId: string,
    type: AgentType,
    options?: Record<string, any>
  ): Promise<OutputEntity> {
    // Get the transcript from database
    const transcriptRecord = await prisma.transcript.findUnique({
      where: { id: transcriptId },
    });

    if (!transcriptRecord) {
      throw new Error(`Transcript not found: ${transcriptId}`);
    }

    const transcript = new TranscriptEntity(
      transcriptRecord.id,
      transcriptRecord.content,
      transcriptRecord.fileId
    );

    // Get the appropriate agent
    const agent = this.agents.get(type);
    if (!agent) {
      throw new Error(`Unknown agent type: ${type}`);
    }

    try {
      // Process the transcript with the agent
      const content = await agent.process({
        transcript: transcript.text, // TranscriptEntity uses 'text' property
        ...options,
      });

      // Save the output to database
      const outputRecord = await prisma.output.create({
        data: {
          type,
          content,
          transcriptId,
        },
      });

      return new OutputEntity(
        outputRecord.id,
        outputRecord.type as AgentType,
        outputRecord.content,
        outputRecord.transcriptId
      );
    } catch (error) {
      throw new Error(
        `Failed to generate ${type}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate all output types from a transcript in parallel
   * 
   * @param transcriptId - The transcript to process
   * @returns Array of successfully generated OutputEntity objects
   */
  async generateAll(transcriptId: string): Promise<OutputEntity[]> {
    const agentTypes = Array.from(this.agents.keys());

    const results = await Promise.allSettled(
      agentTypes.map((type) => this.generate(transcriptId, type))
    );

    // Filter successful results and log failures
    const outputs: OutputEntity[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        outputs.push(result.value);
      } else {
        console.error(
          `Failed to generate ${agentTypes[index]}:`,
          result.reason
        );
      }
    });

    return outputs;
  }

  /**
   * Get a specific output
   * 
   * @param outputId - The output ID
   * @returns The OutputEntity or null
   */
  async getOutput(outputId: string): Promise<OutputEntity | null> {
    const output = await prisma.output.findUnique({
      where: { id: outputId },
    });

    if (!output) {
      return null;
    }

    return new OutputEntity(
      output.id,
      output.type as AgentType,
      output.content,
      output.transcriptId
    );
  }

  /**
   * Get all outputs for a transcript
   * 
   * @param transcriptId - The transcript ID
   * @returns Array of OutputEntity objects
   */
  async getOutputsByTranscript(
    transcriptId: string
  ): Promise<OutputEntity[]> {
    const outputs = await prisma.output.findMany({
      where: { transcriptId },
      orderBy: { createdAt: "desc" },
    });

    return outputs.map(
      (o) =>
        new OutputEntity(
          o.id,
          o.type as AgentType,
          o.content,
          o.transcriptId
        )
    );
  }

  /**
   * Get an agent by type
   * 
   * @param type - The agent type
   * @returns The agent instance or undefined
   */
  getAgent(type: AgentType): IAgent | undefined {
    return this.agents.get(type);
  }

  /**
   * Get all available agent types
   * 
   * @returns Array of agent type names
   */
  getAvailableAgents(): AgentType[] {
    return Array.from(this.agents.keys());
  }
}

// Legacy function for backward compatibility
export async function generateFromTranscript(input: {
  transcriptId: string;
  kind: "notes" | "quiz" | "flashcards";
}): Promise<OutputEntity> {
  const id = Math.random().toString(36).slice(2);
  const { OutputEntity } = await import("../domain/entities/OutputEntity");
  return new OutputEntity(
    id,
    input.kind,
    { message: "Generation pending..." },
    input.transcriptId
  );
}


