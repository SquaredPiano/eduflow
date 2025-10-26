# 🎯 EduFlow Quick Reference

## Start the App
```bash
npm run dev
# Open http://localhost:3000
```

## File Structure (What Matters)
```
src/app/              → Next.js pages & API routes
src/components/       → UI components
  ├── canvas/         → React Flow nodes & wizard
  ├── viewers/        → AI output viewers (4 types)
  └── upload/         → File upload zone
src/providers/        → Auth0 & React Query
src/lib/              → API client & utilities
prisma/schema.prisma  → Database schema
```

## Key Files

### Authentication
- `src/providers/Auth0Provider.tsx` - Auth context
- `src/app/auth/callback/route.ts` - Auth0 callback

### Dashboard
- `src/app/dashboard/page.tsx` - Projects list
- `src/app/dashboard/project/[id]/page.tsx` - Project detail (3 tabs)
- `src/app/dashboard/project/[id]/canvas/page.tsx` - Flow canvas

### API Routes
- `src/app/api/projects/route.ts` - GET/POST projects
- `src/app/api/projects/[id]/route.ts` - GET/PATCH/DELETE
- `src/app/api/canvas-sync/route.ts` - Canvas LMS import

### AI Viewers
- `src/components/viewers/NotesViewer.tsx` - Markdown notes
- `src/components/viewers/FlashcardsViewer.tsx` - Flip cards
- `src/components/viewers/QuizViewer.tsx` - Interactive quiz
- `src/components/viewers/SlidesViewer.tsx` - Presentation

## Environment Variables
All configured in `.env.local`:
- ✅ Auth0 credentials
- ✅ Supabase database URLs
- ✅ AI API keys (Gemini, OpenRouter, ElevenLabs)
- ✅ UploadThing token
- ✅ Canvas LMS URL

## Features Working
✅ Auth0 login/logout
✅ Project CRUD operations
✅ File upload (drag-drop)
✅ Canvas LMS import (3-step wizard)
✅ AI content generation
✅ 4 viewer types (Notes, Flashcards, Quiz, Slides)
✅ React Flow canvas visualization
✅ Design system (Blue #3B82F6, Green #0b8e16, Lato font)

## Common Tasks

### Create Project
1. Dashboard → "New Project"
2. Enter name & description
3. Click "Create Project"

### Upload Files
1. Open project
2. Files tab → Drag files or click upload
3. Files appear in list

### Import from Canvas
1. Files tab → "Import from Canvas"
2. Enter Canvas URL & token
3. Select courses → Select files → Import

### Generate AI Content
1. Files tab → Click Notes/Flashcards/Quiz/Slides
2. Wait for generation
3. View in "AI Outputs" tab

### View AI Output
1. AI Outputs tab
2. Click "View" on any output
3. Interact with viewer:
   - **Notes**: Read, copy, download
   - **Flashcards**: Flip, shuffle, mark learned
   - **Quiz**: Take quiz, see score
   - **Slides**: Present, fullscreen

## Database Commands
```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open database GUI
```

## Migration Status
✅ 100% Complete
✅ All old React Router files deleted
✅ All Clerk/Convex references removed
✅ All Next.js features working
✅ Ready for demo

## Commits Made
1. **Phase 8 - Dashboard UI** (176 files)
2. **Flow Canvas & Wizard** (6 files)
3. **Documentation** (1 file)
4. **AI Viewers Complete** (19 files)
5. **Implementation Status** (1 file)
6. **Migration Cleanup** (9 files deleted)
7. **Final Documentation** (this file)

## Next Steps (Optional)
- Add Auth0 middleware to API routes
- Deploy to Vercel
- Test on mobile devices
- Add error boundaries
- Performance optimization

---

**Everything works. Ready to demo.** 🚀
