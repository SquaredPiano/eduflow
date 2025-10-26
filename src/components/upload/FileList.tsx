"use client";

import { useState } from "react";
import { File, Download, Trash2, FileText, Video, Music, Image as ImageIcon } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: string;
  hasTranscript?: boolean;
}

interface FileListProps {
  files: FileItem[];
  onDelete?: (fileId: string) => void;
  isLoading?: boolean;
}

/**
 * FileList Component
 * 
 * Displays a list of uploaded files with metadata and actions.
 * Supports deletion, downloading, and shows file type icons.
 */
export function FileList({ files, onDelete, isLoading = false }: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    if (!onDelete) return;
    
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    setDeletingId(fileId);
    try {
      await onDelete(fileId);
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-600" />;
    if (mimeType.startsWith("audio/")) return <Music className="w-5 h-5 text-pink-600" />;
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (mimeType === "application/pdf") return <FileText className="w-5 h-5 text-red-600" />;
    if (mimeType.includes("word")) return <FileText className="w-5 h-5 text-blue-700" />;
    if (mimeType.includes("presentation")) return <FileText className="w-5 h-5 text-orange-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <File className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 text-sm">No files uploaded yet</p>
        <p className="text-gray-400 text-xs mt-1">Upload files to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(file.type)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{file.name}</h3>
                {file.hasTranscript && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Processed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>

            {onDelete && (
              <button
                onClick={() => handleDelete(file.id)}
                disabled={deletingId === file.id}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete file"
              >
                {deletingId === file.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
