import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { ITranscriber } from "@/domain/interfaces/ITranscriber";
import type { FileEntity } from "@/domain/entities/FileEntity";
import { TranscriptEntity } from "@/domain/entities/TranscriptEntity";

export class ElevenLabsAdapter implements ITranscriber {
  private client: ElevenLabsClient;

  constructor(apiKey: string) {
    this.client = new ElevenLabsClient({ apiKey });
  }

  async transcribe(input: { file: FileEntity }): Promise<TranscriptEntity> {
    const { file } = input;
    
    try {
      if (!file.url) {
        throw new Error('File URL is required for transcription');
      }

      // Download audio file
      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioFile = new File([arrayBuffer], file.name, {
        type: file.mimeType || 'audio/mpeg'
      });

      // Transcribe using ElevenLabs Speech-to-Text
      const result = await this.client.speechToText.convert({
        file: audioFile,
        modelId: "scribe-v1", // ElevenLabs transcription model
      });

      // Extract text from result
      let text = '';
      if ('text' in result) {
        text = result.text;
      } else if ('alignment' in result && result.alignment) {
        const chars = (result.alignment as any).characters;
        if (chars && Array.isArray(chars)) {
          text = chars.map((c: any) => c.character).join('');
        }
      }

      // Generate transcript ID
      const transcriptId = Math.random().toString(36).slice(2);

      return new TranscriptEntity(transcriptId, file.id, text);
    } catch (error: any) {
      console.error('ElevenLabs transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  async transcribeRaw(audioUrl: string): Promise<string> {
    try {
      // Download audio file
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioFile = new File([arrayBuffer], 'audio.mp3', {
        type: response.headers.get('content-type') || 'audio/mpeg'
      });

      // Transcribe using ElevenLabs Speech-to-Text
      const result = await this.client.speechToText.convert({
        file: audioFile,
        modelId: "scribe-v1",
      });

      // Extract text from result
      if ('text' in result) {
        return result.text;
      } else if ('alignment' in result && result.alignment) {
        const chars = (result.alignment as any).characters;
        if (chars && Array.isArray(chars)) {
          return chars.map((c: any) => c.character).join('');
        }
      }

      return '';
    } catch (error: any) {
      console.error('ElevenLabs transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  // Legacy method for backwards compatibility
  async synthesize(_text: string): Promise<string> {
    throw new Error('Text-to-speech not implemented - use transcribe() for speech-to-text')
  }
}



