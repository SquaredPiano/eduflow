# 🔍 AI Agent Flow - Comprehensive Audit Report

**Date:** October 26, 2025  
**System:** EduFlow AI - Educational Content Generation Platform  
**Scope:** End-to-end audit of AI agent flow from file import to downloadable content generation

---

## 📋 Executive Summary

### Critical Issues Found:
1. ❌ **API Mismatch**: Canvas page calls `/api/generate` with `fileId` instead of required `transcriptId`
2. ❌ **Missing Transcript Linking**: No mechanism to get transcript from file before generation
3. ⚠️ **No Context Chaining**: Agent-to-agent context passing not implemented
4. ⚠️ **Download Integration Missing**: Export functionality exists but not integrated into canvas flow
5. ⚠️ **Additional Context Not Stored**: User instructions for regeneration not persisted
6. ⚠️ **Wrong Canvas Component**: Main canvas (`src/components/canvas/Canvas.tsx`) is for a different system (YouTube/content creation)

---

## 🔍 Detailed Findings

### 1. Root Node Processing ✅ **WORKING**

**Files Audited:**
- `src/services/ingest.service.ts`
- `src/adapters/text-extractor.adapter.ts`
- `src/adapters/pdf.adapter.ts`, `docx.adapter.ts`, `pptx.adapters.ts`
- `src/app/api/uploadthing/core.ts`

**Status:** ✅ **IMPLEMENTED CORRECTLY**

**How It Works:**
```typescript
// 1. File uploaded via UploadThing
// 2. IngestService.processFile() called with file metadata

async processFile(fileUrl, fileName, fileType, fileKey, fileSize, userId, courseId) {
  // 1. Save file to database
  const file = await this.prisma.file.create({ ... });
  
  // 2. Extract text based on type
  switch (fileType) {
    case 'application/pdf':
      extractedText = await textExtractor.extractFromPDF(fileUrl);
      break;
    case 'application/vnd.openxmlformats...presentationml.presentation':
      extractedText = await textExtractor.extractFromPPTX(fileUrl);
      break;
    case 'application/vnd.openxmlformats...wordprocessingml.document':
      extractedText = await textExtractor.extractFromDOCX(fileUrl);
      break;
    case 'video/mp4':
      // Handled by transcription service
      break;
  }
  
  // 3. Save transcript if text was extracted
  if (extractedText) {
    await this.prisma.transcript.create({
      data: { content: extractedText, fileId: file.id }
    });
  }
}
```

**Verification:** ✅
- PDF extraction: `pdf-parse` library
- DOCX extraction: `mammoth` library  
- PPTX extraction: `jszip` library with XML parsing
- Video transcription: Handled separately (Phase 3)

---

### 2. Canvas Import from Canvas LMS ✅ **WORKING**

**Files Audited:**
- `src/components/canvas/ImportCanvasWizard.tsx`
- `src/services/canvas.service.ts`
- `src/adapters/canvas.adapter.ts`
- `src/lib/canvas.client.ts`

**Status:** ✅ **IMPLEMENTED CORRECTLY**

**How It Works:**
```typescript
// ImportCanvasWizard component allows users to:
// 1. Enter Canvas URL and API token
// 2. Select course from list
// 3. Import course files

// CanvasService handles the import:
async importCourseFiles(courseId, projectId, userId) {
  // 1. Fetch files from Canvas API
  const files = await canvasAdapter.getCourseFiles(courseId);
  
  // 2. Download and process each file
  for (const canvasFile of files) {
    const blob = await canvasAdapter.downloadFile(canvasFile.url);
    // Upload to UploadThing
    // Process with IngestService
  }
}
```

**Verification:** ✅  
- Canvas API integration working
- File download and upload flow implemented
- Proper error handling in place

---

### 3. AI Agent Chaining ❌ **NOT WORKING**

**Files Audited:**
- `src/app/dashboard/project/[id]/canvas/page.tsx`
- `src/components/canvas/Canvas.tsx` (YouTube version)

**Status:** ❌ **CRITICAL ISSUE**

**Problem:**
The simplified canvas page at `src/app/dashboard/project/[id]/canvas/page.tsx` has basic structure but:

```typescript
// Current Implementation (BROKEN):
const handleGenerate = async (type: string) => {
  await api.post('/api/generate', {
    fileId: project.files[0].id,  // ❌ WRONG: should be transcriptId
    type,
  });
};
```

The `/api/generate` endpoint expects:
```typescript
{
  transcriptId: string;  // Required!
  type?: AgentType;
  options?: Record<string, any>;
}
```

