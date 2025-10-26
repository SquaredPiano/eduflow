'use client'

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export function useUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing("courseFiles", {
    onUploadBegin: (fileName) => {
      console.log("Starting upload:", fileName);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      console.log("Upload complete:", res);
      setUploadProgress(100);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setUploadProgress(0);
    },
  });

  // Legacy ingest function for backwards compatibility
  async function ingest(formData: FormData) {
    const res = await fetch('/api/ingest', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Ingest failed')
    return res.json()
  }

  return { 
    startUpload,
    ingest,
    isUploading,
    uploadProgress,
  }
}

export default useUpload

