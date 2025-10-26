# 🗺️ EduFlow Frontend Roadmap - Visual Guide

## Overview

This document provides a visual guide to the complete frontend redesign, showing the exact flow users will experience from landing to AI-powered content generation.

---

## 📱 User Journey Map

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 1: DISCOVERY                                               │
│  ───────────────────                                             │
│  User visits eduflow.app                                         │
│  ↓                                                               │
│  Landing Page (Public)                                           │
│  • Hero: "Transform Learning with AI"                            │
│  • Features showcase                                             │
│  • [Get Started Free] button                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                        ↓ Click "Get Started"
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 2: AUTHENTICATION                                          │
│  ───────────────────                                             │
│  Redirect to Auth0 Login                                         │
│  ↓                                                               │
│  /api/auth/login → Auth0 → /api/auth/callback                   │
│  • Universal Login Page                                          │
│  • Social login (Google, GitHub)                                 │
│  • Email/Password                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                        ↓ Login Successful
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 3: DASHBOARD                                               │
│  ─────────────────                                               │
│  /dashboard (Protected)                                          │
│  ↓                                                               │
│  First-time user sees:                                           │
│  • Empty state: "No projects yet"                                │
│  • [+ Create Project] button (prominent)                         │
│  • [Import from Canvas] button                                   │
│                                                                  │
│  Returning user sees:                                            │
│  • Projects grid (CS50, Math, Physics...)                        │
│  • Quick stats (24 files, 18 AI ready...)                        │
│  • Search/filter                                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                        ↓ Two paths diverge
        ┌──────────────────────────────────────────┐
        │                                          │
        ↓                                          ↓
┌─────────────────────┐                ┌─────────────────────┐
│  PATH A: MANUAL     │                │  PATH B: CANVAS     │
│  ─────────────────  │                │  ─────────────────  │
│                     │                │                     │
│  Click [+ Create    │                │  Click [Import      │
│  Project]           │                │  from Canvas]       │
│  ↓                  │                │  ↓                  │
│  Modal opens:       │                │  Wizard opens:      │
│  • Project name     │                │  Step 1:            │
│  • Description      │                │  • Canvas URL       │
│  • [Create]         │                │  • Access token     │
│  ↓                  │                │  ↓                  │
│  Project created    │                │  Step 2:            │
│  → /project/[id]    │                │  • Select courses   │
│                     │                │  • Last 8 months    │
│                     │                │  ↓                  │
│                     │                │  Step 3:            │
│                     │                │  • Select files     │
│                     │                │  • Choose PDFs/vids │
│                     │                │  ↓                  │
│                     │                │  Import starts      │
│                     │                │  → /project/[id]    │
│                     │                │                     │
└─────────────────────┘                └─────────────────────┘
        │                                          │
        └──────────────────┬───────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 4: PROJECT VIEW                                            │