**What's Missing:**
1. No mechanism to get `transcriptId` from `fileId`
2. No connected node detection (agent chaining)
3. No context passing between agents
4. No additional user context support

**Expected Behavior:**
```typescript
const handleGenerate = async (agentNodeId: string, additionalContext?: string) => {
  // 1. Find the agent node
  const agentNode = nodes.find(n => n.id === agentNodeId);
  
  // 2. Find connected file nodes
  const connectedFiles = edges
    .filter(e => e.target === agentNodeId && e.source.includes('file'))
    .map(e => nodes.find(n => n.id === e.source));
  
  // 3. Get transcript for file
  const file = connectedFiles[0];
  const transcriptResponse = await api.get(`/api/files/${file.data.fileId}/transcript`);
  const transcriptId = transcriptResponse.transcript.id;
  
  // 4. Find connected agent nodes (for context chaining)
  const connectedAgents = edges
    .filter(e => e.target === agentNodeId && e.source.includes('agent'))
    .map(e => nodes.find(n => n.id === e.source));
  
  // 5. Collect agent outputs as context
  const agentContext = connectedAgents.map(agent => ({
    type: agent.data.type,
    content: agent.data.draft
  }));
  
  // 6. Call generation API with full context
  await api.post('/api/generate', {
    transcriptId,
    type: agentNode.data.type,
    options: {
      agentContext,  // Previous agent outputs
      additionalContext,  // User instructions
    }
  });
};
```

---

### 4. Generate/Regenerate Flow ⚠️ **PARTIALLY WORKING**

**Files Audited:**
- `src/app/api/generate/route.ts`
- `src/services/generate.service.ts`
- `src/services/agents/` (NotesAgent, FlashcardAgent, QuizAgent, SlidesAgent)
- `src/app/api/export/route.ts`
- `src/services/export.service.ts`

**Status:** ⚠️ **BACKEND WORKING, FRONTEND BROKEN**

**Backend (Working):**
```typescript
// POST /api/generate
{
  transcriptId: "xyz",
  type: "flashcards",
  options: { difficulty: "hard" }
}

// Response:
{
  success: true,
  output: {
    id: "abc123",
    type: "flashcards",
    content: [...],  // Generated flashcards
    transcriptId: "xyz"
  }
}
```

**Export API (Working):**
```typescript
// POST /api/export
{
  outputId: "abc123",
  format: "anki"  // or "pdf", "csv", "pptx"
}

// Returns binary file download
```

**Frontend (Broken):**
1. ❌ Canvas doesn't call `/api/generate` correctly
2. ❌ No integration with export API
3. ❌ No automatic download after generation
4. ❌ No regeneration with additional context

**What Should Happen:**
```typescript
// 1. User clicks "Generate" on flashcard agent
handleGenerate('agent-flashcards-1');

// 2. System generates content
const output = await api.post('/api/generate', {
  transcriptId,
  type: 'flashcards'
});

// 3. Update node with generated content
updateNode(agentNodeId, { 
  draft: output.content[0]?.front,
  outputId: output.id,
  status: 'ready' 
});

// 4. User views output and can download
const handleDownload = async (format: 'anki' | 'pdf') => {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      outputId: node.data.outputId,
      format
    })
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flashcards.${format === 'anki' ? 'txt' : format}`;
  a.click();
};
```

---

### 5. Additional Context for Regeneration ❌ **NOT IMPLEMENTED**

**Status:** ❌ **MISSING**

**What's Needed:**
```typescript
// Database schema needs additional fields:
model Output {
  id           String   @id @default(cuid())
  type         String
  content      Json
  transcriptId String?
  
  // New fields needed:
  userContext     String?   // "Make this quiz harder"
  previousOutputId String?  // Link to previous version
  version         Int       @default(1)
  
  createdAt    DateTime @default(now())
}

// API support:
POST /api/generate
{
  transcriptId: "xyz",
  type: "quiz",
  options: {
    additionalContext: "Make this quiz harder and focus on advanced concepts",
    previousOutputId: "prev123"  // For regeneration
  }
}

