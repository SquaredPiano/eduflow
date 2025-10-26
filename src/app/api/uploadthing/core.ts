import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
    .input(z.object({ projectId: z.string().optional() }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      try {
        console.log("🔍 Upload middleware starting...");
        console.log("📦 Input:", input);
        
        const session = await getSession();
        console.log("👤 Session:", session ? "Found" : "Not found");
        
        // Check if user is authenticated
        if (!session?.user) {
          console.error("❌ No session or user found");
          throw new UploadThingError("Unauthorized - Please log in to upload files");
        }
        
        console.log("✅ Authenticated upload for user:", session.user.email);
        
        // Get database user by email (simpler approach)
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        
        console.log("🔍 Database user lookup:", dbUser ? "Found" : "Creating new user");
        
        if (!dbUser) {
          // Create user if doesn't exist
          const newUser = await prisma.user.create({
            data: {
              email: session.user.email,
              name: session.user.name || '',
              auth0Id: session.user.sub,
            },
          });
          console.log("✅ Created new user:", newUser.id);
          
          // Validate projectId if provided
          if (input?.projectId) {
            const project = await prisma.project.findFirst({
              where: {
                id: input.projectId,
                userId: newUser.id,
              },
            });
            
            if (!project) {
              console.error("❌ Project not found:", input.projectId);
              throw new UploadThingError("Project not found or access denied");
            }
            console.log("✅ Project validated:", project.id);
          }
          
          return { 
            userId: newUser.id,
            userEmail: newUser.email,
            projectId: input?.projectId,
          };
        }
        
        // Validate projectId if provided
        if (input?.projectId) {
          const project = await prisma.project.findFirst({
            where: {
              id: input.projectId,
              userId: dbUser.id,
            },
          });
          
          if (!project) {
            console.error("❌ Project not found:", input.projectId);
            throw new UploadThingError("Project not found or access denied");
          }
          console.log("✅ Project validated:", project.id);
        }
        
        console.log("✅ Middleware complete, returning metadata");
        
        // Return user metadata for use in onUploadComplete
        return { 
          userId: dbUser.id,
          userEmail: dbUser.email,
          projectId: input?.projectId,
        };
      } catch (error) {
        console.error("❌ Upload middleware error:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        throw new UploadThingError(error instanceof Error ? error.message : "Authentication failed");
      }
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
            mimeType: file.type,
            userId: metadata.userId,
            projectId: metadata.projectId,
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