│  ────────────────────                                            │
│  /project/[id] (Protected)                                       │
│  ↓                                                               │
│  Three tabs:                                                     │
│  • [Files] - Upload, manage files                                │
│  • [AI Outputs] - View generated content                         │
│  • [Canvas View] - Visual workflow                               │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  FILES TAB (Default):                                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ 📁 Files (3)                    [+ Upload Files]       │     │
│  │                                                        │     │
│  │ 📄 lecture-01.pdf      50MB     [View] [Delete]       │     │
│  │ 🎥 lecture-02.mp4     250MB     [View] [Delete]       │     │
│  │ 📄 slides-week1.pptx   12MB     [View] [Delete]       │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  🤖 Generate AI Content                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                        │
│  │Notes │  │Flash │  │Quiz  │  │Slides│                        │
│  │[Gen] │  │[Gen] │  │[Gen] │  │[Gen] │                        │
│  └──────┘  └──────┘  └──────┘  └──────┘                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓ Click [Generate]
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 5: AI PROCESSING                                           │
│  ──────────────────                                              │
│  Background jobs triggered:                                      │
│  ↓                                                               │
│  1. Extract text from PDF → IngestService                        │
│  2. Transcribe video → ElevenLabs API                            │
│  3. Generate content → Gemini API                                │
│  ↓                                                               │
│  UI shows:                                                       │
│  • Loading spinner on button                                     │
│  • Toast: "Generating notes from lecture-01.pdf..."             │
│  • Progress bar (optional)                                       │
│  ↓                                                               │
│  On complete:                                                    │
│  • Toast: "✓ Notes ready!"                                       │
│  • Output appears in AI Outputs tab                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓ View output
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 6: AI OUTPUTS TAB                                          │
│  ───────────────────                                             │
│  /project/[id] → AI Outputs tab                                  │
│  ↓                                                               │
│  Generated content displayed:                                    │
│                                                                  │
│  📝 NOTES (from lecture-01.pdf)                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ # Key Concepts                                         │     │
│  │                                                        │     │
│  │ ## Introduction                                        │     │
│  │ - Point 1: Lorem ipsum...                             │     │
│  │ - Point 2: Dolor sit amet...                          │     │
│  │                                                        │     │
│  │ [Export PDF] [Refine with AI] [Delete]                │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  🃏 FLASHCARDS (from lecture-02.mp4)                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Card 1 of 24                                  [Flip]   │     │
│  │                                                        │     │
│  │ Front: What is the capital of France?                 │     │
│  │                                                        │     │
│  │ [Export Anki] [Refine with AI] [Delete]               │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ❓ QUIZ (from slides-week1.pptx)                                │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Question 1 of 10                                       │     │
│  │                                                        │     │
│  │ Which of the following is correct?                    │     │
│  │ ○ Option A                                            │     │
│  │ ○ Option B                                            │     │
│  │ ○ Option C ✓                                          │     │
│  │ ○ Option D                                            │     │
│  │                                                        │     │
│  │ [Export CSV] [Refine with AI] [Delete]                │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓ Click [Refine with AI]
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 7: AGENT CHAT                                              │
│  ───────────────────                                             │
│  Panel slides out from right                                     │
│  ↓                                                               │
│  Chat interface:                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ 🤖 Notes Agent                          [×]            │     │
│  │ ──────────────────────────────────────────────────     │     │
│  │                                                        │     │
│  │  Agent: I've generated comprehensive notes.            │     │
│  │         How can I improve them?                        │     │
│  │                                                        │     │
│  │         You: Make this more concise and add            │     │
│  │              more examples                             │     │
│  │                                                        │     │
│  │  Agent: I've updated the notes with more               │     │
│  │         examples and removed redundant info.           │     │
│  │                                                        │     │
│  │ ──────────────────────────────────────────────────     │     │
│  │ Type your message...                      [Send →]     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  Notes update in real-time                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓ Optional: Visual workflow
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 8: CANVAS VIEW (Optional)                                  │
│  ──────────────────────                                          │
│  /canvas/[projectId] or "Canvas View" tab                        │
│  ↓                                                               │
│  React Flow infinite canvas:                                     │
│                                                                  │
│      ┌─────────┐                                                │
│      │lecture- │─────→ ┌─────────┐                              │
│      │ 01.pdf  │       │ Notes   │──→ 📝 Output                 │
│      └─────────┘       │ Agent   │                              │
│                        └─────────┘                              │
│                                                                  │
│      ┌─────────┐                                                │
│      │lecture- │─────→ ┌─────────┐                              │
│      │ 02.mp4  │       │Flashcard│──→ 🃏 Output                 │
│      └─────────┘       │ Agent   │                              │
│                        └─────────┘                              │
│                                                                  │
│  Features:                                                       │
│  • Drag nodes to reposition                                      │
│  • Click agent to see status                                     │
│  • Click output to preview                                       │
│  • Add new files/agents by dragging from toolbar                 │
│  • Save canvas state automatically                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓ Ready to export
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  STEP 9: EXPORT                                                  │
│  ──────────────                                                  │
│  Click [Export] button on any output                             │
│  ↓                                                               │
│  Format options:                                                 │
│  • Notes → PDF                                                   │
│  • Flashcards → Anki (.apkg)                                     │
│  • Quiz → CSV                                                    │
│  • Slides → PPTX                                                 │
│  ↓                                                               │
│  File downloads immediately                                      │
│  Toast: "✓ Exported notes.pdf"                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Design Examples

### Landing Page Mockup

