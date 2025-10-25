# 🔍 Phase 2 Implementation Audit

**Audit Date**: October 25, 2025  
**Phase**: File Ingestion & Storage (Days 3-4)  
**Status**: ❌ NOT STARTED (0% Complete)

---

## 📊 Executive Summary

Phase 2 has **NOT been started**. Only stub files and placeholder code exist. Before beginning Phase 2, **Phase 1 must be completed first** as file uploads require user authentication context.

### Critical Blocker: Phase 1 Incomplete
⚠️ **Phase 1 is only 60% complete** - Auth0 integration is missing, which is required for Phase 2 because:
- File uploads need user authentication (userId)
- Files must be associated with authenticated users
- Protected API routes require session validation
- Supabase storage policies need user context

### Overall Scoring
- ❌ **UploadThing Integration**: 0% Complete
- ❌ **Ingest Service**: 5% Complete (stub only)
- ❌ **Text Extraction**: 0% Complete
- ❌ **Upload UI**: 0% Complete
- ❌ **API Route**: 5% Complete (stub only)
- ❌ **Dependencies**: 0% Complete

**Overall Phase 2 Completion: 2%** (only stubs exist)

---

## ❌ Phase 2 Requirements - All Missing

### 1. UploadThing Integration ❌ (0%)

**Status**: Not implemented - empty placeholder class

#### Current State:
```typescript
// src/adapters/uploadthing.adapter.ts
export class UploadThingAdapter {
  // Placeholder for upload integration
}
```

#### Required Implementation:
```typescript
// src/adapters/uploadthing.adapter.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  courseFiles: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    image: { maxFileSize: "4MB", maxFileCount: 20 },
    video: { maxFileSize: "256MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      maxFileSize: "32MB",
      maxFileCount: 10
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 10
    }
  })
    .middleware(async ({ req }) => {
      const session = await getSession();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.sub };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file metadata to database
      const prisma = new PrismaClient();
      await prisma.file.create({
        data: {
          name: file.name,
          type: file.type,
          url: file.url,
          size: file.size,
          userId: metadata.userId,
        }
      });
      return { fileId: file.key };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
```

#### Missing Files:
```bash
❌ src/app/api/uploadthing/core.ts        # UploadThing configuration
❌ src/app/api/uploadthing/route.ts       # UploadThing API route
```

#### Missing Dependencies:
```bash
❌ uploadthing                            # UploadThing SDK
❌ @uploadthing/react                     # React components/hooks
```

---

### 2. Ingest Service ❌ (5%)

**Status**: Minimal stub exists - no real functionality

#### Current State:
```typescript
// src/services/ingest.service.ts
import type { FileEntity } from '../domain/entities/FileEntity'

// Handles upload bookkeeping and preprocessing (stub)
export async function ingestFile(_input: { 
  name: string; 
  mimeType: string; 
  size: number; 
  url?: string 
}): Promise<FileEntity> {
  const id = Math.random().toString(36).slice(2)
  const { FileEntity } = await import('../domain/entities/FileEntity')
  return new FileEntity(id, _input.name, _input.mimeType, _input.size, _input.url)
}
```

#### Required Implementation:
```typescript
// src/services/ingest.service.ts
import { PrismaClient } from '@prisma/client';
import { ITextExtractor } from '@/domain/interfaces/ITextExtractor';
import { IRepository } from '@/domain/interfaces/IRepository';
import { FileEntity } from '@/domain/entities/FileEntity';

export class IngestService {
  constructor(
    private prisma: PrismaClient,
    private textExtractor: ITextExtractor
  ) {}

  async processFile(
    fileUrl: string, 
    fileName: string, 
    fileType: string,
    userId: string,
    courseId?: string
  ): Promise<FileEntity> {
    // 1. Extract text based on file type
    let extractedText: string | null = null;
    
    switch (fileType) {
      case 'application/pdf':
        extractedText = await this.textExtractor.extractFromPDF(fileUrl);
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        extractedText = await this.textExtractor.extractFromPPTX(fileUrl);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        extractedText = await this.textExtractor.extractFromDOCX(fileUrl);
        break;
      case 'video/mp4':
      case 'audio/mpeg':
        // Will be handled by transcribe service (Phase 3)
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // 2. Save to database
    const file = await this.prisma.file.create({
      data: {
        name: fileName,
        type: fileType,
        url: fileUrl,
        courseId: courseId,
        userId: userId,
      }
    });

    // 3. If text was extracted, create transcript entry
    if (extractedText) {
      await this.prisma.transcript.create({
        data: {
          content: extractedText,
          fileId: file.id,
        }
      });
    }

    return new FileEntity(
      file.id, 
      file.name, 
      file.type, 
      0, // Size not stored in current schema
      file.url
    );
  }
}
```

