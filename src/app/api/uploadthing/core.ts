import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const f = createUploadthing();
const prisma = new PrismaClient();

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

        console.log("File saved to database with ID:", savedFile.id);

        // Return data to client
        return { 
          uploadedBy: metadata.userId,
          fileId: savedFile.id,
          fileUrl: file.url,
          fileKey: file.key,
        };
      } catch (error) {
        console.error("Failed to save file to database:", error);
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