```
╔════════════════════════════════════════════════════════════════╗
║  [EduFlow 🎓]                    [Features] [About] [Sign In] ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║                   🌟 Transform Learning with AI 🌟             ║
║                                                                ║
║         Upload course materials → Get AI-powered study tools   ║
║                                                                ║
║              [Get Started Free]  [Watch Demo →]                ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     ║
║   │  📤      │  │  🤖      │  │  🗺️      │  │  📦      │     ║
║   │ Upload   │  │ AI Gen   │  │ Canvas   │  │ Export   │     ║
║   │ Files    │  │ Content  │  │ Workflow │  │ Formats  │     ║
║   │          │  │          │  │          │  │          │     ║
║   │ PDF, PPT,│  │ Notes,   │  │ Visual   │  │ PDF,     │     ║
║   │ Videos   │  │ Flash,   │  │ Builder  │  │ Anki,    │     ║
║   │          │  │ Quiz     │  │          │  │ CSV      │     ║
║   └──────────┘  └──────────┘  └──────────┘  └──────────┘     ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║                       How It Works                             ║
║                       ────────────                             ║
║                                                                ║
║    ①                 ②                   ③                    ║
║  Upload           AI Process           Export                 ║
║  Course Files     Generate Content     Study Materials        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║            Ready to transform your learning?                   ║
║                                                                ║
║              [Start Now - It's Free →]                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Dashboard Mockup

```
╔════════════════════════════════════════════════════════════════╗
║ ☰ [EduFlow]  Dashboard                       [Avatar ▼]      ║
╠═══════╦════════════════════════════════════════════════════════╣
║       ║                                                        ║
║ 📊    ║  My Projects                                           ║
║ Dashbd║  ────────────────────                                  ║
║       ║                                                        ║
║ 📁    ║  [+ New Project]  [Import from Canvas]                ║
║ Projec║                                                        ║
║       ║  ┌────────────┐  ┌────────────┐  ┌────────────┐      ║
║ 📥    ║  │  CS50      │  │  Math 101  │  │  Physics   │      ║
║ Import║  │  ────────  │  │  ────────  │  │  ────────  │      ║
║       ║  │  📄 12     │  │  📄 8      │  │  📄 15     │      ║
║ ⚙️    ║  │  Updated   │  │  Updated   │  │  Updated   │      ║
║ Settin║  │  2h ago    │  │  1d ago    │  │  3d ago    │      ║
║       ║  └────────────┘  └────────────┘  └────────────┘      ║
║       ║                                                        ║
║ Stats ║  ┌────────────┐  ┌────────────┐  ┌────────────┐      ║
║ ───── ║  │  Biology   │  │  History   │  │  Chem Lab  │      ║
║       ║  │  ────────  │  │  ────────  │  │  ────────  │      ║
║ 📄 24 ║  │  📄 6      │  │  📄 10     │  │  📄 20     │      ║
║ Files ║  │  Updated   │  │  Updated   │  │  Updated   │      ║
║       ║  │  5d ago    │  │  1w ago    │  │  2w ago    │      ║
║ 🤖 18 ║  └────────────┘  └────────────┘  └────────────┘      ║
║ Ready ║                                                        ║
║       ║                                                        ║
║ 📝 32 ║                                                        ║
║ Notes ║                                                        ║
║       ║                                                        ║
║ 🃏 156║                                                        ║
║ Cards ║                                                        ║
║       ║                                                        ║
╚═══════╩════════════════════════════════════════════════════════╝
```

### Project View Mockup

```
╔════════════════════════════════════════════════════════════════╗
║ ← Back to Dashboard        CS50 Project              [⚙️]     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  [Files] [AI Outputs] [Canvas View]                           ║
║  ═══════════════════════════════════════                       ║
║                                                                ║
║  📁 Files (3)                              [+ Upload Files]   ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ 📄 lecture-01.pdf        50MB      [View] [Delete]    │   ║
║  │ 🎥 lecture-02.mp4       250MB      [View] [Delete]    │   ║
║  │ 📄 slides-week1.pptx     12MB      [View] [Delete]    │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  🤖 Generate AI Content                                        ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     ║
║  │  📝      │  │  🃏      │  │  ❓      │  │  📊      │     ║
║  │  Notes   │  │Flashcard │  │  Quiz    │  │  Slides  │     ║
║  │          │  │          │  │          │  │          │     ║
║  │[Generate]│  │[Generate]│  │[Generate]│  │[Generate]│     ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘     ║
║                                                                ║
║  📝 Recent Outputs                                             ║
║  • Notes from lecture-01.pdf (2 hours ago)                    ║
║  • Flashcards from lecture-02.mp4 (1 day ago)                ║
║  • Quiz from slides-week1.pptx (2 days ago)                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Key Interactions

### 1. File Upload Flow
```
User clicks [+ Upload Files]
  ↓
Modal opens with drag-drop zone
  ↓
User drags files or clicks to select
  ↓
Progress bars show upload (0% → 100%)
  ↓
Toast: "✓ 3 files uploaded"
  ↓
Files appear in list immediately
  ↓
If video/audio: Auto-trigger transcription
  ↓
Toast: "🎙️ Transcribing lecture-02.mp4..."
```