#### Missing Interface:
```typescript
❌ src/domain/interfaces/ITextExtractor.ts

// Required interface:
export interface ITextExtractor {
  extractFromPDF(fileUrl: string): Promise<string>;
  extractFromPPTX(fileUrl: string): Promise<string>;
  extractFromDOCX(fileUrl: string): Promise<string>;
}
```

---

### 3. Text Extraction Adapters ❌ (0%)

**Status**: Not implemented - critical for document processing

#### Missing Adapters:
```bash
❌ src/adapters/pdf.adapter.ts            # PDF text extraction
❌ src/adapters/pptx.adapter.ts           # PowerPoint extraction
❌ src/adapters/docx.adapter.ts           # Word document extraction
```

#### Required Implementations:

##### PDF Adapter:
```typescript
// src/adapters/pdf.adapter.ts
import pdf from 'pdf-parse';

export class PDFAdapter {
  async extractText(fileUrl: string): Promise<string> {
    // Download PDF from URL
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    
    // Extract text
    const data = await pdf(Buffer.from(buffer));
    return data.text;
  }
}
```

##### DOCX Adapter:
```typescript
// src/adapters/docx.adapter.ts
import mammoth from 'mammoth';

export class DOCXAdapter {
  async extractText(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer)
    });
    
    return result.value;
  }
}
```

##### PPTX Adapter:
```typescript
// src/adapters/pptx.adapter.ts
import officegen from 'officegen';

export class PPTXAdapter {
  async extractText(fileUrl: string): Promise<string> {
    // PPTX extraction is more complex - may need external library
    // Options: use pptx2json or call external API
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    
    // Implement PPTX parsing
    // This is a placeholder - actual implementation needed
    throw new Error('PPTX extraction not yet implemented');
  }
}
```

#### Missing Dependencies:
```bash
❌ pdf-parse ^1.1.1                       # PDF text extraction
❌ mammoth ^1.8.0                         # DOCX extraction
❌ officegen or alternative               # PPTX extraction (or use API)
```

---

### 4. API Route Handler ❌ (5%)

**Status**: Stub exists - returns mock response

#### Current State:
```typescript
// src/app/api/ingest/route.ts
import { NextResponse } from 'next/server'

// Handles uploads & preprocessing
export async function POST(req: Request) {
  // TODO: parse multipart/form-data, store file, enqueue preprocessing
  return NextResponse.json({ ok: true, endpoint: 'ingest' })
}
```

#### Required Implementation:
```typescript
// src/app/api/ingest/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { IngestService } from '@/services/ingest.service';
import { PrismaClient } from '@prisma/client';
import { TextExtractorAdapter } from '@/adapters/text-extractor.adapter';

export async function POST(req: Request) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // 2. Parse request body
    const { fileUrl, fileName, fileType, courseId } = await req.json();

    // 3. Validate inputs
    if (!fileUrl || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 4. Process file
    const prisma = new PrismaClient();
    const textExtractor = new TextExtractorAdapter();
    const ingestService = new IngestService(prisma, textExtractor);

    const fileEntity = await ingestService.processFile(
      fileUrl,
      fileName,
      fileType,
      session.user.sub,
      courseId
    );

    // 5. Return success
    return NextResponse.json({
      success: true,
      fileId: fileEntity.id,
      message: 'File ingested successfully'
    });

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest file' },
      { status: 500 }
    );
  }
}
```

---

### 5. Upload UI Components ❌ (0%)

**Status**: Not implemented - no UI exists

#### Missing Components:
```bash
❌ src/components/upload/UploadZone.tsx   # Drag-and-drop upload area
❌ src/components/upload/FileList.tsx     # List of uploaded files
❌ src/components/upload/UploadProgress.tsx # Progress indicator
```

#### Required Upload Zone Component:
```typescript
// src/components/upload/UploadZone.tsx
'use client';

import { useDropzone } from 'react-dropzone';
import { useUploadThing } from '@/lib/uploadthing';
import { Upload, File, X } from 'lucide-react';
import { useState } from 'react';

export function UploadZone({ courseId }: { courseId?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { startUpload } = useUploadThing("courseFiles", {
    onClientUploadComplete: (res) => {
      console.log('Upload complete:', res);
      setFiles([]);
      setUploading(false);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setUploading(false);
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'video/mp4': ['.mp4'],
      'audio/mpeg': ['.mp3'],
    },
    maxSize: 256 * 1024 * 1024, // 256MB
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    await startUpload(files);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, PPTX, DOCX, MP4, MP3 (up to 256MB)
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg
                     hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Missing Dependencies:
```bash
❌ react-dropzone                         # Drag-and-drop functionality
❌ lucide-react                           # Icons
```

---

### 6. Custom Hook ⚠️ (10%)

**Status**: Basic stub exists, needs Auth0 integration

#### Current State:
```typescript
// src/hooks/useUpload.ts
'use client'

