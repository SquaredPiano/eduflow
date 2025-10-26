# UploadThing + Auth0 Integration Guide

**Date**: October 25, 2025  
**Status**: 🔧 **IMPLEMENTATION REQUIRED**  
**Priority**: 🔴 **CRITICAL** - Blocking production use

---

## 📋 Overview

This document provides step-by-step instructions to complete the Auth0 integration with UploadThing. Currently, file uploads work but are not authenticated, which is a **critical security issue**.

---

## ⚠️ Current State

### What Works
- ✅ Files upload successfully to UploadThing CDN
- ✅ File metadata is saved to database
- ✅ Upload UI components functional
- ✅ SSR optimization enabled

### What's Missing
- ❌ Real user authentication
- ❌ User-specific file access control
- ❌ Auth0 session integration
- ❌ Server-side authentication in UploadThing middleware

### Security Risk
**All uploaded files are currently attributed to a temporary user ID (`"temp-user-id"`)**. This means:
- Anyone can upload files without authentication
- Files are not tied to real users
- No access control or authorization
- **This is NOT production-ready**

---

## 🎯 Implementation Steps

### Step 1: Install the Correct Auth0 Package

Currently installed: `@auth0/auth0-react` (client-side only)  
Need to install: `@auth0/nextjs-auth0` (Next.js App Router support)

```bash
# Remove the client-only package
npm uninstall @auth0/auth0-react

# Install the Next.js package
npm install @auth0/nextjs-auth0
```

**Why?**
- `@auth0/auth0-react` is for client-side React apps only
- `@auth0/nextjs-auth0` provides both server and client-side auth for Next.js
- UploadThing middleware runs on the server, so it needs server-side auth

---

### Step 2: Configure Auth0 Handler

Create the Auth0 API route handler that manages authentication.

**Create**: `src/app/api/auth/[auth0]/route.ts`

```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

This single route handles:
- `/api/auth/login` - Initiates login
- `/api/auth/logout` - Logs out the user
- `/api/auth/callback` - Handles Auth0 callback
- `/api/auth/me` - Returns user info

---

### Step 3: Update Auth Helper Functions

**Update**: `src/lib/auth.ts`

Replace the stub implementation with real Auth0 integration:

```typescript
import { getSession as auth0GetSession } from '@auth0/nextjs-auth0';

/**
 * Get the current Auth0 session on the server
 * Returns null if not authenticated
 */
export async function getSession() {
  try {
    const session = await auth0GetSession();
    return session;
  } catch (error) {
    console.error('Failed to get Auth0 session:', error);
    return null;
  }
}

/**
 * Get the access token from the current session
 * Returns null if not authenticated
 */
