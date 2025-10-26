import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD
import { TextExtractorAdapter } from "@/adapters/text-extractor.adapter";
=======
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6

const f = createUploadthing();
const prisma = new PrismaClient();

<<<<<<< HEAD
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
 * Extract text from a file in the background and save to database
 */
async function extractTextInBackground(
  fileId: string,
  fileUrl: string,
  mimeType: string
): Promise<void> {
  try {
    console.log(`🔍 Starting background text extraction for file ${fileId}`);
    
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

=======
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseFiles: f({
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
      
<<<<<<< HEAD
      // Check if user is authenticated
      if (!session?.user) {
        throw new UploadThingError("Unauthorized - Please log in to upload files");
      }
      
      // Get the Auth0 user ID (sub) and email
      const auth0Id = session.user.sub;
      const userEmail = session.user.email;
      
      if (!auth0Id || !userEmail) {
        throw new UploadThingError("Invalid session - missing user information");
      }
      
      // Get the database user ID from Auth0 ID
      // The user should already exist in database due to middleware sync
      const dbUser = await prisma.user.findUnique({
        where: { auth0Id },
        select: { id: true },
      });
      
      if (!dbUser) {
        throw new UploadThingError("User not found in database");
      }
      
      console.log(`✅ Upload authorized for user: ${userEmail}`);
      
      // Return user metadata for use in onUploadComplete
      return { 
        userId: dbUser.id,  // Use database user ID, not Auth0 ID
        userEmail: userEmail,
=======
      // TODO: Once Auth0 is properly implemented in src/lib/auth.ts,
      // this will work correctly. For now, uncomment the lines below:
      
      // Check if user is authenticated
      // if (!session?.user) {
      //   throw new UploadThingError("Unauthorized - Please log in to upload files");
      // }
      
      // TEMPORARY: Allow uploads without authentication for testing
      // Remove this once Auth0 integration is complete
      console.log("⚠️  TEMP: Allowing unauthenticated upload (Auth0 stub)");
      
      // Return user metadata for use in onUploadComplete
      // When Auth0 is implemented, uncomment:
      // return { 
      //   userId: session.user.sub,
      //   userEmail: session.user.email,
      // };
      
      // Temporary fallback:
      return { 
        userId: "temp-user-id",
        userEmail: "temp@example.com",
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6
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

<<<<<<< HEAD
        console.log("✅ File saved to database with ID:", savedFile.id);

        // Trigger async text extraction for supported file types
        // Don't await this - let it happen in the background
        if (file.type && shouldExtractText(file.type)) {
          extractTextInBackground(savedFile.id, file.url, file.type)
            .catch((error: unknown) => {
              console.error(`⚠️ Background text extraction failed for ${savedFile.id}:`, error);
            });
        }
=======
        console.log("File saved to database with ID:", savedFile.id);
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6

        // Return data to client
        return { 
          uploadedBy: metadata.userId,
          fileId: savedFile.id,
          fileUrl: file.url,
          fileKey: file.key,
        };
      } catch (error) {
<<<<<<< HEAD
        console.error("❌ Failed to save file to database:", error);
=======
        console.error("Failed to save file to database:", error);
>>>>>>> 84775036be9bab114f96f7afe5cf694334b47fb6
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
