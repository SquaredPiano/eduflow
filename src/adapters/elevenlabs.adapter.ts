import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { ITranscriber } from "@/domain/interfaces/ITranscriber";
import type { FileEntity } from "@/domain/entities/FileEntity";
import { TranscriptEntity } from "@/domain/entities/TranscriptEntity";

export class ElevenLabsAdapter implements ITranscriber {
  private client: ElevenLabsClient;

  // Supported formats: Audio (MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM) + Video (MP4, MOV, AVI, FLV, MKV, etc.)
  // ElevenLabs automatically extracts audio from video files
  private static readonly SUPPORTED_FORMATS = [
    // Audio formats
    'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/wav', 
    'audio/webm', 'audio/ogg', 'audio/flac', 'audio/aac',
    // Video formats (audio will be extracted)
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
    'video/x-flv', 'video/x-matroska', 'video/webm'
  ];

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
        modelId: "scribe_v1", // Fixed: underscore not hyphen
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
        modelId: "scribe_v1",
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

  /**
   * Transcribe a local file (Buffer or Blob) directly
   * Useful for testing or when you have the file in memory
   * 
   * @param fileBuffer - File buffer or blob
   * @param fileName - Original filename with extension
   * @returns Transcription text
   */
  async transcribeLocal(fileBuffer: Buffer | Blob, fileName: string): Promise<string> {
    try {
      // Detect MIME type from file extension
      const mimeType = this.getMimeTypeFromFileName(fileName);
      
      // Convert to ArrayBuffer for File constructor
      let arrayBuffer: ArrayBuffer;
      if (Buffer.isBuffer(fileBuffer)) {
        // Node.js Buffer - convert to ArrayBuffer
        arrayBuffer = fileBuffer.buffer.slice(
          fileBuffer.byteOffset,
          fileBuffer.byteOffset + fileBuffer.byteLength
        ) as ArrayBuffer;
      } else {
        // Blob - get ArrayBuffer
        arrayBuffer = await (fileBuffer as Blob).arrayBuffer();
      }
      
      // Create File object
      const file = new File([arrayBuffer], fileName, { type: mimeType });

      // Transcribe using ElevenLabs Speech-to-Text
      const result = await this.client.speechToText.convert({
        file,
        modelId: "scribe_v1",
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
      console.error('ElevenLabs local transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromFileName(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    
    const mimeMap: Record<string, string> = {
      // Audio
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4', // MP4 can be audio or video
      'm4a': 'audio/mp4',
      'wav': 'audio/wav',
      'webm': 'audio/webm',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      'aac': 'audio/aac',
      // Video
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'flv': 'video/x-flv',
      'mkv': 'video/x-matroska',
      'mpeg': 'video/mpeg',
    };

    return mimeMap[ext || ''] || 'audio/mpeg';
  }

  /**
   * Check if a MIME type is supported
   */
  static isSupportedFormat(mimeType: string): boolean {
    return ElevenLabsAdapter.SUPPORTED_FORMATS.includes(mimeType);
  }
}



