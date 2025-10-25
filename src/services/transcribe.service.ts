import type { TranscriptEntity } from '../domain/entities/TranscriptEntity'

// Performs transcription (stub)
export async function transcribeFile(input: { fileId: string }): Promise<TranscriptEntity> {
  const id = Math.random().toString(36).slice(2)
  const { TranscriptEntity } = await import('../domain/entities/TranscriptEntity')
  return new TranscriptEntity(id, input.fileId, 'Transcription pending...')
}
