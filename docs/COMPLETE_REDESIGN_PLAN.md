# 🎨 Complete EduFlow Redesign Plan

**Date**: October 26, 2025  
**Scope**: Full app redesign with green theme, fixed auth, clean UI

---

## 🎯 Issues to Fix

### 1. Authentication Issues
- ✅ Auth0 is implemented correctly
- ❌ **Problem**: UploadThing middleware allows uploads without auth (temporary stub)
- ❌ **Problem**: File upload fails with 400 error
- **Fix**: Enable proper Auth0 check in uploadthing middleware
- **Fix**: Ensure session cookie is properly read

### 2. Color Theme (Blue → Green)
**Current** (Blue theme):
- Primary: `#3B82F6` (blue-600)
- Hover: `bg-blue-700`
- Focus: `ring-blue-500`
- Gradients: `from-blue-500 to-purple-500`

**New** (Green theme):
- Primary: `#0b8e16` (brand green)
- Hover: `bg-green-700` / `#0a7312`
- Focus: `ring-green-500`
- Gradients: `from-green-500 to-emerald-500`

**Files to Update**:
1. `src/app/page.tsx` (Landing page)
2. `src/app/dashboard/home/page.tsx` (Dashboard)
3. `src/app/dashboard/project/[id]/canvas/page.tsx` (Canvas)
4. `src/components/canvas/AgentSidebar.tsx`
5. `src/components/canvas/AgentNode.tsx`
6. `src/components/canvas/FileNode.tsx`
7. `src/components/canvas/OutputNode.tsx`
8. `src/components/chat/AgentChatPanel.tsx`
9. All Button components using blue

### 3. Canvas Agent Issues
**Current Problems**:
- ❌ youpac-ai agents (thumbnail, description, social) still on canvas
- ❌ Education agents not in sidebar by default
- ❌ Agents have opacity issues during drag
- ❌ Cursor doesn't follow smoothly
- ❌ Can't actually drag agents from sidebar onto canvas

**Required Fixes**:
1. Remove youpac-ai agent types from initial canvas
2. Only show: Notes, Flashcards, Quiz, Slides
3. Fix drag opacity (should be 1.0 during drag)
4. Fix cursor positioning
5. Ensure drag-and-drop actually works

### 4. Canvas Opacity Issue
- Canvas fades out / loses opacity
- **Likely cause**: React Flow viewport settings or CSS

### 5. UI Architecture
**Current**: Canvas opens in new page/window
**Desired**: Canvas embedded in dashboard with:
- Collapsible left sidebar (like chat)
- Flow Canvas as main focused view
- Sidebar remembers state
- Smooth transitions

### 6. Typography & Spacing
- Center "Projects" heading
- More breathing room
- Better typography scale

---

## 🛠️ Implementation Order

### Phase 1: Fix Authentication (CRITICAL) ⚠️
1. Enable Auth0 check in uploadthing middleware
2. Add better error messages
3. Test file upload
4. Test canvas fetch

### Phase 2: Theme Conversion (Blue → Green) 🎨
1. Global search/replace blue colors
2. Update gradients
3. Update hover states
4. Update focus rings
5. Test all pages

### Phase 3: Clean Canvas Agents 🧹
1. Remove youpac-ai agent initializations
2. Update AgentNode to only handle education types
3. Fix sidebar agent definitions
4. Remove unused node types

### Phase 4: Fix Drag-and-Drop 🖱️
1. Fix opacity during drag
2. Fix cursor positioning
3. Ensure drop handler works
4. Test with all agent types

### Phase 5: UI Architecture 🏗️
1. Create new layout with collapsible sidebar
2. Embed canvas in main dashboard
3. Add sidebar toggle
4. Add smooth transitions

### Phase 6: Polish & Typography ✨
1. Center headings
2. Add breathing room
3. Fix spacing
4. Test responsive

---

## 📝 Detailed Changes

### File: `src/app/api/uploadthing/core.ts`
**Change**:
```typescript
// BEFORE:
console.log("⚠️  TEMP: Allowing unauthenticated upload");
return { 
  userId: "temp-user-id",
  userEmail: "temp@example.com",
};

// AFTER:
if (!session?.user) {
  throw new UploadThingError("Unauthorized - Please log in");
}
return { 
  userId: session.user.sub,
  userEmail: session.user.email,
};
```

### File: `src/components/canvas/AgentSidebar.tsx`
**Change**: Already has education agents, just verify

### File: `src/app/dashboard/project/[id]/canvas/page.tsx`
**Remove youpac-ai type mapping**:
```typescript
// REMOVE THIS:
const typeMapping = {
  'notes': 'title',
  'flashcards': 'description',
  'quiz': 'thumbnail',
  'slides': 'tweets',
};

// KEEP SIMPLE:
type: agentType
```

### File: `src/components/canvas/AgentNode.tsx`
**Update agent types**:
```typescript
// REMOVE youpac-ai types
export interface AgentNodeData {
  type: "notes" | "flashcards" | "quiz" | "slides"; // Only education
  // Remove: "title" | "description" | "thumbnail" | "tweets"
}
```

---

## 🎨 Color Replacement Strategy

### Search/Replace Patterns:
1. `bg-blue-600` → `bg-[#0b8e16]`
2. `bg-blue-500` → `bg-green-600`
3. `bg-blue-700` → `bg-green-700`
4. `text-blue-600` → `text-green-600`
5. `border-blue-500` → `border-green-500`
6. `from-blue-500 to-purple-500` → `from-green-500 to-emerald-500`
7. `from-blue-600 to-purple-600` → `from-green-600 to-emerald-600`
8. `ring-blue-500` → `ring-green-500`
9. `hover:bg-blue-700` → `hover:bg-green-700`

---

## ✅ Testing Checklist

### Authentication:
- [ ] User can log in
- [ ] Session cookie is set
- [ ] Canvas page loads with auth
- [ ] File upload works with auth

### Theme:
- [ ] Landing page is green
- [ ] Dashboard is green
- [ ] Canvas is green
- [ ] No blue colors remain

### Canvas:
- [ ] Only education agents show
- [ ] No youpac-ai agents
- [ ] Drag works smoothly
- [ ] Drop creates nodes
- [ ] No opacity issues

### UI:
- [ ] "Projects" centered
- [ ] Breathing room added
- [ ] Sidebar collapsible
- [ ] Smooth transitions

---

**Ready to implement!** 🚀
