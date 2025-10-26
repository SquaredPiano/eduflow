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
   * @param options - Additional options including agentContext, userContext, and previousOutputId
   * @returns The generated OutputEntity
   */
  async generate(
    transcriptId: string,
    type: AgentType,
    options?: {
      agentContext?: Array<{ type: string; content: any; outputId: string }>;
      userContext?: string;
      previousOutputId?: string;
      [key: string]: any;
    }
  ): Promise<OutputEntity> {
    console.log(`🎯 Starting generation: type=${type}, transcriptId=${transcriptId}`);
    
    // Get the transcript from database
    const transcriptRecord = await prisma.transcript.findUnique({
      where: { id: transcriptId },
    });

    if (!transcriptRecord) {
      console.error(`❌ Transcript not found: ${transcriptId}`);
      throw new Error(`Transcript not found: ${transcriptId}`);
    }

    if (!transcriptRecord.content || transcriptRecord.content.trim().length === 0) {
      console.error(`❌ Transcript is empty: ${transcriptId}`);
      throw new Error('Transcript content is empty. Please ensure the file was properly processed.');
    }

    console.log(`✅ Transcript loaded: ${transcriptRecord.content.length} characters`);

    const transcript = new TranscriptEntity(
      transcriptRecord.id,
      transcriptRecord.content,
      transcriptRecord.fileId
    );

    // Get the appropriate agent
    const agent = this.agents.get(type);
    if (!agent) {
      console.error(`❌ Unknown agent type: ${type}`);
      throw new Error(`Unknown agent type: ${type}. Supported types: ${Array.from(this.agents.keys()).join(', ')}`);
    }

    try {
      // Prepare agent context string if provided
      let agentContextText = '';
      if (options?.agentContext && options.agentContext.length > 0) {
        agentContextText = '\n\n=== Context from Connected Agents ===\n';
        for (const ctx of options.agentContext) {
          agentContextText += `\n--- ${ctx.type.toUpperCase()} ---\n`;
          agentContextText += typeof ctx.content === 'string' 
            ? ctx.content 
            : JSON.stringify(ctx.content, null, 2);
          agentContextText += '\n';
        }
        console.log(`📎 Added context from ${options.agentContext.length} connected agents`);
      }

      // Prepare user context string if provided
      let userContextText = '';
      if (options?.userContext) {
        userContextText = `\n\n=== Additional Instructions ===\n${options.userContext}\n`;
        console.log(`📝 Added user context: ${options.userContext.substring(0, 100)}...`);
      }

      // Process the transcript with the agent, including contexts
      console.log(`🤖 Processing with ${type} agent...`);
      const content = await agent.process({
        transcript: transcript.text + agentContextText + userContextText,
        ...options,
      });

      if (!content) {
        throw new Error(`Agent returned empty content for type: ${type}`);
      }

      console.log(`✅ Agent processing complete`);

      // Calculate version number
      let version = 1;
      if (options?.previousOutputId) {
        const previousOutput = await prisma.output.findUnique({
          where: { id: options.previousOutputId },
        });
        if (previousOutput) {
          version = (previousOutput.version || 1) + 1;
          console.log(`📊 Creating version ${version} (regeneration)`);
        }
      }

      // Save the output to database with context fields
      const outputRecord = await prisma.output.create({
        data: {
          type,
          content,
          transcriptId,
          userContext: options?.userContext || undefined,
          agentContext: options?.agentContext ? (options.agentContext as any) : undefined,
          previousOutputId: options?.previousOutputId || undefined,
          version,
        },
      });

      console.log(`💾 Output saved to database: ${outputRecord.id}`);

      return new OutputEntity(
        outputRecord.id,
        outputRecord.type as AgentType,
        outputRecord.content,
        outputRecord.transcriptId || undefined
      );
    } catch (error) {
      console.error(`❌ Generation failed for ${type}:`, error);
      
      // Provide specific error messages
      let errorMessage = `Failed to generate ${type}`;
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'AI API configuration error. Please check your API keys.';
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
          errorMessage = `API rate limit exceeded. Please try again in a few moments.`;
        } else if (error.message.includes('timeout')) {
          errorMessage = `Generation timed out. The content might be too long. Try with a shorter file.`;
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate all output types from a transcript in parallel
   * 
   * @param transcriptId - The transcript to process
   * @returns Array of successfully generated OutputEntity objects
   */
  async generateAll(transcriptId: string): Promise<OutputEntity[]> {
    console.log(`🚀 Starting batch generation for transcript: ${transcriptId}`);
    const agentTypes = Array.from(this.agents.keys());
    console.log(`📋 Generating ${agentTypes.length} output types: ${agentTypes.join(', ')}`);

    const startTime = Date.now();
    const results = await Promise.allSettled(
      agentTypes.map((type) => this.generate(transcriptId, type))
    );

    // Filter successful results and log failures
    const outputs: OutputEntity[] = [];
    const failures: string[] = [];
    
    results.forEach((result, index) => {
      const agentType = agentTypes[index];
      if (result.status === "fulfilled") {
        outputs.push(result.value);
        console.log(`✅ ${agentType} generation succeeded`);
      } else {
        const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.error(`❌ ${agentType} generation failed:`, errorMsg);
        failures.push(`${agentType}: ${errorMsg}`);
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🏁 Batch generation complete: ${outputs.length}/${agentTypes.length} succeeded in ${duration}s`);
    
    if (failures.length > 0) {
      console.warn(`⚠️ Some generations failed:\n${failures.join('\n')}`);
    }

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
      output.transcriptId || undefined
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
      (o: any) =>
        new OutputEntity(
          o.id,
          o.type as AgentType,
          o.content,
          o.transcriptId || undefined
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


