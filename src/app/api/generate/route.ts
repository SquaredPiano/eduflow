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
    const { transcriptId, type, options } = body;

    // Validate required fields
    if (!transcriptId) {
      return NextResponse.json(
        { error: "transcriptId is required" },
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

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Initialize service
    const modelClient = new GeminiAdapter(apiKey);
    const generateService = new GenerateService(modelClient);

    // Generate content
    if (type) {
      // Generate single type
      const output = await generateService.generate(
        transcriptId,
        type as AgentType,
        options
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
      const outputs = await generateService.generateAll(transcriptId);

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

    // Get API key (needed for service initialization)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Initialize service
    const modelClient = new GeminiAdapter(apiKey);
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

