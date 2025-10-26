/**
 * Quercus (Canvas LMS) Integration Types
 * 
 * Types for integrating with the Quercus Canvas LMS API
 * to import courses and files into projects.
 */

// ============================================
// QUERCUS API RESPONSE TYPES
// ============================================

export interface QuercusCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: 'available' | 'unpublished' | 'completed';
  start_at?: string;
  end_at?: string;
  enrollments?: QuercusEnrollment[];
}

export interface QuercusEnrollment {
  type: 'StudentEnrollment' | 'TeacherEnrollment' | 'TaEnrollment';
  role: string;
  enrollment_state: 'active' | 'invited' | 'completed';
}

export interface QuercusFile {
  id: number;
  display_name: string;
  filename: string;
  content_type: string; // MIME type
  size: number;
  url: string;
  created_at: string;
  updated_at: string;
  locked?: boolean;
  folder_id?: number;
}

export interface QuercusFolder {
  id: number;
  name: string;
  full_name: string;
  parent_folder_id?: number;
  files_count: number;
  folders_count: number;
}

// ============================================
// IMPORT TYPES
// ============================================

export interface QuercusImportOptions {
  courseId: string;
  includeFolders?: string[]; // Specific folder IDs to import from
  fileTypes?: string[];      // Filter by MIME types (e.g., ['application/pdf'])
  maxFileSize?: number;      // Max file size in bytes
}

export interface QuercusImportResult {
  projectId: string;
  importedFiles: number;
  skippedFiles: number;
  errors: string[];
  files: Array<{
    quercusFileId: string;
    fileId: string;
    name: string;
    status: 'imported' | 'skipped' | 'error';
    error?: string;
  }>;
}

// ============================================
// INTEGRATION STATE
// ============================================

export interface QuercusConnectionStatus {
  isConnected: boolean;
  userId: string;
  lastSyncedAt?: string;
  courses?: QuercusCourse[];
}

export interface QuercusAuthConfig {
  canvasUrl: string;    // e.g., "https://q.utoronto.ca"
  apiToken: string;     // User's Canvas API token (encrypted in DB)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isQuercusFile(file: { quercusFileId?: string }): boolean {
  return !!file.quercusFileId;
}

export function isSupportedFileType(contentType: string): boolean {
  const supported = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'audio/mpeg',
  ];
  return supported.includes(contentType);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
