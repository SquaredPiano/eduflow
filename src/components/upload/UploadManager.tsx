"use client";

import { useState, useEffect } from "react";
import { FileUploadDropzone } from "@/components/upload/FileUploadDropzone";
import { FileList } from "@/components/upload/FileList";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { useUpload } from "@/hooks/useUpload";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: string;
  hasTranscript?: boolean;
}

/**
 * Phase 2 Upload Manager Component
 * 
 * Complete upload management interface featuring:
 * - Drag-and-drop file upload via UploadThing
 * - Real-time upload progress tracking
 * - File list with metadata display
 * - File deletion capability
 * - Integration with text extraction backend
 */
export function UploadManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const { isUploading, uploadProgress } = useUpload();
  const [currentFileName, setCurrentFileName] = useState<string>();

  // Fetch user's files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleUploadComplete = async (uploadedFiles: Array<{ url: string; key: string; name: string }>) => {
    console.log('Upload complete:', uploadedFiles);
    // Refresh file list after upload
    await fetchFiles();
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error.message}`);
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Update local state
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Manager
        </h1>
        <p className="text-gray-600">
          Upload and manage your course files. Supported formats: PDF, DOCX, PPTX, MP4, MP3
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        
        <FileUploadDropzone 
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <UploadProgress
              progress={uploadProgress}
              isUploading={isUploading}
              fileName={currentFileName}
            />
          </div>
        )}
      </div>

      {/* Files List Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Files</h2>
          <span className="text-sm text-gray-500">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>

        <FileList 
          files={files}
          onDelete={handleDelete}
          isLoading={isLoadingFiles}
        />
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          📌 How it works
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Files are automatically uploaded to secure cloud storage</li>
          <li>• PDF, DOCX, and PPTX files are processed for text extraction</li>
          <li>• Video and audio files will be transcribed in Phase 3</li>
          <li>• All files are associated with your account</li>
        </ul>
      </div>
    </div>
  );
}
