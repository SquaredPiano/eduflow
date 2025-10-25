export type OutputKind = 'notes' | 'quiz' | 'flashcards' | 'slides'

export class OutputEntity {
  constructor(
    public readonly id: string,
    public readonly kind: OutputKind,
    public readonly content: unknown,
    public readonly sourceTranscriptId?: string
  ) {}
}