export function useUpload() {
  async function ingest(formData: FormData) {
    const res = await fetch('/api/ingest', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Ingest failed')
    return res.json()
  }
  return { ingest }
}
```

#### Required Enhancement:
```typescript
// src/hooks/useUpload.ts
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error('Not authenticated');

      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate file queries to refetch
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setProgress(0);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setProgress(0);
    },
  });

  const ingest = (formData: FormData) => {
    return uploadMutation.mutateAsync(formData);
  };

  return {
    ingest,
    isUploading: uploadMutation.isPending,
    progress,
    error: uploadMutation.error,
  };
}

export default useUpload;
```

---

### 7. Supabase Storage Integration ❌ (0%)

**Status**: Not implemented - no storage configuration

#### Required Configuration:
```typescript
// src/adapters/supabase.adapter.ts
import { createClient } from '@supabase/supabase-js';

export class SupabaseAdapter {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async uploadFile(
    file: File, 
    userId: string, 
    courseId?: string
  ): Promise<string> {
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const bucket = courseId ? `course-${courseId}` : 'general';

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const path = new URL(fileUrl).pathname;
    const { error } = await this.supabase.storage
      .from('files')
      .remove([path]);

    if (error) throw error;
  }
}
```

#### Missing Supabase Setup:
```bash
❌ Supabase storage buckets not created
❌ Storage policies not configured
❌ RLS (Row Level Security) not set up
```

---

## 📋 Phase 2 Checklist

### Prerequisites (Must Complete Phase 1 First):
- [ ] **Complete Phase 1** - Auth0 integration is REQUIRED
- [ ] User authentication working
- [ ] Protected routes implemented
- [ ] `getSession()` function available
- [ ] User database table populated

### Dependencies to Install:
```bash
npm install --save \
  uploadthing \
  @uploadthing/react \
  pdf-parse \
  mammoth \
  react-dropzone \
  lucide-react \
  @supabase/supabase-js \
  @tanstack/react-query
```

### Files to Create:

#### 1. UploadThing Setup (Critical):
- [ ] `src/app/api/uploadthing/core.ts` - UploadThing configuration
- [ ] `src/app/api/uploadthing/route.ts` - API route handler
- [ ] `src/lib/uploadthing.ts` - Client-side utilities

#### 2. Text Extraction Adapters:
- [ ] `src/adapters/pdf.adapter.ts` - PDF text extraction
- [ ] `src/adapters/docx.adapter.ts` - Word doc extraction
- [ ] `src/adapters/pptx.adapter.ts` - PowerPoint extraction
- [ ] `src/adapters/text-extractor.adapter.ts` - Unified interface

#### 3. Domain Interfaces:
- [ ] `src/domain/interfaces/ITextExtractor.ts`

#### 4. Service Layer:
- [ ] Complete `src/services/ingest.service.ts` - Full implementation
- [ ] Update `src/adapters/supabase.adapter.ts` - Storage methods

#### 5. API Routes:
- [ ] Complete `src/app/api/ingest/route.ts` - Full implementation

#### 6. UI Components:
- [ ] `src/components/upload/UploadZone.tsx` - Drag-and-drop zone
- [ ] `src/components/upload/FileList.tsx` - File display
- [ ] `src/components/upload/UploadProgress.tsx` - Progress indicator

#### 7. Hooks:
- [ ] Enhance `src/hooks/useUpload.ts` - Add Auth0 + React Query

#### 8. Supabase Configuration:
- [ ] Create storage bucket(s) in Supabase dashboard
- [ ] Configure storage policies (authenticated users only)
- [ ] Set up RLS policies for File table
- [ ] Get `SUPABASE_SERVICE_ROLE_KEY` from dashboard

#### 9. Integration:
- [ ] Add UploadZone component to Dashboard
- [ ] Test file upload flow end-to-end
- [ ] Verify text extraction works for PDFs
- [ ] Verify files appear in database
- [ ] Test error handling

---

## 🚧 Blockers & Dependencies

### Critical Blocker:
**Phase 1 Not Complete** (60% done)
- Auth0 integration missing
- User authentication required for file uploads
- Cannot associate files with users without auth

### Dependency Chain:
```
Phase 1 (Auth0) 
    ↓
User Authentication Working
    ↓
Phase 2 (File Upload)
    ↓
Files in Database
    ↓
