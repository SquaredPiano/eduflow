# 🚀 Phase 8 Quick Start Guide

## Overview

This guide will help you start implementing Phase 8 (Complete Frontend Redesign) immediately. We'll build on top of the existing backend (Phases 1-7) and create a beautiful, production-ready frontend.

---

## 📋 Prerequisites

Before starting Phase 8, ensure:

✅ **Phases 1-7 Complete**:
- Auth0 configured (`/api/auth/*` routes working)
- File upload working (`/api/ingest`, UploadThing)
- Transcription working (`/api/transcribe`, ElevenLabs)
- AI generation working (`/api/generate`, Gemini)
- Export working (`/api/export`)
- Canvas adapter ready (`src/adapters/canvas.adapter.ts`)

✅ **Dependencies Installed**:
```bash
# Check if these are in package.json
npm list @auth0/nextjs-auth0
npm list @xyflow/react
npm list framer-motion
npm list zustand
npm list lucide-react
```

✅ **Environment Variables Set**:
```env
# .env.local should have:
AUTH0_SECRET=xxx
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://xxx.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx

UPLOADTHING_TOKEN=xxx
GEMINI_API_KEY=xxx
ELEVENLABS_API_KEY=xxx
# ... etc
```

---

## 🎯 Phase 8.1: Foundation (Start Here)

### Step 1: Create Design System

Update `src/app/globals.css` with our design system:

```bash
# Backup existing CSS
cp src/app/globals.css src/app/globals.css.backup
```

Then replace with our design tokens (see `docs/PHASE_8_FRONTEND_REDESIGN.md` → Design System section).

**Key additions**:
- CSS custom properties for colors, spacing, shadows
- Typography scale
- Animation utilities
- Responsive breakpoints

### Step 2: Set Up Middleware for Route Protection

Create `src/middleware.ts`:

```typescript
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/project/:path*',
    '/canvas/:path*',
    '/settings/:path*',
    '/api/projects/:path*',
    '/api/canvas-sync/:path*',
  ],
};
```

### Step 3: Create Global State Store

Create `src/store/useProjectStore.ts`:

```typescript
import { create } from 'zustand';

interface Project {
  id: string;
  name: string;
  description?: string;
  filesCount: number;
  updatedAt: string;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  updateProject: (id, data) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...data } : p
    )
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),
}));
```

### Step 4: Create Navbar Component

Create `src/components/layout/Navbar.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GraduationCap, LogOut, Settings } from 'lucide-react';

export function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="h-6 w-6 text-primary-500" />
          EduFlow
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900">
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition">
                  <Avatar>
                    <AvatarImage src={user.picture || ''} />
                    <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/auth/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <a href="/api/auth/login">Sign In</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Step 5: Create Footer Component

Create `src/components/layout/Footer.tsx`:

```typescript
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary-500" />
            <span className="font-semibold">EduFlow AI</span>
          </div>
          
          <p className="text-sm text-gray-600">
            Built with Next.js, Auth0, Prisma, and Google Gemini. © {new Date().getFullYear()} EduFlow AI.
          </p>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms
            </Link>
            <a 
              href="https://github.com/yourusername/eduflow" 
              className="text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### Step 6: Update Root Layout

Update `src/app/layout.tsx` to use new Navbar:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AuthProvider } from "@/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduFlow - AI-Powered Learning Platform",
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
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 7: Test Foundation

```bash
npm run dev
```

Visit:
- `http://localhost:3000` - Should show landing page with new navbar/footer
- Click "Sign In" - Should redirect to Auth0
- After login - Should redirect back with user in navbar

---

## 🎯 Phase 8.2: Landing Page (Next Step)

Once foundation is working, proceed to build the landing page:

### Create Landing Page Component

Create `src/components/pages/LandingPage.tsx` with:
- Hero section
- Feature cards (4 cards)
- How It Works (3 steps)
- CTA section

### Update Home Page

Update `src/app/page.tsx`:

```typescript
import { LandingPage } from '@/components/pages/LandingPage';

export default function Home() {
  return <LandingPage />;
}
```

---

## 📚 Reference Documents

As you work through Phase 8, keep these docs open:

1. **`docs/PHASE_8_FRONTEND_REDESIGN.md`**
   - Complete technical implementation
   - Design system details
   - Component specifications
   - API integration points

