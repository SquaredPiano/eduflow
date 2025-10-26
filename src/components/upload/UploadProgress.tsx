"use client";

import { CheckCircle, XCircle, Loader2, Upload } from "lucide-react";

interface UploadProgressProps {
  /** Current upload progress (0-100) */
  progress: number;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** File name being uploaded */
  fileName?: string;
  /** Upload completed successfully */
  isComplete?: boolean;
  /** Upload failed */
  hasError?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

/**
 * UploadProgress Component
 * 
 * Shows visual upload progress with status indicators.
 * Displays progress bar, file name, and completion/error states.
 */
export function UploadProgress({
  progress,
  isUploading,
  fileName,
  isComplete = false,
  hasError = false,
  errorMessage,
}: UploadProgressProps) {
  if (!isUploading && !isComplete && !hasError) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="shrink-0">
          {isUploading && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          )}
          {isComplete && !hasError && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {hasError && (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* File Name */}
          {fileName && (
            <p className="text-sm font-medium truncate mb-1">{fileName}</p>
          )}

          {/* Status Text */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">
              {isUploading && "Uploading..."}
              {isComplete && !hasError && "Upload complete"}
              {hasError && "Upload failed"}
            </span>
            {isUploading && (
              <span className="text-xs font-medium text-blue-600">
                {progress}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Error Message */}
          {hasError && errorMessage && (
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          )}

          {/* Processing Message */}
          {isComplete && !hasError && (
            <p className="text-xs text-gray-500 mt-1">
              Processing file... Text extraction in progress.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * MultiUploadProgress Component
 * 
 * Shows progress for multiple file uploads
 */
interface MultiUploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    progress: number;
    isComplete: boolean;
    hasError: boolean;
    errorMessage?: string;
  }>;
}

export function MultiUploadProgress({ uploads }: MultiUploadProgressProps) {
  if (uploads.length === 0) return null;

  const totalProgress = uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length;
  const completedCount = uploads.filter(u => u.isComplete).length;
  const errorCount = uploads.filter(u => u.hasError).length;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
      {/* Overall Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">
            Uploading {uploads.length} file{uploads.length > 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {completedCount}/{uploads.length} complete
        </span>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Individual Files */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {uploads.map((upload) => (
          <div key={upload.id} className="flex items-center gap-2 text-xs">
            {upload.isComplete && !upload.hasError && (
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            )}
            {upload.hasError && (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {!upload.isComplete && !upload.hasError && (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            )}
            <span className="truncate flex-1">{upload.fileName}</span>
            {!upload.isComplete && !upload.hasError && (
              <span className="text-gray-500">{upload.progress}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Error Summary */}
      {errorCount > 0 && (
        <p className="text-xs text-red-600">
          {errorCount} file{errorCount > 1 ? 's' : ''} failed to upload
        </p>
      )}
    </div>
  );
}

