/**
 * Ingest Service
 * 
 * Handles file ingestion workflow:
 * 1. Accepts uploaded file metadata (URL, name, type)
 * 2. Extracts text content based on file type
 * 3. Saves file metadata and transcript to database
 * 4. Returns FileEntity for further processing
 * 
 * Note: Files are already uploaded to UploadThing before this service is called.
 * This service focuses on post-upload processing.
 */

import { PrismaClient } from '@prisma/client';
import { ITextExtractor } from '@/domain/interfaces/ITextExtractor';
import { FileEntity } from '@/domain/entities/FileEntity';

export class IngestService {
  constructor(
    private prisma: PrismaClient,
    private textExtractor: ITextExtractor
  ) {}

  /**
   * Process an uploaded file: extract text and save to database
   * 
   * @param fileUrl - URL of the uploaded file (from UploadThing)
   * @param fileName - Original file name
   * @param fileType - MIME type of the file
   * @param fileKey - UploadThing file key (for deletion)
   * @param fileSize - File size in bytes
   * @param userId - Database user ID (not Auth0 ID)
   * @param projectId - Project ID to associate the file with
   * @returns FileEntity representing the processed file
   */
  async processFile(
    fileUrl: string,
    fileName: string,
    fileType: string,
    fileKey: string,
    fileSize: number,
    userId: string,
    projectId: string
  ): Promise<FileEntity> {
    console.log(`📥 Processing file: ${fileName} (${fileType})`);

    try {
      // 1. Save file metadata to database first
      const file = await this.prisma.file.create({
        data: {
          name: fileName,
          type: fileType,
          url: fileUrl,
          key: fileKey,
          size: fileSize,
          projectId: projectId,
        },
      });

      console.log(`✅ File saved to database with ID: ${file.id}`);

      // 2. Extract text based on file type
      let extractedText: string | null = null;

      try {
        switch (fileType) {
          case 'application/pdf':
            extractedText = await this.textExtractor.extractFromPDF(fileUrl);
            break;
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            extractedText = await this.textExtractor.extractFromPPTX(fileUrl);
            break;
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            extractedText = await this.textExtractor.extractFromDOCX(fileUrl);
            break;
          case 'video/mp4':
          case 'audio/mpeg':
          case 'audio/mp3':
            // Video and audio files will be handled by transcription service (Phase 3)
            console.log(`🎬 Video/audio file detected - will be transcribed in Phase 3`);
            break;
          default:
            console.log(`ℹ️ Unsupported file type for text extraction: ${fileType}`);
        }
      } catch (extractionError) {
        console.error(`⚠️ Text extraction failed for ${fileName}:`, extractionError);
        // Don't fail the entire operation if extraction fails
        // The file is still saved, just without a transcript
      }

      // 3. If text was extracted, save transcript
      if (extractedText && extractedText.trim().length > 0) {
        await this.prisma.transcript.create({
          data: {
            content: extractedText,
            fileId: file.id,
          },
        });

        console.log(`📝 Transcript created for file ${file.id} (${extractedText.length} characters)`);
      }

      // 4. Return FileEntity
      return new FileEntity(
        file.id,
        file.name,
        file.type,
        file.size,
        file.url
      );

    } catch (error) {
      console.error(`❌ Failed to process file ${fileName}:`, error);
      throw new Error(
        `Failed to ingest file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get file by ID
   * @param fileId - Database file ID
   * @returns File with optional transcript
   */
  async getFile(fileId: string) {
    return this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        transcripts: true,
      },
    });
  }

  /**
   * Get all files for a project
   * @param projectId - Project ID
   * @returns Array of files with transcripts
   */
  async getProjectFiles(projectId: string) {
    return this.prisma.file.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        transcripts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete a file and its associated data
   * @param fileId - Database file ID
   */
  async deleteFile(fileId: string) {
    // Delete transcripts first (cascade should handle this, but being explicit)
    await this.prisma.transcript.deleteMany({
      where: { fileId },
    });

    // Delete file record
    await this.prisma.file.delete({
      where: { id: fileId },
    });

    console.log(`🗑️ File ${fileId} and associated data deleted`);
  }
}

// Legacy function for backwards compatibility
export async function ingestFile(_input: { 
  name: string; 
  mimeType: string; 
  size: number; 
  url?: string 
}): Promise<FileEntity> {
  const id = Math.random().toString(36).slice(2);
  return new FileEntity(id, _input.name, _input.mimeType, _input.size, _input.url);
}

