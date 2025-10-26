import { PrismaClient } from '@prisma/client';
import { ITextExtractor } from '@/domain/interfaces/ITextExtractor';
import { FileEntity } from '@/domain/entities/FileEntity';

/**
 * Service responsible for ingesting uploaded files into the system
 * 
 * This service handles the complete ingestion pipeline:
 * 1. Extracts text content from supported document types
 * 2. Saves file metadata to the database
 * 3. Creates transcript records for extracted text
 * 4. Returns a FileEntity for further processing
 * 
 * Supported file types:
 * - PDF documents (application/pdf)
 * - PowerPoint presentations (application/vnd.openxmlformats-officedocument.presentationml.presentation)
 * - Word documents (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
 * - Video files (video/mp4) - queued for transcription
 * - Audio files (audio/mpeg) - queued for transcription
 * 
 * @class IngestService
 */
export class IngestService {
  constructor(
    private prisma: PrismaClient,
    private textExtractor: ITextExtractor
  ) {}

  /**
   * Process an uploaded file through the ingestion pipeline
   * 
   * @param fileUrl - Public URL where the file can be accessed
   * @param fileName - Original name of the uploaded file
   * @param fileType - MIME type of the file
   * @param userId - ID of the user who uploaded the file
   * @param courseId - Optional ID of the course this file belongs to
   * @returns FileEntity representing the ingested file
   * @throws Error if file type is unsupported or processing fails
   */
  async processFile(
    fileUrl: string,
    fileName: string,
    fileType: string,
    userId: string,
    courseId?: string
  ): Promise<FileEntity> {
    console.log(`[IngestService] Processing file: ${fileName} (${fileType})`);

    // STEP 1: Extract text based on file type
    let extractedText: string | null = null;

    try {
      switch (fileType) {
        case 'application/pdf':
          console.log('[IngestService] Extracting text from PDF...');
          extractedText = await this.textExtractor.extractFromPDF(fileUrl);
          console.log(`[IngestService] Extracted ${extractedText.length} characters from PDF`);
          break;

        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          console.log('[IngestService] Extracting text from PPTX...');
          extractedText = await this.textExtractor.extractFromPPTX(fileUrl);
          console.log(`[IngestService] Extracted ${extractedText.length} characters from PPTX`);
          break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          console.log('[IngestService] Extracting text from DOCX...');
          extractedText = await this.textExtractor.extractFromDOCX(fileUrl);
          console.log(`[IngestService] Extracted ${extractedText.length} characters from DOCX`);
          break;

        case 'video/mp4':
        case 'video/quicktime':
        case 'video/x-msvideo':
          console.log('[IngestService] Video file detected - will be transcribed in Phase 3');
          // Video files will be handled by the transcription service in Phase 3
          break;

        case 'audio/mpeg':
        case 'audio/wav':
        case 'audio/mp4':
          console.log('[IngestService] Audio file detected - will be transcribed in Phase 3');
          // Audio files will be handled by the transcription service in Phase 3
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (extractionError) {
      console.error('[IngestService] Text extraction failed:', extractionError);
      // Continue with file creation even if extraction fails
      // This allows the file to be stored and potentially re-processed later
      extractedText = null;
    }

    // STEP 2: Save file metadata to database
    console.log('[IngestService] Saving file metadata to database...');
    const file = await this.prisma.file.create({
      data: {
        name: fileName,
        type: fileType,
        url: fileUrl,
        courseId: courseId || null,
        userId: userId,
      },
    });
    console.log(`[IngestService] File saved with ID: ${file.id}`);

    // STEP 3: If text was extracted, create transcript entry
    if (extractedText && extractedText.trim().length > 0) {
      console.log('[IngestService] Creating transcript record...');
      await this.prisma.transcript.create({
        data: {
          content: extractedText,
          fileId: file.id,
        },
      });
      console.log('[IngestService] Transcript record created');
    } else {
      console.log('[IngestService] No text extracted - skipping transcript creation');
    }

    // STEP 4: Return domain entity
    const fileEntity = new FileEntity(
      file.id,
      file.name,
      file.type,
      0, // Size not stored in current Prisma schema
      file.url
    );

    console.log(`[IngestService] File ingestion complete: ${file.id}`);
    return fileEntity;
  }

  /**
   * Batch process multiple files
   * 
   * @param files - Array of file information to process
   * @returns Array of FileEntity objects for successfully processed files
   */
  async processMultipleFiles(
    files: Array<{
      fileUrl: string;
      fileName: string;
      fileType: string;
      userId: string;
      courseId?: string;
    }>
  ): Promise<FileEntity[]> {
    console.log(`[IngestService] Batch processing ${files.length} files...`);

    const results = await Promise.allSettled(
      files.map((file) =>
        this.processFile(
          file.fileUrl,
          file.fileName,
          file.fileType,
          file.userId,
          file.courseId
        )
      )
    );

    const successfulFiles = results
      .filter((result): result is PromiseFulfilledResult<FileEntity> => 
        result.status === 'fulfilled'
      )
      .map((result) => result.value);

    const failedCount = results.length - successfulFiles.length;
    if (failedCount > 0) {
      console.warn(`[IngestService] ${failedCount} files failed to process`);
    }

    console.log(`[IngestService] Batch processing complete: ${successfulFiles.length}/${files.length} successful`);
    return successfulFiles;
  }
}