# Phase 2 Quick Reference Guide

## 🚀 Getting Started

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add-user-fields
```

### 2. Test File Upload
Visit: `/example-uploader` or use `UploadManager` component

### 3. Check Uploads
```bash
# View files in database
npx prisma studio
```

---

## 📦 Key Components

### Upload Files
```tsx
import { FileUploadDropzone } from "@/components/upload/FileUploadDropzone";

<FileUploadDropzone 
  onUploadComplete={(files) => console.log(files)}
  onUploadError={(error) => console.error(error)}
/>
```

### List Files
```tsx
import { FileList } from "@/components/upload/FileList";

<FileList 
  files={files}
  onDelete={(id) => deleteFile(id)}
  isLoading={false}
/>
```

### Show Progress
```tsx
import { UploadProgress } from "@/components/upload/UploadProgress";

<UploadProgress
  progress={50}
  isUploading={true}
  fileName="document.pdf"
/>
```

### Complete Upload Manager
```tsx
import { UploadManager } from "@/components/upload/UploadManager";

<UploadManager />
```

---

## 🔌 API Endpoints

### Get User Files
```typescript
GET /api/files

Response:
{
  success: true,
  files: [
    {
      id: "abc123",
      name: "document.pdf",
      type: "application/pdf",
      url: "https://...",
      size: 1024000,
      createdAt: "2025-10-25T...",
      hasTranscript: true
    }
  ]
}
```

### Delete File
```typescript
DELETE /api/files/[fileId]

Response:
{
  success: true,
  message: "File deleted successfully"
}
```

### Upload File (via UploadThing)
```typescript
POST /api/uploadthing/core

// Handled automatically by UploadThing React components
// Triggers background text extraction
```

---

## 🛠️ Services

### Text Extraction
```typescript
import { TextExtractorAdapter } from '@/adapters/text-extractor.adapter';

const extractor = new TextExtractorAdapter();

// Extract from PDF
const text = await extractor.extractFromPDF(fileUrl);

// Extract from DOCX
const text = await extractor.extractFromDOCX(fileUrl);

// Extract from PPTX
const text = await extractor.extractFromPPTX(fileUrl);
```

### File Ingestion
```typescript
import { IngestService } from '@/services/ingest.service';
import { PrismaClient } from '@prisma/client';
import { TextExtractorAdapter } from '@/adapters/text-extractor.adapter';

const prisma = new PrismaClient();
const textExtractor = new TextExtractorAdapter();
const ingestService = new IngestService(prisma, textExtractor);

// Process uploaded file
const fileEntity = await ingestService.processFile(
  fileUrl,      // UploadThing URL
  fileName,     // Original name
  fileType,     // MIME type
  fileKey,      // UploadThing key
  fileSize,     // Size in bytes
  userId,       // Database user ID
  courseId      // Optional course ID
);

// Get file with transcript
const file = await ingestService.getFile(fileId);

// List user files
const files = await ingestService.getUserFiles(userId, courseId);

// Delete file
await ingestService.deleteFile(fileId);
```

---

## 📝 Supported File Types

| Type | MIME Type | Max Size | Text Extraction |
|------|-----------|----------|-----------------|
| PDF | `application/pdf` | 16 MB | ✅ Yes |
| DOCX | `application/vnd...wordprocessingml.document` | 16 MB | ✅ Yes |
| PPTX | `application/vnd...presentationml.presentation` | 32 MB | ✅ Yes |
| MP4 | `video/mp4` | 256 MB | ⏳ Phase 3 |
| MP3 | `audio/mpeg` | 128 MB | ⏳ Phase 3 |
| Images | `image/*` | 4 MB | ❌ No |

---

## 🔍 Testing Commands

### Type Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

### Build
```bash
npm run build
```

### Dev Server
```bash
npm run dev
```

---

## 📊 Database Schema

### File Table
```prisma
model File {
  id          String       @id @default(cuid())
  name        String
  type        String       // MIME type
  url         String       // UploadThing URL
  key         String       // UploadThing key
  size        Int          // Bytes
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  courseId    String?
  course      Course?      @relation(fields: [courseId], references: [id])
  transcripts Transcript[]
  createdAt   DateTime     @default(now())
}
```

### Transcript Table
```prisma
model Transcript {
  id        String   @id @default(cuid())
  content   String   @db.Text
  fileId    String
  file      File     @relation(fields: [fileId], references: [id])
  outputs   Output[]
  createdAt DateTime @default(now())
}
```

---

## 🐛 Troubleshooting

### Upload Fails
- Check UploadThing token in `.env.local`
- Verify user is authenticated
- Check file size limits
- Check browser console for errors

### Text Extraction Fails
- Verify file URL is accessible
- Check file is valid (not corrupted)
- Look for extraction errors in server logs
- File still saved, extraction retryable

### Files Don't Appear
- Check database for file records
- Verify user authentication
- Check API route permissions
- Look for errors in network tab

### Delete Fails
- Verify file ownership
- Check UploadThing key is correct
- Look for errors in server logs

---

## 🎯 Next Steps After Phase 2

1. **Test Everything**
   - Upload different file types
   - Verify text extraction
   - Test file deletion
   - Check database entries

2. **Move to Phase 3**
   - Implement Whisper transcription
   - Process video/audio files
   - Add transcription UI

3. **Optimize**
   - Add file compression
   - Implement chunked uploads for large files
   - Add retry logic for failed extractions
   - Cache extracted text

---

## 📚 Documentation Links

- [UploadThing Docs](https://docs.uploadthing.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ Phase 2 Checklist

### Implementation
- [x] Install dependencies (jszip)
- [x] Fix Prisma schema merge conflict
- [x] Create ITextExtractor interface
- [x] Implement PDF adapter
- [x] Implement DOCX adapter
- [x] Implement PPTX adapter
- [x] Create TextExtractorAdapter
- [x] Implement IngestService
- [x] Enhance UploadThing core
- [x] Create FileList component
- [x] Create UploadProgress component
- [x] Create UploadManager component
- [x] Create GET /api/files route
- [x] Create DELETE /api/files/[fileId] route
- [x] Fix Tailwind CSS errors

### Testing (Next)
- [ ] Test PDF upload and extraction
- [ ] Test DOCX upload and extraction
- [ ] Test PPTX upload and extraction
- [ ] Test video/audio upload (no extraction yet)
- [ ] Test file list display
- [ ] Test file deletion
- [ ] Test progress indicators
- [ ] Test error scenarios
- [ ] Run end-to-end flow

### Deployment
- [ ] Run database migration
- [ ] Verify UploadThing configuration
- [ ] Test in production environment
- [ ] Monitor for errors
- [ ] Document any issues

---

*Phase 2 Implementation Guide*  
*Last Updated: October 25, 2025*
