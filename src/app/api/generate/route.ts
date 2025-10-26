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

    console.log(`🎯 [API] Generate request: type=${type || 'all'}, transcriptId=${transcriptId}, fileId=${fileId}`);

    // Resolve transcriptId from fileId if needed
    let resolvedTranscriptId = transcriptId;
    
    if (!resolvedTranscriptId && fileId) {
      console.log(`🔍 [API] Resolving transcript from fileId: ${fileId}`);
      // Fetch the transcript for this file
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: { transcripts: { take: 1, orderBy: { createdAt: 'desc' } } },
      });
      
      if (!file) {
        console.error(`❌ [API] File not found: ${fileId}`);
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      
      if (file.transcripts.length === 0) {
        console.error(`⚠️ [API] File has no transcript: ${fileId}`);
        return NextResponse.json(
          { 
            error: "File has not been transcribed yet", 
            message: "Please wait for processing to complete. Audio/video files may take a few minutes to transcribe.",
            fileId: fileId,
            status: 'processing'
          },
          { status: 400 }
        );
      }
      
      resolvedTranscriptId = file.transcripts[0].id;
      console.log(`✅ [API] Resolved transcript: ${resolvedTranscriptId}`);
    }

    // Validate that we have a transcriptId
    if (!resolvedTranscriptId) {
      console.error(`❌ [API] Missing transcriptId and fileId`);
      return NextResponse.json(
        { error: "Either transcriptId or fileId is required" },
        { status: 400 }
      );
    }

    // Validate type if provided
    const validTypes = ["notes", "flashcards", "quiz", "slides"];
    if (type && !validTypes.includes(type)) {
      console.error(`❌ [API] Invalid type: ${type}`);
      return NextResponse.json(
        { 
          error: `Invalid type: ${type}`, 
          validTypes,
          message: "Please use one of the supported agent types"
        },
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
        console.log("✅ [API] Using Gemini API");
      } catch (error) {
        console.warn("⚠️ [API] Gemini initialization failed, falling back to OpenRouter");
        if (!openRouterKey) {
          return NextResponse.json(
            { 
              error: "AI service configuration error",
              message: "No valid AI API key configured. Please contact support."
            },
            { status: 500 }
          );
        }
        modelClient = new OpenRouterAdapter(openRouterKey);
        console.log("✅ [API] Using OpenRouter API (fallback)");
      }
    } else if (openRouterKey) {
      modelClient = new OpenRouterAdapter(openRouterKey);
      console.log("✅ [API] Using OpenRouter API");
    } else {
      console.error("❌ [API] No AI API keys configured");
      return NextResponse.json(
        { 
          error: "AI service unavailable",
          message: "The AI service is temporarily unavailable. Please try again later."
        },
        { status: 500 }
      );
    }

    // Initialize service
    const generateService = new GenerateService(modelClient);

    // Generate content
    if (type) {
      // Generate single type with optional context
      console.log(`🚀 [API] Starting single generation: ${type}`);
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

      console.log(`✅ [API] Generation successful: ${output.id}`);

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
      console.log(`🚀 [API] Starting batch generation (all types)`);
      const outputs = await generateService.generateAll(resolvedTranscriptId);

      console.log(`✅ [API] Batch generation complete: ${outputs.length} outputs`);

      return NextResponse.json({
        success: true,
        count: outputs.length,
        outputs: outputs.map((o) => ({
          id: o.id,
          type: o.kind,
          content: o.content,
          transcriptId: o.sourceTranscriptId,
        })),
      });
    }
  } catch (error) {
    console.error("❌ [API] Generate error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Categorize errors
      if (errorMessage.includes('not found')) {
        statusCode = 404;
      } else if (errorMessage.includes('empty') || errorMessage.includes('invalid')) {
        statusCode = 400;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        statusCode = 429;
        errorMessage = "AI service rate limit exceeded. Please try again in a few moments.";
      } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        statusCode = 500;
        errorMessage = "AI service authentication error. Please contact support.";
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
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

