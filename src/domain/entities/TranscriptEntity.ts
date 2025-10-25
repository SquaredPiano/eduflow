export class TranscriptEntity {
  constructor(
    public readonly id: string,
    public readonly fileId: string,
    public readonly text: string
  ) {}
}

export type TranscriptSegment = { start: number; end: number; text: string }
