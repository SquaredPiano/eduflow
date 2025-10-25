export class WhisperAdapter {
  async transcribe(_fileUrl: string): Promise<string> {
    throw new Error('Not implemented')
  }
}
