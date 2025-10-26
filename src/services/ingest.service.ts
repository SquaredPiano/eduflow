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
   * @param courseId - Optional course ID to associate the file with
   * @returns FileEntity representing the processed file
   */
  async processFile(
    fileUrl: string,
    fileName: string,
    fileType: string,
    fileKey: string,
    fileSize: number,
    userId: string,
    courseId?: string
  ): Promise<FileEntity> {
    console.log(`📥 [INGEST] Processing file: ${fileName}`);
    console.log(`📋 [INGEST] Type: ${fileType}, Size: ${(fileSize / 1024).toFixed(2)} KB`);

    try {
      // 1. Save file metadata to database first
      const file = await this.prisma.file.create({
        data: {
          name: fileName,
          type: fileType,
          url: fileUrl,
          key: fileKey,
          size: fileSize,
          userId: userId,
          courseId: courseId,
        },
      });

      console.log(`✅ [INGEST] File saved to database with ID: ${file.id}`);

      // 2. Extract text based on file type
      let extractedText: string | null = null;

      try {
        switch (fileType) {
          case 'application/pdf':
            console.log(`📄 [INGEST] Extracting text from PDF...`);
            extractedText = await this.textExtractor.extractFromPDF(fileUrl);
            break;
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            console.log(`📊 [INGEST] Extracting text from PPTX...`);
            extractedText = await this.textExtractor.extractFromPPTX(fileUrl);
            break;
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            console.log(`📝 [INGEST] Extracting text from DOCX...`);
            extractedText = await this.textExtractor.extractFromDOCX(fileUrl);
            break;
          case 'video/mp4':
          case 'audio/mpeg':
          case 'audio/mp3':
          case 'audio/wav':
          case 'audio/m4a':
          case 'video/webm':
          case 'video/quicktime':
            // Video and audio files will be handled by transcription service
            console.log(`🎬 [INGEST] Audio/video file detected - will be transcribed separately`);
            break;
          default:
            console.log(`ℹ️ [INGEST] Unsupported file type for text extraction: ${fileType}`);
        }
      } catch (extractionError) {
        console.error(`⚠️ [INGEST] Text extraction failed for ${fileName}:`, extractionError);
        
        // Provide helpful error context but don't fail the entire operation
        const errorMsg = extractionError instanceof Error ? extractionError.message : 'Unknown error';
        if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
          console.error(`🔒 [INGEST] File appears to be password-protected or encrypted`);
        } else if (errorMsg.includes('corrupted') || errorMsg.includes('invalid')) {
          console.error(`💥 [INGEST] File appears to be corrupted or invalid`);
        }
        
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

        console.log(`� [INGEST] Transcript created for file ${file.id} (${extractedText.length} characters)`);
      } else if (!['video/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'video/webm', 'video/quicktime'].includes(fileType)) {
        console.warn(`⚠️ [INGEST] No text content extracted from ${fileName}`);
      }

      console.log(`🎉 [INGEST] File processing complete: ${file.id}`);

      // 4. Return FileEntity
      return new FileEntity(
        file.id,
        file.name,
        file.type,
        file.size,
        file.url
      );

    } catch (error) {
      console.error(`❌ [INGEST] Failed to process file ${fileName}:`, error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to process file';
      
      if (error instanceof Error) {
        if (error.message.includes('unique constraint') || error.message.includes('duplicate')) {
          errorMessage = 'A file with this name already exists in this project.';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Invalid user or project reference. Please refresh and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'File processing timed out. The file might be too large.';
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
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
   * Get all files for a user
   * @param userId - Database user ID
   * @param courseId - Optional course ID to filter by
   * @returns Array of files with transcripts
   */
  async getUserFiles(userId: string, courseId?: string) {
    return this.prisma.file.findMany({
      where: {
        userId: userId,
        ...(courseId && { courseId }),
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
