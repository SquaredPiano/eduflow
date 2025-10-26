/**
 * Download API Route - Generate and download content in various formats
 * 
 * Purpose: Handles requests to convert AI-generated content into downloadable files
 * Supports: CSV, DOCX, PDF, PPTX, Anki formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import {
  flashcardsToCsv,
  flashcardsToAnkiTxt,
  flashcardsToEnhancedAnki,
  notesToDocx,
  notesToPdf,
  slidesToPptx,
  slidesToPdf,
  quizToCsv,
  quizToPdf,
  quizToAnswerKeyCsv,
  SerializerResult,
} from '@/services/serializers';

const prisma = new PrismaClient();

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('appSession');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    const auth0User = session.user;
    
    // Get the database user by Auth0 ID
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    });
    
    return dbUser;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { outputId, format } = await request.json();

    if (!outputId || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: outputId and format' },
        { status: 400 }
      );
    }

    // Fetch the output from database
    const output = await prisma.output.findUnique({
      where: { id: outputId },
      include: {
        project: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!output) {
      return NextResponse.json(
        { error: 'Output not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (output.project?.user?.auth0Id !== user.auth0Id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse content based on output type
    const content = typeof output.content === 'string' 
      ? output.content 
      : JSON.stringify(output.content);

    // Generate the requested format
    let result: SerializerResult;

    try {
      switch (output.type) {
        case 'flashcards':
          result = await generateFlashcardFile(content, format);
          break;
        case 'notes':
          result = await generateNotesFile(content, format);
          break;
        case 'slides':
          result = await generateSlidesFile(content, format);
          break;
        case 'quiz':
          result = await generateQuizFile(content, format);
          break;
        default:
          return NextResponse.json(
            { error: `Unsupported output type: ${output.type}` },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Serialization error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate file', 
          details: error instanceof Error ? error.message : String(error) 
        },
        { status: 500 }
      );
    }

    // Return the file as a downloadable response
    return new NextResponse(result.buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// ============= Helper Functions =============

async function generateFlashcardFile(
  content: string,
  format: string
): Promise<SerializerResult> {
  const flashcards = JSON.parse(content);
  
  switch (format) {
    case 'csv':
      return await flashcardsToCsv(flashcards, 'flashcards');
    case 'anki-txt':
      return await flashcardsToAnkiTxt(flashcards, 'flashcards');
    case 'anki-enhanced':
      return await flashcardsToEnhancedAnki(flashcards, 'flashcards');
    default:
      throw new Error(`Unsupported flashcard format: ${format}`);
  }
}

async function generateNotesFile(
  content: string,
  format: string
): Promise<SerializerResult> {
  // Notes content might be stored as string or JSON
  const notesText = typeof content === 'string' && content.startsWith('{')
    ? JSON.parse(content).content || content
    : content;
  
  switch (format) {
    case 'md':
    case 'markdown':
      return {
        buffer: Buffer.from(notesText, 'utf-8'),
        mimeType: 'text/markdown',
        fileName: `notes-${Date.now()}.md`,
      };
    case 'docx':
      return await notesToDocx(notesText, 'notes');
    case 'pdf':
      return await notesToPdf(notesText, 'notes');
    default:
      throw new Error(`Unsupported notes format: ${format}`);
  }
}

async function generateSlidesFile(
  content: string,
  format: string
): Promise<SerializerResult> {
  const slides = JSON.parse(content);
  
  switch (format) {
    case 'pptx':
      return await slidesToPptx(slides, 'presentation');
    case 'pdf':
      return await slidesToPdf(slides, 'presentation');
    default:
      throw new Error(`Unsupported slides format: ${format}`);
  }
}

async function generateQuizFile(
  content: string,
  format: string
): Promise<SerializerResult> {
  const quiz = JSON.parse(content);
  
  switch (format) {
    case 'csv':
      return await quizToCsv(quiz, 'quiz');
    case 'answer-key':
      return await quizToAnswerKeyCsv(quiz, 'quiz');
    case 'pdf':
      return await quizToPdf(quiz, 'quiz');
    default:
      throw new Error(`Unsupported quiz format: ${format}`);
  }
}
