import { NextResponse } from 'next/server';
import { TranscribeService } from '@/services/transcribe.service';
import { ElevenLabsAdapter } from '@/adapters/elevenlabs.adapter';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  try {
    // Verify authentication (temporarily disabled for development)
    // const session = await getSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Parse request
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      );
    }

    // Initialize services
    const prisma = new PrismaClient();
    const elevenlabs = new ElevenLabsAdapter(
      process.env.ELEVENLABS_API_KEY!
    );
    const transcribeService = new TranscribeService(elevenlabs, prisma);

    // Transcribe file
    const transcript = await transcribeService.transcribeFile(fileId);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      transcript: {
        id: transcript.id,
        fileId: transcript.fileId,
        text: transcript.text,
      }
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Verify authentication (temporarily disabled for development)
    // const session = await getSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(req.url);
    const transcriptId = searchParams.get('id');
    const fileId = searchParams.get('fileId');

    if (!transcriptId && !fileId) {
      return NextResponse.json(
        { error: 'Missing transcript id or fileId' },
        { status: 400 }
      );
    }

    const prisma = new PrismaClient();
    const elevenlabs = new ElevenLabsAdapter(
      process.env.ELEVENLABS_API_KEY!
    );
    const transcribeService = new TranscribeService(elevenlabs, prisma);

    let transcript;
    if (transcriptId) {
      transcript = await transcribeService.getTranscript(transcriptId);
    } else if (fileId) {
      transcript = await transcribeService.getTranscriptByFileId(fileId);
    }

    await prisma.$disconnect();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transcript: {
        id: transcript.id,
        fileId: transcript.fileId,
        text: transcript.text,
      }
    });

  } catch (error: any) {
    console.error('Get transcript error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get transcript' },
      { status: 500 }
    );
  }
}

