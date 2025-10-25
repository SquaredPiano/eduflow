import type { OutputEntity } from '../domain/entities/OutputEntity'

export async function generateFromTranscript(input: { transcriptId: string; kind: 'notes' | 'quiz' | 'flashcards' }): Promise<OutputEntity> {
  const id = Math.random().toString(36).slice(2)
  const { OutputEntity } = await import('../domain/entities/OutputEntity')
  return new OutputEntity(id, input.kind, { message: 'Generation pending...' }, input.transcriptId)
}
