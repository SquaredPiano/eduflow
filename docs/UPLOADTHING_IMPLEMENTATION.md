# UploadThing Implementation Guide

## 📋 Overview

This document describes the UploadThing implementation for Phase 2 of the Eduflow project. UploadThing provides a simple, scalable file upload solution with built-in CDN, optimization, and security features.

## 🎯 What Was Implemented

### 1. Core UploadThing Setup

#### File Router (`src/app/api/uploadthing/core.ts`)
- **Route Name**: `courseFiles`
- **Supported File Types**:
  - PDF (max 16MB, 10 files)
  - Images (max 4MB, 20 files)
  - Video (max 256MB, 5 files)
  - Audio (max 128MB, 5 files)
  - PowerPoint/PPTX (max 32MB, 10 files)
  - Word/DOCX (max 16MB, 10 files)

- **Middleware**: 
  - Authentication check using `getSession()`
  - ⚠️ Currently returns temp user ID (will be updated once Auth0 is complete)
  
- **onUploadComplete**: 
  - Logs upload completion
  - Returns file metadata to client

#### API Route Handler (`src/app/api/uploadthing/route.ts`)
- Exports GET and POST handlers
- Mounted at `/api/uploadthing`
- Handles all UploadThing API interactions

### 2. Client-Side Components

#### Utility Components (`src/lib/uploadthing.ts`)
Two generated components for easy use in your app:
- `UploadButton` - Simple button-based upload
- `UploadDropzone` - Drag-and-drop upload zone

### 3. SSR Plugin

Added to `src/app/layout.tsx`:
- Improves SSR by hydrating route config on the client
- Eliminates loading states for better UX
- Extracts only necessary route config (security best practice)

### 4. Adapter Pattern

#### UploadThingAdapter (`src/adapters/uploadthing.adapter.ts`)
Provides server-side utilities:
- `deleteFiles(fileKeys)` - Delete files from UploadThing
- `getFileUrls(fileKeys)` - Get file URLs by keys
- `listFiles(limit, offset)` - List uploaded files with pagination

### 5. React Hook

#### useUpload Hook (`src/hooks/useUpload.ts`)
Client-side hook with:
- `uploadFiles(files)` - Upload files programmatically
- `ingest(formData)` - Legacy ingest API compatibility
- State tracking: `isUploading`, `uploadProgress`, `error`

### 6. Example Page

Created `src/app/example-uploader/page.tsx`:
- Demonstrates both UploadButton and UploadDropzone
- Shows how to handle upload success and errors
- Ready to test at `/example-uploader`

## 🚀 Usage Examples

### Basic Upload Button

```tsx
"use client";

import { UploadButton } from "@/lib/uploadthing";

export default function MyPage() {
  return (
    <UploadButton
      endpoint="courseFiles"
      onClientUploadComplete={(res) => {
        console.log("Files uploaded:", res);
        // res contains: [{ url, key, name, size }]
      }}
      onUploadError={(error: Error) => {
        alert(`Upload failed: ${error.message}`);
      }}
    />
  );
}
```

### Drag-and-Drop Dropzone

```tsx
"use client";

import { UploadDropzone } from "@/lib/uploadthing";

export default function MyPage() {
  return (
    <UploadDropzone
      endpoint="courseFiles"
      onClientUploadComplete={(res) => {
        console.log("Files uploaded:", res);
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error:", error);
      }}
    />
  );
}
```

### Using the useUpload Hook

```tsx
"use client";

import { useUpload } from "@/hooks/useUpload";
import { useState } from "react";

export default function CustomUpload() {
  const { uploadFiles, isUploading, uploadProgress, error } = useUpload();
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = async () => {
    try {
      await uploadFiles(files);
      alert("Upload complete!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
      </button>
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
}
```

### Server-Side File Operations

