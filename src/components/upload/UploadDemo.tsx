"use client";

import { useState } from "react";
import { FileUploadButton } from "./FileUploadButton";
import { FileUploadDropzone } from "./FileUploadDropzone";

interface UploadedFile {
  url: string;
  key: string;
  name: string;
}

export function UploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUploadComplete = (files: UploadedFile[]) => {
    console.log("Files uploaded:", files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleUploadError = (error: Error) => {
    alert(`Upload Error: ${error.message}`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Button</h2>
        <div className="py-4">
          <FileUploadButton 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Dropzone</h2>
        <div className="py-4">
          <FileUploadDropzone 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Uploaded Files</h2>
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li key={file.key} className="flex items-center justify-between p-3 border rounded">
                <span className="truncate">{file.name}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 text-blue-600 hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
