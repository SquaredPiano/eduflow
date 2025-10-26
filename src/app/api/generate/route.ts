/**
 * /api/generate - AI generation endpoint
 * 
 * Purpose: Handles requests to generate educational content from transcripts
 * using specialized AI agents
 * 
 * Routes:
 * - POST /api/generate - Generate specific content type or all types
 * - GET /api/generate?id=<outputId> - Retrieve generated output
 * - GET /api/generate?transcriptId=<id> - Retrieve all outputs for transcript
 */

import { NextRequest, NextResponse } from "next/server";
import { GenerateService, AgentType } from "@/services/generate.service";
import { GeminiAdapter } from "@/adapters/gemini.adapter";
import { OpenRouterAdapter } from "@/adapters/openrouter.adapter";
import { IModelClient } from "@/domain/interfaces/IModelClient";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/generate
 * 
 * Body:
 * {
 *   transcriptId: string;
 *   type?: AgentType; // Optional: generate specific type, omit for all
 *   options?: Record<string, any>; // Optional: agent-specific options
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcriptId, fileId, type, options, agentContext, userContext, previousOutputId } = body;

    // Resolve transcriptId from fileId if needed
    let resolvedTranscriptId = transcriptId;
    
    if (!resolvedTranscriptId && fileId) {
      // Fetch the transcript for this file
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: { transcripts: { take: 1, orderBy: { createdAt: 'desc' } } },
      });
      
      if (!file) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      
      if (file.transcripts.length === 0) {
        return NextResponse.json(
          { error: "File has not been transcribed yet. Please wait for processing to complete." },
          { status: 400 }
        );
      }
      
      resolvedTranscriptId = file.transcripts[0].id;
    }

    // Validate that we have a transcriptId
    if (!resolvedTranscriptId) {
      return NextResponse.json(
        { error: "Either transcriptId or fileId is required" },
        { status: 400 }
      );
    }

    // Validate type if provided
    if (type && !["notes", "flashcards", "quiz", "slides"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be: notes, flashcards, quiz, or slides" },
        { status: 400 }
      );
    }

    // Get API keys from environment and initialize model client
    // Try Gemini first, fallback to OpenRouter
    let modelClient: IModelClient;
    
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    if (geminiKey) {
      try {
        modelClient = new GeminiAdapter(geminiKey);
        console.log("Using Gemini API");
      } catch (error) {
        console.warn("Gemini initialization failed, falling back to OpenRouter");
        if (!openRouterKey) {
          return NextResponse.json(
            { error: "No valid AI API key configured (tried Gemini and OpenRouter)" },
            { status: 500 }
          );
        }
        modelClient = new OpenRouterAdapter(openRouterKey);
        console.log("Using OpenRouter API");
      }
    } else if (openRouterKey) {
      modelClient = new OpenRouterAdapter(openRouterKey);
      console.log("Using OpenRouter API");
    } else {
      return NextResponse.json(
        { error: "No AI API key configured (GEMINI_API_KEY or OPENROUTER_API_KEY required)" },
        { status: 500 }
      );
    }

    // Initialize service
    const generateService = new GenerateService(modelClient);

    // Generate content
    if (type) {
      // Generate single type with optional context
      const output = await generateService.generate(
        resolvedTranscriptId,
        type as AgentType,
        {
          ...options,
          agentContext,
          userContext,
          previousOutputId,
        }
      );

      return NextResponse.json({
        success: true,
        output: {
          id: output.id,
          type: output.kind,
          content: output.content,
          transcriptId: output.sourceTranscriptId,
        },
      });
    } else {
      // Generate all types
      const outputs = await generateService.generateAll(resolvedTranscriptId);

      return NextResponse.json({
        success: true,
        outputs: outputs.map((o) => ({
          id: o.id,
          type: o.kind,
          content: o.content,
          transcriptId: o.sourceTranscriptId,
        })),
      });
    }
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown generation error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate
 * 
 * Query params:
 * - id: string (get specific output)
 * - transcriptId: string (get all outputs for transcript)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const outputId = searchParams.get("id");
    const transcriptId = searchParams.get("transcriptId");

    if (!outputId && !transcriptId) {
      return NextResponse.json(
        { error: "Either 'id' or 'transcriptId' parameter is required" },
        { status: 400 }
      );
    }

    // Get API keys from environment and initialize model client
    // Try Gemini first, fallback to OpenRouter
    let modelClient: IModelClient;
    
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    if (geminiKey) {
      try {
        modelClient = new GeminiAdapter(geminiKey);
      } catch (error) {
        if (!openRouterKey) {
          return NextResponse.json(
            { error: "No valid AI API key configured" },
            { status: 500 }
          );
        }
        modelClient = new OpenRouterAdapter(openRouterKey);
      }
    } else if (openRouterKey) {
      modelClient = new OpenRouterAdapter(openRouterKey);
    } else {
      return NextResponse.json(
        { error: "No AI API key configured" },
        { status: 500 }
      );
    }

    // Initialize service
    const generateService = new GenerateService(modelClient);

    if (outputId) {
      // Get specific output
      const output = await generateService.getOutput(outputId);

      if (!output) {
        return NextResponse.json(
          { error: "Output not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        output: {
          id: output.id,
          type: output.kind,
          content: output.content,
          transcriptId: output.sourceTranscriptId,
        },
      });
    } else {
      // Get all outputs for transcript
      const outputs = await generateService.getOutputsByTranscript(
        transcriptId!
      );

      return NextResponse.json({
        success: true,
        outputs: outputs.map((o) => ({
          id: o.id,
          type: o.kind,
          content: o.content,
          transcriptId: o.sourceTranscriptId,
        })),
      });
    }
  } catch (error) {
    console.error("Get output error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