Phase 3 (Transcription)
```

---

## 🎯 Recommended Action Plan

### Option 1: Complete Phase 1 First (RECOMMENDED)
**Time**: 30-45 minutes for Phase 1, then 3-4 hours for Phase 2

1. **Complete Phase 1** (see PHASE_1_AUDIT.md):
   - Install `@auth0/nextjs-auth0`
   - Create Auth0 route handler
   - Implement AuthProvider
   - Push Prisma schema
   - Test login flow

2. **Then Start Phase 2**:
   - Install dependencies
   - Set up UploadThing
   - Implement text extraction
   - Build upload UI
   - Test end-to-end

### Option 2: Parallel Development (NOT RECOMMENDED)
Work on Phase 2 without auth, then retrofit later
- **Risk**: Major refactoring required
- **Reason**: All file operations need user context
- **Not Advisable**: Will create technical debt

---

## 📊 Phase 2 Deliverables (Per Implementation Plan)

| Deliverable | Status | Completion |
|-------------|--------|------------|
| UploadThing integration | ❌ Not Started | 0% |
| File upload UI component | ❌ Not Started | 0% |
| `/api/ingest` route handler | ⚠️ Stub Only | 5% |
| Text extraction for PDF | ❌ Not Started | 0% |
| Text extraction for PPTX | ❌ Not Started | 0% |
| Text extraction for DOCX | ❌ Not Started | 0% |
| Files saved to Supabase | ❌ Not Started | 0% |
| File metadata in database | ❌ Not Started | 0% |

### Overall Phase 2 Score: **2/100**

---

## 🚀 Next Steps

### Immediate Priority:
1. **Stop and complete Phase 1 first** ⚠️
   - See `PHASE_1_AUDIT.md` for action plan
   - Auth0 is blocking Phase 2

### After Phase 1 Complete:
2. **Install Phase 2 dependencies** (5 minutes)
3. **Set up UploadThing** (30 minutes)
   - Create API routes
   - Configure file types and limits
   - Test with simple upload

4. **Implement text extraction** (1-2 hours)
   - PDF adapter (easiest)
   - DOCX adapter (medium)
   - PPTX adapter (consider external API)

5. **Build upload UI** (1 hour)
   - UploadZone component
   - Drag-and-drop functionality
   - Progress indicators

6. **Test end-to-end** (30 minutes)
   - Upload PDF → verify in Supabase
   - Check text extraction
   - Verify database entries

**Estimated Time for Phase 2: 3-4 hours** (after Phase 1 complete)

---

## 💡 Technical Recommendations

### For Text Extraction:
1. **PDF**: Use `pdf-parse` (simple, reliable)
2. **DOCX**: Use `mammoth` (good quality)
3. **PPTX**: Consider external API (e.g., Cloudmersive, Adobe PDF Services)
   - PPTX parsing in Node.js is complex
   - External API may be faster to implement

### For File Storage:
1. **Use UploadThing** for actual file uploads (handles CDN, optimization)
2. **Use Supabase Storage** only if you need direct control
3. **UploadThing is recommended** - easier setup, better DX

### For Error Handling:
1. Add file type validation in UI
2. Add file size validation before upload
3. Implement retry logic for failed uploads
4. Show user-friendly error messages

---

## 📝 Conclusion

Phase 2 is **not started** (2% complete with only stubs). More critically, **Phase 1 is incomplete**, which is a hard blocker for Phase 2 since file uploads require user authentication.

**Critical Path**:
1. Complete Phase 1 (30-45 min) ← **DO THIS FIRST**
2. Install Phase 2 dependencies (5 min)
3. Implement Phase 2 (3-4 hours)

**Risk Assessment**:
- **High Risk**: Starting Phase 2 without Phase 1 complete
- **Medium Risk**: PPTX text extraction (may need external service)
- **Low Risk**: PDF and DOCX extraction (well-supported libraries)

**Recommendation**: Complete Phase 1 authentication before proceeding with Phase 2 file uploads. This ensures proper user context, security, and data isolation from the start.

---

## 📞 What You Can Provide

Since you mentioned you can provide API keys, here's what's needed:

### Already Have (From .env.local):
- ✅ UPLOADTHING_TOKEN
- ✅ DATABASE_URL
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY

### Still Need:
- ⚠️ SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard → Settings → API)
  - Required for server-side storage operations
  - Has admin privileges for RLS bypass

### Optional (Phase 3+):
- DROPLET_HOST (Digital Ocean droplet IP for Whisper)
- ELEVENLABS_API_KEY (Phase 8 - text-to-speech)

**Action**: Get `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings and add to `.env.local`.

---

**Next Phase**: After completing Phase 1 and Phase 2, Phase 3 (Whisper Transcription) will handle video/audio files uploaded in Phase 2.