export async function getAccessToken() {
  const session = await getSession();
  return session?.accessToken ?? null;
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
```

---

### Step 4: Update UploadThing Middleware

**Update**: `src/app/api/uploadthing/core.ts`

Uncomment the authentication code:

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const f = createUploadthing();
const prisma = new PrismaClient();

export const ourFileRouter = {
  courseFiles: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    image: { maxFileSize: "4MB", maxFileCount: 20 },
    video: { maxFileSize: "256MB", maxFileCount: 5 },
    audio: { maxFileSize: "128MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": 
      { maxFileSize: "32MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 
      { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      // Get the authenticated user session
      const session = await getSession();
      
      // Require authentication
      if (!session?.user) {
        throw new UploadThingError(
          "Unauthorized - Please log in to upload files"
        );
      }
      
      // Return user metadata for use in onUploadComplete
      return { 
        userId: session.user.sub,
        userEmail: session.user.email,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file key", file.key);

      try {
        // Save file to database with real user ID
        const savedFile = await prisma.file.create({
          data: {
            name: file.name,
            type: file.type || "unknown",
            url: file.url,
            key: file.key,
            size: file.size,
            userId: metadata.userId,
          },
        });

        console.log("File saved to database with ID:", savedFile.id);

        return { 
          uploadedBy: metadata.userId,
          fileId: savedFile.id,
          fileUrl: file.url,
          fileKey: file.key,
        };
      } catch (error) {
        console.error("Failed to save file to database:", error);
        return {
          uploadedBy: metadata.userId,
          fileUrl: file.url,
          fileKey: file.key,
          error: "Failed to save file metadata",
        };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

---

### Step 5: Update Client-Side Auth Provider

**Update**: `src/providers/AuthProvider.tsx`

Replace with the server-compatible version:

```typescript
'use client'

import type { ReactNode } from 'react'
import { UserProvider } from '@auth0/nextjs-auth0/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}

export default AuthProvider
```

**Why this change?**
- The new `@auth0/nextjs-auth0` package uses `UserProvider` instead of `Auth0Provider`
- It automatically handles the configuration from environment variables
- It works seamlessly with the server-side session management

---

### Step 6: Update Root Layout

**Update**: `src/app/layout.tsx`

Wrap the app with the AuthProvider:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AuthProvider } from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eduflow - AI-Powered Learning Platform",
  description: "Transform your educational content with AI-powered transcription, notes, and flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Step 7: Update Upload Hook to Handle Auth

**Update**: `src/hooks/useAuth.ts`

Replace stub with real Auth0 integration:

```typescript
'use client'

import { useUser } from '@auth0/nextjs-auth0/client'

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

export interface AuthUser { 
  id: string
  name?: string | null
  email?: string | null
}

export function useAuth() {
  const { user, error, isLoading } = useUser()
  
  const status: AuthStatus = isLoading 
    ? 'loading' 
    : user 
    ? 'authenticated' 
    : 'unauthenticated'
  
  const authUser: AuthUser | null = user 
    ? {
        id: user.sub!,
        name: user.name,
        email: user.email,
      }
    : null
  
  return { 
    user: authUser,
    status,
    isAuthenticated: !!user,
    isLoading,
    error,
  }
}

export default useAuth
```

---

### Step 8: Create a Protected Upload Page

**Create**: `src/components/upload/ProtectedUploadDemo.tsx`

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FileUploadButton } from "./FileUploadButton";
import { FileUploadDropzone } from "./FileUploadDropzone";

interface UploadedFile {
  url: string;
  key: string;
  name: string;
}

export function ProtectedUploadDemo() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUploadComplete = (files: UploadedFile[]) => {
    console.log("Files uploaded:", files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleUploadError = (error: Error) => {
    alert(`Upload Error: ${error.message}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Please Log In</h1>
        <p>You must be logged in to upload files.</p>
        <a 
          href="/api/auth/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Log In
        </a>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl font-bold mb-4">Upload Files</h1>
        <p className="text-gray-600">Logged in as: {user?.email}</p>
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
```

---

### Step 9: Run Database Migration

The Prisma schema has been updated to include the new fields. Run the migration:

```bash
npx prisma migrate dev --name add_uploadthing_fields
```

This will:
1. Add `key` field to track UploadThing file keys
2. Add `size` field to track file sizes
3. Add `userId` field for direct user reference
4. Add user-to-files relation
5. Make `courseId` optional

---

### Step 10: Test the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test login**:
   - Navigate to `http://localhost:3000/api/auth/login`
   - Log in with your Auth0 account
   - Verify you're redirected back

3. **Test upload without login**:
   - Log out: `http://localhost:3000/api/auth/logout`
   - Try to upload a file
   - Should see "Unauthorized" error

4. **Test upload with login**:
   - Log in again
   - Upload a file
   - Verify file is saved to database with your user ID
   - Check console logs for confirmation

5. **Verify in database**:
   ```bash
   npx prisma studio
   ```
   - Open the File table
   - Verify uploaded files have real user IDs (not "temp-user-id")

---

## 🔍 Verification Checklist

After completing all steps, verify:

- [ ] `@auth0/nextjs-auth0` is installed
- [ ] `@auth0/auth0-react` is uninstalled
- [ ] Auth0 API route handler created at `/api/auth/[auth0]/route.ts`
- [ ] `src/lib/auth.ts` uses real Auth0 session
- [ ] UploadThing middleware checks authentication
- [ ] `AuthProvider` uses `UserProvider` from new package
- [ ] Root layout wraps app with `AuthProvider`
- [ ] `useAuth` hook uses `useUser` from new package
- [ ] Database migration completed successfully
- [ ] Can log in via `/api/auth/login`
- [ ] Cannot upload without authentication
- [ ] Can upload when authenticated
- [ ] Files in database have real user IDs

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@auth0/nextjs-auth0'"

**Solution**: Make sure you've installed the package:
```bash
npm install @auth0/nextjs-auth0
```

### Issue: "Unauthorized" error even when logged in

**Solution**: Check that:
1. Environment variables are correct
2. Auth0 callback URL is configured in Auth0 dashboard
3. Session cookie is being set (check browser dev tools)

### Issue: Database error when saving file

**Solution**: 
1. Verify migration ran successfully: `npx prisma migrate status`
2. Check that User with the auth0Id exists in database
3. Verify `userId` field is correctly added to File model

### Issue: TypeScript errors in UploadThing core

**Solution**: The `getSession()` function now returns a proper session object. If you still see errors:
1. Restart TypeScript server in VSCode
2. Run `npm run build` to check for real errors

---

## 📚 Additional Resources

- [Auth0 Next.js SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [UploadThing Authentication Guide](https://docs.uploadthing.com/file-routes#middleware)
- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## ✅ Success Criteria

You'll know the integration is complete when:

1. ✅ Users must log in to upload files
2. ✅ Uploaded files are tied to authenticated users
3. ✅ User IDs in database are real Auth0 IDs (not "temp-user-id")
4. ✅ Unauthorized upload attempts are rejected
5. ✅ All TypeScript errors are resolved
6. ✅ Build completes successfully
7. ✅ Tests pass (if you have tests)

---

## 🎯 Next Steps After Integration

Once Auth0 is integrated:

1. **Add File Management UI**
   - List user's uploaded files
   - Delete files
   - Download files

2. **Implement Course Association**
   - Allow users to upload files to specific courses
   - Pass `courseId` from client via `input()` in UploadThing

3. **Add File Processing**
   - Extract text from PDFs, DOCX, PPTX
   - Transcribe audio/video with Whisper
   - Generate AI content

4. **Enhance Security**
   - Add rate limiting
   - Implement file scanning
   - Add access control for file viewing

---

**Status**: Ready for implementation  
**Estimated Time**: 2-4 hours  
**Priority**: Critical - Required for production
