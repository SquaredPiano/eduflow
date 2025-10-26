"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadDropzoneProps {
  onUploadComplete?: (files: Array<{ url: string; key: string; name: string }>) => void;
  onUploadError?: (error: Error) => void;
  endpoint?: keyof OurFileRouter;
}

export function FileUploadDropzone({ 
  onUploadComplete, 
  onUploadError,
  endpoint = "courseFiles"
}: FileUploadDropzoneProps) {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onUploadBegin={(name) => {
        console.log("Uploading:", name);
      }}
      onClientUploadComplete={(res) => {
        console.log("Upload complete:", res);
        onUploadComplete?.(res.map(r => ({ 
          url: r.url, 
          key: r.key, 
          name: r.name 
        })));
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error);
        onUploadError?.(error);
      }}
    />
  );
}