2. **`docs/PHASE_8_VISUAL_ROADMAP.md`**
   - User journey maps
   - Page mockups
   - Interaction flows
   - Animation guidelines

3. **`docs/IMPLEMENTATION_PLAN.md`**
   - Overall project plan
   - All phases overview
   - Success metrics

---

## 🛠️ Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b phase-8-[feature-name]

# 3. Build component/feature
# ... code ...

# 4. Test locally
npm run dev

# 5. Check for errors
npm run build

# 6. Commit
git add .
git commit -m "feat(phase-8): [description]"

# 7. Push
git push origin phase-8-[feature-name]

# 8. Merge to main
git checkout main
git merge phase-8-[feature-name]
git push origin main
```

### Testing Checklist

Before committing any component:
- [ ] Component renders without errors
- [ ] Responsive on mobile (320px) and desktop (1920px)
- [ ] TypeScript has no errors (`npm run build`)
- [ ] Auth state handled correctly (loading, authenticated, unauthenticated)
- [ ] Error states handled (API failures, network errors)
- [ ] Loading states present (spinners, skeletons)
- [ ] Accessibility (keyboard navigation, ARIA labels)

---

## 🐛 Common Issues & Solutions

### Issue 1: Auth0 Redirect Loop

**Symptom**: After login, keeps redirecting back to login

**Solution**:
```typescript
// Check middleware.ts matcher doesn't include /api/auth/*
export const config = {
  matcher: [
    '/dashboard/:path*',
    // NOT /api/auth/:path*
  ],
};
```

### Issue 2: Components Not Found

**Symptom**: `Module not found: Can't resolve '@/components/ui/button'`

**Solution**:
```bash
# Make sure tsconfig.json has path alias
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 3: Hydration Errors

**Symptom**: `Text content does not match server-rendered HTML`

**Solution**:
```typescript
// Use 'use client' for components with hooks
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
```

### Issue 4: Build Fails with Type Errors

**Symptom**: `npm run build` fails but dev works

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

## 📦 Components to Build (Priority Order)

### Week 1 (Foundation + Landing + Dashboard)
1. ✅ Navbar (with auth state)
2. ✅ Footer
3. ✅ Design system in CSS
4. ✅ Middleware
5. [ ] Landing Page
6. [ ] Dashboard Page
7. [ ] Project Card
8. [ ] Create Project Modal

### Week 2 (Project View + AI)
9. [ ] Project View Page
10. [ ] File Upload Zone
11. [ ] File List
12. [ ] Generate Panel
13. [ ] Output Viewer (Notes)
14. [ ] Output Viewer (Flashcards)
15. [ ] Output Viewer (Quiz)
16. [ ] Output Viewer (Slides)
17. [ ] Agent Chat Panel

### Week 3 (Canvas + Polish)
18. [ ] Flow Canvas
19. [ ] File Node
20. [ ] Agent Node
21. [ ] Output Node
22. [ ] Canvas Import Wizard
23. [ ] Polish + Animations
24. [ ] Testing + Bug Fixes

---

## 🚀 Ready to Start?

### Immediate Actions

1. **Create directories**:
```bash
mkdir -p src/components/layout
mkdir -p src/components/pages
mkdir -p src/store
```

2. **Copy components from Phase 7** (already have from youpac-ai):
   - Button, Card, Input, Dialog, etc. (✅ already in `src/components/ui/`)

3. **Start with Step 1** above (Design System)

4. **Work through steps sequentially**

5. **Commit frequently** (every component/feature)

6. **Test on mobile** (use browser dev tools)

7. **Ask questions** when stuck (review docs or ask for help)

---

## 📞 Need Help?

If you get stuck:

1. **Check the docs**:
   - `docs/PHASE_8_FRONTEND_REDESIGN.md`
   - `docs/PHASE_8_VISUAL_ROADMAP.md`

2. **Review existing components**:
   - Look at `src/components/ui/` for patterns
   - Check `src/components/pages/EnhancedLandingPage.tsx` for examples

3. **Check console**:
   - Browser console for frontend errors
   - Terminal for build errors

4. **Ask specific questions**:
   - "How do I connect the Generate button to the API?"
   - "Why is the modal not closing?"
   - "How do I handle loading states?"

---

**Let's build something amazing! Start with Phase 8.1 Foundation above. 🚀**