// Agent implementation needs to use context:
class QuizAgent {
  async process(input: {
    transcript: string;
    difficulty?: string;
    additionalContext?: string;  // NEW
    previousOutput?: any;  // NEW
  }) {
    let prompt = AGENT_PROMPTS.quiz.template(transcript, difficulty);
    
    if (additionalContext) {
      prompt += `\n\nAdditional Instructions: ${additionalContext}`;
    }
    
    if (previousOutput) {
      prompt += `\n\nPrevious Version:\n${JSON.stringify(previousOutput)}`;
      prompt += `\n\nPlease improve based on the instructions.`;
    }
    
    return await this.modelClient.complete(prompt, options);
  }
}
```

---

### 6. Canvas Implementation Confusion ⚠️ **ARCHITECTURE ISSUE**

**Problem:** There are TWO canvas implementations:

1. **`src/app/dashboard/project/[id]/canvas/page.tsx`**
   - Simplified educational canvas
   - Used for EduFlow (notes, flashcards, quiz, slides)
   - ❌ Has bugs (wrong API params)
   - ✅ Correct agent types

2. **`src/components/canvas/Canvas.tsx`**
   - Complex YouTube/content creation canvas
   - Used for youpac-ai (title, description, thumbnail, tweets)
   - ✅ Full featured with context chaining
   - ❌ Wrong agent types for EduFlow

**Recommendation:** Port the features from `Canvas.tsx` to the education canvas page.

---

## 🎯 Required Implementations

### Priority 1: Fix Generation Flow (CRITICAL)

**File:** `src/app/dashboard/project/[id]/canvas/page.tsx`

```typescript
// 1. Add API endpoint to get transcript from file
// File: src/app/api/files/[fileId]/transcript/route.ts
export async function GET(req: NextRequest, { params }: { params: { fileId: string } }) {
  const { fileId } = params;
  
  const transcript = await prisma.transcript.findFirst({
    where: { fileId },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!transcript) {
    return NextResponse.json({ error: 'No transcript found' }, { status: 404 });
  }
  
  return NextResponse.json({ transcript });
}

// 2. Fix handleGenerate function
const handleGenerate = async (type: string) => {
  if (!project?.files[0]) {
    toast.error('Please upload a file first');
    return;
  }

  setIsGenerating(true);
  try {
    // NEW: Get transcript ID first
    const transcriptResponse = await api.get(`/api/files/${project.files[0].id}/transcript`);
    const transcriptId = transcriptResponse.transcript.id;
    
    // Call generate API with correct params
    const output = await api.post('/api/generate', {
      transcriptId,  // ✅ FIXED: use transcriptId
      type,
    });

    // Update node with generated content
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === `agent-${type}`) {
          return {
            ...node,
            data: {
              ...node.data,
              draft: getPreviewContent(output.content, type),
              outputId: output.id,
              status: 'ready',
            },
          };
        }
        return node;
      })
    );

    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    toast.success(`${type} generated successfully!`);
  } catch (error) {
    toast.error('Failed to generate content');
    console.error(error);
  } finally {
    setIsGenerating(false);
  }
};

// Helper to get preview from content
function getPreviewContent(content: any, type: string): string {
  try {
    if (typeof content === 'string') {
      const parsed = JSON.parse(content);
      if (type === 'flashcards' && Array.isArray(parsed)) {
        return parsed[0]?.front || '';
      }
      if (type === 'quiz' && parsed.questions) {
        return parsed.questions[0]?.question || '';
      }
    }
    return typeof content === 'string' ? content.substring(0, 100) : '';
  } catch {
    return '';
  }
}
```

### Priority 2: Add Download Functionality

```typescript
// File: src/app/dashboard/project/[id]/canvas/page.tsx