```tsx
import { UploadThingAdapter } from "@/adapters/uploadthing.adapter";

const uploadThing = new UploadThingAdapter();

// Delete files
await uploadThing.deleteFiles(["file-key-1", "file-key-2"]);

// Get file URLs
const files = await uploadThing.getFileUrls(["file-key-1"]);
console.log(files); // [{ key: "file-key-1", url: "https://..." }]

// List all files
const { files, hasMore } = await uploadThing.listFiles(50, 0);
```

## 🔧 Configuration

### Environment Variables

Already configured in `.env`:
```env
UPLOADTHING_TOKEN='eyJhcGlLZXkiOiJza...'
```

### File Type Limits

Currently configured limits (can be adjusted in `core.ts`):
- PDF: 16MB
- Images: 4MB
- Video: 256MB
- Audio: 128MB
- PPTX: 32MB
- DOCX: 16MB

## ⚠️ Known Limitations

### 1. Authentication Not Yet Complete
- Middleware currently uses a temporary user ID
- Once Auth0 is integrated (Phase 1), update the middleware:

```typescript
// In src/app/api/uploadthing/core.ts
.middleware(async ({ req }) => {
  const session = await getSession();
  if (!session?.user) throw new UploadThingError("Unauthorized");
  
  // Return actual user ID from Auth0 session
  return { userId: session.user.sub };
})
```

### 2. Database Integration Pending
- Files are uploaded to UploadThing but not saved to database yet
- Need to add database save logic in `onUploadComplete`:

```typescript
.onUploadComplete(async ({ metadata, file }) => {
  // Save to database
  await prisma.file.create({
    data: {
      name: file.name,
      type: file.type,
      url: file.url,
      key: file.key,
      size: file.size,
      userId: metadata.userId,
    }
  });
  
  return { uploadedBy: metadata.userId, fileUrl: file.url };
})
```

## 🧪 Testing

### Test the Implementation

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to the example page:
```
http://localhost:3000/example-uploader
```

3. Try uploading files using:
   - The UploadButton component
   - The UploadDropzone component

4. Check the browser console for upload results

### Expected Behavior

- ✅ Files should upload successfully
- ✅ Console should log file metadata (url, key, name, size)
- ✅ Alert should show "Upload Completed"
- ❌ Files won't be authenticated yet (Phase 1 needed)
- ❌ Files won't be saved to database (needs integration)

## 📦 Dependencies Installed

```json
{
  "uploadthing": "^latest",
  "@uploadthing/react": "^latest"
}
```

## 🔄 Next Steps

### Immediate (After Phase 1 Complete):
1. Update middleware with real Auth0 session
2. Test authenticated uploads
3. Verify user ID is correctly attached to uploads

### Phase 2 Continuation:
4. Integrate with Prisma database
5. Save file metadata on upload complete
6. Implement text extraction for PDFs
7. Implement text extraction for DOCX
8. Implement text extraction for PPTX
9. Create proper file management UI in dashboard
10. Add file deletion functionality

### Phase 3+ Integration:
11. Connect uploaded video/audio files to Whisper transcription
12. Process documents through AI for notes/flashcards generation
13. Implement file organization by courses

## 📚 Documentation Links

- [UploadThing Documentation](https://docs.uploadthing.com/)
- [File Routes Reference](https://docs.uploadthing.com/file-routes)
- [React Components Guide](https://docs.uploadthing.com/getting-started/appdir)
- [Server-Side API](https://docs.uploadthing.com/api-reference/server)

## 🎉 Summary

✅ **Completed**:
- UploadThing FileRouter configured
- API routes set up
- Client components generated
- SSR plugin integrated
- Adapter pattern implemented
- Custom React hook created
- Example page for testing

⚠️ **Pending** (requires Phase 1):
- Authentication integration
- Database persistence
- Text extraction
- File management UI

The UploadThing foundation is now ready. Once Phase 1 (Auth0) is complete, we can proceed with full file upload integration including database persistence and text extraction.
