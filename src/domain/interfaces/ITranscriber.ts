import type { TranscriptEntity } from '../entities/TranscriptEntity'
import type { FileEntity } from '../entities/FileEntity'

export interface ITranscriber {
  transcribe(input: { file: FileEntity }): Promise<TranscriptEntity>
}