// Add download handler
const handleDownloadOutput = async (outputId: string, format: 'pdf' | 'anki' | 'csv' | 'pptx') => {
  try {
    toast.loading('Generating download...');
    
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outputId, format }),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `download.${format}`;
    
    // Create blob and download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${format.toUpperCase()} file`);
  } catch (error) {
    toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Update AgentNode to include download button
data: {
  type: 'flashcards',
  label: 'Flashcards Creator',
  draft: '...',
  status: 'ready',
  outputId: 'abc123',  // Store output ID
  connections: [],
  onGenerate: () => handleGenerate('flashcards'),
  onView: () => handleViewOutput('flashcards'),
  onDownload: (format: string) => handleDownloadOutput('abc123', format),  // NEW
}
```

### Priority 3: Implement Context Chaining

```typescript
// File: src/app/dashboard/project/[id]/canvas/page.tsx

const handleGenerate = async (agentNodeId: string, additionalContext?: string) => {
  const agentNode = nodes.find(n => n.id === agentNodeId);
  if (!agentNode) return;
  
  setIsGenerating(true);
  try {
    // 1. Find connected file nodes
    const connectedFileEdges = edges.filter(
      e => e.target === agentNodeId && e.source.startsWith('file-')
    );
    
    if (connectedFileEdges.length === 0) {
      toast.error('Please connect a file to this agent first');
      return;
    }
    
    const fileNode = nodes.find(n => n.id === connectedFileEdges[0].source);
    if (!fileNode) return;
    
    // 2. Get transcript ID
    const transcriptResponse = await api.get(`/api/files/${fileNode.data.fileId}/transcript`);
    const transcriptId = transcriptResponse.transcript.id;
    
    // 3. Find connected agent nodes (for context chaining)
    const connectedAgentEdges = edges.filter(
      e => e.target === agentNodeId && e.source.startsWith('agent-')
    );
    
    const connectedAgents = connectedAgentEdges
      .map(e => nodes.find(n => n.id === e.source))
      .filter(Boolean);
    
    const agentContext = connectedAgents.map(agent => ({
      type: agent.data.type,
      content: agent.data.draft
    }));
    
    // 4. Call generation API with full context
    const output = await api.post('/api/generate', {
      transcriptId,
      type: agentNode.data.type,
      options: {
        agentContext: agentContext.length > 0 ? agentContext : undefined,
        additionalContext: additionalContext || undefined,
        previousOutputId: agentNode.data.outputId || undefined,
      }
    });
    
    // 5. Update node with result
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === agentNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              draft: getPreviewContent(output.content, agentNode.data.type),
              outputId: output.id,
              status: 'ready',
            },
          };
        }
        return node;
      })
    );
    
    toast.success(`${agentNode.data.type} generated successfully!`);
  } catch (error) {
    toast.error('Failed to generate content');
    console.error(error);
  } finally {
    setIsGenerating(false);
  }
};
```

### Priority 4: Update Database Schema

```prisma
// File: prisma/schema.prisma

model Output {
  id           String      @id @default(cuid())
  type         String
  content      Json
  projectId    String?
  project      Project?    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  fileId       String?
  file         File?       @relation(fields: [fileId], references: [id], onDelete: Cascade)
  transcriptId String?
  transcript   Transcript? @relation(fields: [transcriptId], references: [id])
  
  // NEW FIELDS for context and regeneration
  userContext     String?     // User's additional instructions
  agentContext    Json?       // Context from other agents
  previousOutputId String?    // Link to previous version for regeneration
  version         Int         @default(1)
  
  // Downloadable artifact fields (already exist)
  artifactFileId String?
  artifactMimeType String?
  artifactFileName String?
  artifactFormat   String?
  artifactStatus   String   @default("none")
  artifactError    String?
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @default(now()) @updatedAt

  @@index([projectId])
  @@index([fileId])
  @@index([transcriptId])
  @@index([previousOutputId])
}
```

### Priority 5: Update AI Agents to Use Context

```typescript
// File: src/services/agents/FlashcardAgent.ts

export class FlashcardAgent implements IAgent {
  constructor(private modelClient: IModelClient) {}