### 2. AI Generation Flow
```
User clicks [Generate] on Notes card
  ↓
Button shows loading spinner
  ↓
Toast: "🤖 Generating notes from lecture-01.pdf..."
  ↓
Backend processes:
  1. Extract text (PDF) or use transcript (video)
  2. Send to Gemini API
  3. Save output to database
  ↓
Toast: "✓ Notes ready!"
  ↓
Output appears in AI Outputs tab
  ↓
Badge shows "New" indicator
```

### 3. Canvas Import Flow
```
User clicks [Import from Canvas]
  ↓
Wizard modal opens (Step 1/3)
  ↓
User enters Canvas URL and access token
  ↓
Click [Verify Token]
  ↓
API call to /api/canvas/verify
  ↓
If valid: Show [Next Step →]
If invalid: Show error message
  ↓
Step 2/3: Show list of courses (last 8 months)
  ↓
User checks courses to import
  ↓
Click [Next Step →]
  ↓
Step 3/3: Show files for selected courses
  ↓
User checks files to import (PDFs, videos, PPTs)
  ↓
Click [Import Selected]
  ↓
Progress modal: "Importing 12 files..."
  ↓
Backend downloads and processes each file
  ↓
Toast: "✓ Imported 12 files from Canvas"
  ↓
Redirect to new project page
```

---

## 🎨 Animation & Transition Guidelines

### Page Transitions
```css
/* Smooth page changes */
.page-transition {
  animation: fadeIn 200ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Card Hover Effects
```css
.project-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

### Button Click Animation
```css
.button {
  transition: transform 100ms ease;
}

.button:active {
  transform: scale(0.95);
}
```

### Loading States
```tsx
// Skeleton loader example
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
</div>

// Spinner example
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
```

---

## 📋 Component Checklist

### Layout Components
- [ ] Navbar (with auth state)
- [ ] Footer
- [ ] Sidebar (collapsible)
- [ ] PageContainer (max-width wrapper)

### Page Components
- [ ] LandingPage
- [ ] DashboardPage
- [ ] ProjectView
- [ ] CanvasFlow
- [ ] SettingsPage

### Feature Components
- [ ] ProjectCard
- [ ] CreateProjectModal
- [ ] ImportCanvasWizard
- [ ] FileUploadZone
- [ ] FileList
- [ ] FilePreview
- [ ] GeneratePanel
- [ ] AgentCard
- [ ] OutputViewer (Notes, Flashcards, Quiz, Slides)
- [ ] AgentChat
- [ ] ExportButton

### Canvas Components (React Flow)
- [ ] FlowCanvas
- [ ] FileNode
- [ ] AgentNode
- [ ] OutputNode
- [ ] CustomEdge
- [ ] CanvasControls
- [ ] Minimap

### UI Primitives (Already have from Phase 7)
- [x] Button
- [x] Card
- [x] Input
- [x] Dialog/Modal
- [x] Dropdown
- [x] Tabs
- [x] Progress
- [x] Skeleton
- [x] Badge
- [x] Avatar
- [x] Tooltip

---

## 🚀 Implementation Order (Recommended)

### Week 1: Foundation & Core Pages
```
Day 1-2: Design system + Navbar + Footer + Middleware
Day 3-4: Landing page (beautiful, responsive)
Day 5-7: Dashboard (projects grid, create/import modals)
```

### Week 2: Project Management & AI
```
Day 8-10: Project view (files tab, upload, generate)
Day 11-13: AI Outputs tab (viewers for all 4 types)
Day 14: Agent chat panel
```

### Week 3: Canvas & Polish
```
Day 15-17: Flow canvas (React Flow integration)
Day 18-19: Canvas import wizard
Day 20-21: Polish, animations, testing
```

---

## 🎯 Success Criteria

### Must Have (MVP)
- ✅ Beautiful landing page
- ✅ Auth0 login working
- ✅ Dashboard with project cards
- ✅ Create project manually
- ✅ Upload files (drag-drop)
- ✅ Generate all 4 AI types
- ✅ View outputs (basic display)
- ✅ Export to all formats

### Should Have (V1.0)
- ✅ Import from Canvas
- ✅ Agent chat refinement
- ✅ Flow canvas view
- ✅ Search/filter projects
- ✅ File preview modal
- ✅ Smooth animations
- ✅ Mobile responsive

### Nice to Have (V1.1+)
- ⏳ Keyboard shortcuts
- ⏳ Dark mode toggle
- ⏳ Collaboration (share projects)
- ⏳ Analytics dashboard
- ⏳ Batch operations
- ⏳ PWA support

---

**This roadmap is your north star. Every component, every interaction, every pixel should bring us closer to this vision. Let's build! 🚀**
