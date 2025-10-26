"use client";

import { UploadButton } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadButtonProps {
  onUploadComplete?: (files: Array<{ url: string; key: string; name: string }>) => void;
  onUploadError?: (error: Error) => void;
  endpoint?: keyof OurFileRouter;
}

export function FileUploadButton({ 
  onUploadComplete, 
  onUploadError,
  endpoint = "courseFiles"
}: FileUploadButtonProps) {
  return (
    <UploadButton
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

