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
    // Get file from database
    const file = await this.prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    // Check if file is audio/video
    const audioVideoTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a',
      'video/mp4', 'video/webm', 'video/quicktime', 'audio/mp4'
    ];

    if (!audioVideoTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not audio/video`);
    }

    // Check if transcript already exists
    const existingTranscript = await this.prisma.transcript.findFirst({
      where: { fileId: file.id }
    });

    if (existingTranscript) {
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

    // Transcribe using ElevenLabs
    const transcriptEntity = await this.transcriber.transcribe({ file: fileEntity });

    // Save transcript to database
    const transcript = await this.prisma.transcript.create({
      data: {
        content: transcriptEntity.text,
        fileId: file.id,
      }
    });

    return new TranscriptEntity(
      transcript.id,
      transcript.fileId,
      transcript.content
    );
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


