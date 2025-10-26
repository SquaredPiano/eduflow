import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

/**
 * Check if a file type should have text extracted
 */
function shouldExtractText(mimeType: string): boolean {
  const textExtractionTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return textExtractionTypes.includes(mimeType);
}

/**
 * Check if a file type should be transcribed with ElevenLabs
 */
function shouldTranscribe(mimeType: string): boolean {
  const transcribableTypes = [
    'audio/mpeg',        // MP3
    'audio/wav',         // WAV
    'audio/x-m4a',       // M4A
    'audio/mp4',         // M4A alternative
    'video/mp4',         // MP4
    'video/webm',        // WebM
    'video/quicktime',   // QuickTime MOV
  ];
  return transcribableTypes.includes(mimeType);
}

/**
 * Extract text from a file in the background and save to database
 */
async function extractTextInBackground(
  fileId: string,
  fileUrl: string,
  mimeType: string
): Promise<void> {
  try {
    console.log(`🔍 Starting background text extraction for file ${fileId}`);
    
    // Lazy import to avoid build-time issues with PDF libraries
    const { TextExtractorAdapter } = await import('@/adapters/text-extractor.adapter');
    const textExtractor = new TextExtractorAdapter();
    const extractedText = await textExtractor.extractText(fileUrl, mimeType);
    
    if (extractedText && extractedText.trim().length > 0) {
      await prisma.transcript.create({
        data: {
          content: extractedText,
          fileId: fileId,
        },
      });
      
      console.log(`✅ Text extraction complete for ${fileId} (${extractedText.length} characters)`);
    } else {
      console.log(`ℹ️ No text extracted from file ${fileId}`);
    }
  } catch (error) {
    console.error(`❌ Text extraction failed for ${fileId}:`, error);
    throw error;
  }
}

/**
 * Transcribe audio/video file using ElevenLabs in the background
 */
async function transcribeInBackground(fileId: string): Promise<void> {
  try {
    console.log(`🎙️ Starting background transcription for file ${fileId}`);
    
    // Call the transcribe API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transcription failed');
    }
    
    const result = await response.json();
    console.log(`✅ Transcription complete for ${fileId}:`, result.transcript.id);
  } catch (error) {
    console.error(`❌ Transcription failed for ${fileId}:`, error);
    // Don't throw - allow upload to succeed even if transcription fails
  }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  learningMaterials: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    image: { maxFileSize: "4MB", maxFileCount: 20 },
    video: { maxFileSize: "256MB", maxFileCount: 5 },
    audio: { maxFileSize: "128MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "32MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 10 },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await getSession();
      
      // Check if user is authenticated
      if (!session?.user) {
        throw new UploadThingError("Unauthorized - Please log in to upload files");
      }
      
      console.log("✅ Authenticated upload for user:", session.user.email);
      
      // Get database user to ensure they exist
      const cookieStore = await import('next/headers').then(m => m.cookies());
      const sessionCookie = (await cookieStore).get('appSession');
      if (!sessionCookie) {
        throw new UploadThingError("Session expired - Please log in again");
      }
      
      const sessionData = JSON.parse(sessionCookie.value);
      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: sessionData.user.sub },
      });
      
      if (!dbUser) {
        throw new UploadThingError("User not found in database");
      }
      
      // Return user metadata for use in onUploadComplete
      return { 
        userId: dbUser.id,
        userEmail: dbUser.email || '',
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file key", file.key);

      try {
        // Save file metadata to database
        const savedFile = await prisma.file.create({
          data: {
            name: file.name,
            type: file.type || "unknown",
            url: file.url,
            key: file.key,
            size: file.size,
            userId: metadata.userId,
            // courseId is optional - can be associated later
          },
        });

        console.log("✅ File saved to database with ID:", savedFile.id);

        // Trigger async processing based on file type
        if (file.type) {
          // Text extraction for documents
          if (shouldExtractText(file.type)) {
            extractTextInBackground(savedFile.id, file.url, file.type)
              .catch((error: unknown) => {
                console.error(`⚠️ Background text extraction failed for ${savedFile.id}:`, error);
              });
          }
          
          // ElevenLabs transcription for audio/video
          if (shouldTranscribe(file.type)) {
            transcribeInBackground(savedFile.id)
              .catch((error: unknown) => {
                console.error(`⚠️ Background transcription failed for ${savedFile.id}:`, error);
              });
          }
        }

        // Return data to client
        return { 
          uploadedBy: metadata.userId,
          fileId: savedFile.id,
          fileUrl: file.url,
          fileKey: file.key,
        };
      } catch (error) {
        console.error("❌ Failed to save file to database:", error);
        // Don't throw here - file is already uploaded
        // Return what we can
        return {
          uploadedBy: metadata.userId,
          fileUrl: file.url,
          fileKey: file.key,
          error: "Failed to save file metadata to database",
        };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
