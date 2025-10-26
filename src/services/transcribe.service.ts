import { PrismaClient } from '@prisma/client';
import type { ITranscriber } from '@/domain/interfaces/ITranscriber';
import { TranscriptEntity } from '@/domain/entities/TranscriptEntity';
import { FileEntity } from '@/domain/entities/FileEntity';

export class TranscribeService {
  constructor(
    private transcriber: ITranscriber,
    private prisma: PrismaClient
  ) {}

  async transcribeFile(fileId: string): Promise<TranscriptEntity> {
    console.log(`🎙️ Starting transcription for file: ${fileId}`);
    
    // Get file from database
    const file = await this.prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      console.error(`❌ File not found: ${fileId}`);
      throw new Error(`File not found: ${fileId}`);
    }

    console.log(`📁 File found: ${file.name} (${file.type})`);

    // Check if file is audio/video
    const audioVideoTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a',
      'video/mp4', 'video/webm', 'video/quicktime', 'audio/mp4'
    ];

    if (!audioVideoTypes.includes(file.type)) {
      console.error(`❌ Invalid file type: ${file.type}`);
      throw new Error(`File type ${file.type} is not audio/video. Supported formats: MP3, WAV, M4A, MP4, WebM, QuickTime`);
    }

    // Check if transcript already exists
    const existingTranscript = await this.prisma.transcript.findFirst({
      where: { fileId: file.id }
    });

    if (existingTranscript) {
      console.log(`✅ Transcript already exists: ${existingTranscript.id}`);
      return new TranscriptEntity(
        existingTranscript.id,
        existingTranscript.fileId,
        existingTranscript.content
      );
    }

    // Create FileEntity for transcriber
    const fileEntity = new FileEntity(
      file.id,
      file.name,
      file.type,
      0, // size not stored in current schema
      file.url
    );

    try {
      // Transcribe using ElevenLabs
      console.log(`🎯 Calling ElevenLabs transcription service...`);
      const transcriptEntity = await this.transcriber.transcribe({ file: fileEntity });

      if (!transcriptEntity || !transcriptEntity.text || transcriptEntity.text.trim().length === 0) {
        throw new Error('Transcription returned empty content');
      }

      console.log(`✅ Transcription complete: ${transcriptEntity.text.length} characters`);

      // Save transcript to database
      const transcript = await this.prisma.transcript.create({
        data: {
          content: transcriptEntity.text,
          fileId: file.id,
        }
      });

      console.log(`💾 Transcript saved to database: ${transcript.id}`);

      return new TranscriptEntity(
        transcript.id,
        transcript.fileId,
        transcript.content
      );
    } catch (error) {
      console.error(`❌ Transcription failed for ${file.name}:`, error);
      
      // Provide specific error messages
      let errorMessage = 'Transcription failed';
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('unauthorized')) {
          errorMessage = 'ElevenLabs API authentication error. Please check your API key.';
        } else if (error.message.includes('quota') || error.message.includes('credits')) {
          errorMessage = 'ElevenLabs API quota exceeded. Please check your account credits.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Transcription timed out. The audio file might be too long.';
        } else if (error.message.includes('format') || error.message.includes('codec')) {
          errorMessage = 'Audio format not supported. Please try converting to MP3 or WAV.';
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async getTranscript(transcriptId: string): Promise<TranscriptEntity | null> {
    const transcript = await this.prisma.transcript.findUnique({
      where: { id: transcriptId }
    });

    if (!transcript) return null;

    return new TranscriptEntity(
      transcript.id,
      transcript.fileId,
      transcript.content
    );
  }

  async getTranscriptByFileId(fileId: string): Promise<TranscriptEntity | null> {
    const transcript = await this.prisma.transcript.findFirst({
      where: { fileId }
    });

    if (!transcript) return null;

    return new TranscriptEntity(
      transcript.id,
      transcript.fileId,
      transcript.content
    );
  }
}

// Legacy function for backwards compatibility (stub)
export async function transcribeFile(input: { fileId: string }): Promise<TranscriptEntity> {
  const id = Math.random().toString(36).slice(2)
  const { TranscriptEntity } = await import('../domain/entities/TranscriptEntity')
  return new TranscriptEntity(id, input.fileId, 'Transcription pending...')
}


