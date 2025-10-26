import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";

const f = createUploadthing();

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
      // TODO: Uncomment this once Auth0 integration is complete (Phase 1)
      // const session = await getSession();
      // if (!session?.user) throw new UploadThingError("Unauthorized");
      // return { userId: session.user.sub };

      // TEMPORARY: Allow uploads without authentication for testing
      // This should be removed once Auth0 is integrated
      console.log("⚠️  TEMP: Allowing unauthenticated upload for testing");
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: "temp-user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file key", file.key);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { 
        uploadedBy: metadata.userId, 
        fileUrl: file.url,
        fileKey: file.key 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