  async process(input: {
    transcript: string;
    additionalContext?: string;      // NEW
    agentContext?: Array<{ type: string; content: string }>;  // NEW
    previousOutput?: any;             // NEW
  }): Promise<string> {
    let prompt = AGENT_PROMPTS.flashcards.template(input.transcript);
    
    // Add context from other agents
    if (input.agentContext && input.agentContext.length > 0) {
      prompt += `\n\n--- Context from Other Agents ---\n`;
      for (const ctx of input.agentContext) {
        prompt += `\n${ctx.type.toUpperCase()}:\n${ctx.content}\n`;
      }
      prompt += `\nUse the above context to create more comprehensive flashcards.\n`;
    }
    
    // Add user's additional instructions
    if (input.additionalContext) {
      prompt += `\n\n--- Additional Instructions ---\n`;
      prompt += input.additionalContext;
      prompt += `\n\nPlease follow these instructions when generating the flashcards.\n`;
    }
    
    // Add previous output for regeneration
    if (input.previousOutput) {
      prompt += `\n\n--- Previous Version ---\n`;
      prompt += JSON.stringify(input.previousOutput, null, 2);
      prompt += `\n\nPlease improve upon the previous version based on the instructions.\n`;
    }
    
    const flashcards = await this.modelClient.complete(prompt, {
      systemPrompt: AGENT_PROMPTS.flashcards.system,
      temperature: 0.4,
      maxTokens: 8192,
    });
    
    // Extract and return JSON...
    return flashcards;
  }
}
```

---

## ✅ Implementation Checklist

### Immediate Fixes (1-2 hours)
- [ ] Create `/api/files/[fileId]/transcript/route.ts` endpoint
- [ ] Fix `handleGenerate` to use `transcriptId` instead of `fileId`
- [ ] Add `outputId` to agent node data
- [ ] Implement basic download functionality

### Core Features (3-4 hours)
- [ ] Implement agent chaining (connected agents provide context)
- [ ] Add download buttons to AgentNode component
- [ ] Test generation with transcript linking
- [ ] Verify export API integration

### Advanced Features (4-6 hours)
- [ ] Update Prisma schema with new Output fields
- [ ] Run migration: `npx prisma migrate dev --name add-output-context`
- [ ] Update all AI agents to accept and use context
- [ ] Implement regeneration with previous output
- [ ] Add UI for additional context input
- [ ] Test full flow: generate → add context → regenerate → download

### Testing (2-3 hours)
- [ ] Test PDF upload → extract → generate flashcards → download as Anki
- [ ] Test agent chaining: notes → flashcards (using notes as context)
- [ ] Test regeneration with additional context
- [ ] Test Canvas import → process → generate
- [ ] Test all export formats (PDF, Anki, CSV, PPTX)

---

## 📊 Current vs. Expected Flow

### Current Flow (Broken):
```
1. User uploads PDF ✅
2. Text extracted ✅
3. Transcript saved ✅
4. User drags agent to canvas ✅
5. User clicks "Generate" ❌ → Calls API with fileId (wrong)
6. API returns error ❌
7. Nothing happens ❌
```

### Expected Flow (Fixed):
```
1. User uploads PDF ✅
2. Text extracted ✅
3. Transcript saved ✅
4. User drags agent to canvas ✅
5. User connects file to agent ✅
6. User clicks "Generate" ✅
   → Gets transcriptId from fileId
   → Calls /api/generate with transcriptId
   → Receives generated output
   → Updates agent node with content
7. User views content ✅
8. User clicks "Download" (Anki) ✅
   → Calls /api/export
   → Downloads flashcards.txt
9. User adds context: "Make these harder" ✅
10. User clicks "Regenerate" ✅
    → Calls /api/generate with additionalContext
    → Updates agent node with improved content
```

---

## 🎯 Success Criteria

After implementation, the system should:

1. ✅ **Process any root node correctly**
   - PDF → extract text → save transcript
   - DOCX → extract text → save transcript
   - PPTX → extract text → save transcript
   - Video → transcribe → save transcript
   - Canvas import → download → process → save transcript

2. ✅ **Chain agents properly**
   - Notes agent connected to flashcards agent
   - Flashcards agent receives notes content as context
   - Generated flashcards reference key points from notes

3. ✅ **Generate and download content**
   - Click "Generate" on flashcards agent
   - AI generates flashcards from transcript
   - Content saved to database
   - User can view generated flashcards
   - User can download as Anki format
   - File downloads correctly and imports to Anki app

4. ✅ **Use additional context**
   - User inputs: "Make this quiz harder"
   - System stores context in database
   - Regeneration uses both transcript AND context
   - Output reflects the additional instructions

5. ✅ **Work on canvas seamlessly**
   - Drag agents onto canvas
   - Connect files to agents
   - Connect agents to other agents
   - Visual feedback during generation
   - Status updates in real-time
   - Download buttons appear when ready

---

## 📝 Migration Script

```typescript
// scripts/fix-generation-flow.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing AI agent generation flow...\n');
  
  // 1. Check for orphaned outputs without transcripts
  const orphanedOutputs = await prisma.output.findMany({
    where: {
      transcriptId: null,
      fileId: { not: null }
    },
    include: {
      file: {
        include: {
          transcripts: true
        }
      }
    }
  });
  
  console.log(`Found ${orphanedOutputs.length} outputs without transcripts`);
  
  // 2. Link outputs to transcripts
  for (const output of orphanedOutputs) {
    if (output.file?.transcripts?.[0]) {
      await prisma.output.update({
        where: { id: output.id },
        data: { transcriptId: output.file.transcripts[0].id }
      });
      console.log(`✅ Linked output ${output.id} to transcript`);
    }
  }
  
  console.log('\n✅ Migration complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🚀 Next Steps

1. **Run the audit** ✅ (Complete)
2. **Review findings** with team
3. **Prioritize fixes** (Immediate → Core → Advanced)
4. **Implement fixes** (start with Priority 1)
5. **Test thoroughly**
6. **Deploy to production**

---

**End of Audit Report**
