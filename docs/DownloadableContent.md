# Downloadable Content: Audit and Implementation Plan

Date: 2025-10-26

This document summarizes an audit of the current generation pipeline (flashcards, quizzes, notes, slides), identifies gaps for producing downloadable artifacts (PPTX, DOCX, PDF, Anki/APKG, CSV/QTI), and proposes a concrete, incremental implementation plan.

## 1) Executive summary

Current state:
- AI agent orchestration lives in `src/services/generate.service.ts` and individual agents are implemented under `src/services/agents/*` (NotesAgent, FlashcardAgent, QuizAgent, SlidesAgent).
- Agents produce textual outputs (notes: markdown string; flashcards/quiz/slides: JSON strings following strict prompt contracts).
- Outputs are persisted to the database via Prisma in `GenerateService` (saved in `output.content`).
- Some client-side viewers implement lightweight downloads:
  - `NotesViewer` (`src/components/viewers/NotesViewer.tsx`) allows downloading notes as `.md`.
  - `FlashcardsViewer` exports a simple Anki `.txt` (tab-separated front/back) client-side.
  - `QuizViewer` supports printing results only (no export as file).
  - `SlidesViewer` shows a UI stub for PowerPoint export (toast only).
- There are format-specific adapters for *extraction* (`src/adapters/pdf.adapter.ts`, `src/adapters/docx.adapter.ts`, `src/adapters/pptx.adapter.ts`) but no adapters currently implementing *file generation/serialization* (PPTX/DOCX/PDF creation) or server-side download endpoints.
- Background worker `src/workers/processGenerate.ts` is a TODO placeholder.

Implication: The system fully generates textual outputs and displays them, but lacks robust server-side serialization and download endpoints for production-quality file exports. Currently available client-side downloads are minimal (markdown and Anki text only).


## 2) Where generation happens (quick map)

- Upload/Processing
  - File ingestion & extraction: `src/adapters/*` (PDF/DOCX/PPTX adapters) -> produce transcript text
  - Transcript stored in DB (`transcript` table) and used by GenerateService

- AI orchestration
  - `src/app/api/generate/route.ts` accepts POST/GET requests and instantiates `GenerateService`
  - `src/services/generate.service.ts` orchestrates agents and persists results to `prisma.output`
  - Agents: `src/services/agents/NotesAgent.ts`, `FlashcardAgent.ts`, `QuizAgent.ts`, `SlidesAgent.ts`
    - NotesAgent returns markdown string
    - FlashcardAgent returns JSON array of { front, back }
    - QuizAgent returns JSON object { questions: [...] }
    - SlidesAgent returns JSON array of slides { title, bullets }

- UI viewers
  - `src/components/viewers/NotesViewer.tsx` (download .md)
  - `src/components/viewers/FlashcardsViewer.tsx` (client-side Anki .txt export)
  - `src/components/viewers/QuizViewer.tsx` (UI only, print results)
  - `src/components/viewers/SlidesViewer.tsx` (export stub)

- Workers / background
  - `src/workers/processGenerate.ts` is currently empty — place to implement heavy/async serialization.


## 3) Gaps and constraints

1. No server-side generation of binary files (PPTX, DOCX, PDF, APKG).
2. Output persistence is textual and unversioned; no structured storage for generated binaries or file metadata (mime type, size, storage url).
3. No streaming download endpoints (Content-Disposition headers) for large files.
4. Worker pipeline is a stub — long-running serialization should live in background jobs to avoid request timeouts.
5. Small naming mismatches exist between domain VOs (e.g., `FlashcardVO` uses `question/answer`) and agents/viewers (`front/back`), which will complicate serializers.
6. No automated tests for serialization and download endpoints.


## 4) Design decisions and recommended approach (high level)

Goals:
- Provide server-side download endpoints that produce production-quality file formats for each agent type.
- Keep work incremental: start by supporting the highest-value, easiest formats, then add more complex exporters.
- Prefer existing, well-supported Node libraries where possible.
- Use background worker for heavy generation and store results in object storage; serve via short-lived signed URLs or a streaming endpoint.

Recommended incremental priorities:
1. Flashcards: Anki `.txt` (existing client-side) + server-side CSV + optional APKG (deferred / add-on).
2. Notes: `.md` (already client-side), add `.docx` and `.pdf` generation.
3. Slides: PPTX generation (pptxgenjs or PptxGenJS server-side), and downloadable `.pdf` via puppet/HTML->PDF for print-ready slides.
4. Quiz: CSV and QTI (or JSON + printable PDF) exports.

Libraries and tech choices:
- PPTX: `pptxgenjs` (works in Node) or `PptxGenJS` if compatible — lightweight and supports slides/bullets/images. Alternative: `officegen`.
- DOCX: `docx` (npm) or `Pizzip` + `docxtemplater` if templating needed. `docx` is modern and pure JS.
- PDF: Generate an HTML preview and convert to PDF via `playwright` or `puppeteer` or `html-pdf-node` (Playwright recommended; headless and reliable). Alternatively, `pdfkit` for programmatic PDF creation.
- Anki/APKG: Node options are limited. Start with simple Anki `.txt` (tab-separated) and add `.apkg` generation as an advanced enhancement. For `.apkg`, either use a small server-side Python helper (`genanki`) or investigate npm packages like `anki-apkg-export` (evaluate security/risk).
- Storage: Reuse existing storage provider (UploadThing, Supabase Storage, or direct S3). Store generated artifacts and link from outputs table.
- Background jobs: reuse `src/workers` and `src/workers/queue.ts`. Integrate a worker process to do heavy exports and update DB with generated artifact metadata.


## 5) Data contracts (proposed)

Extend existing output DB model (suggested additions; requires Prisma migration):
- outputs table additions:
  - `fileId` (string | null) — reference to stored artifact (UploadThing/S3 key)
  - `mimeType` (string | null)
  - `fileName` (string | null)
  - `status` (enum: pending | ready | failed) — for background jobs
  - `format` (string | null) — e.g., json, md, pptx, docx, pdf, apkg

In-memory shape during serialization (TypeScript types suggested):
- FlashcardOutput = { type: 'flashcards', cards: { front: string; back: string; difficulty?: string }[] }
- QuizOutput = { type: 'quiz', questions: { question:string; options:string[]; correct:number; explanation?:string }[] }
- SlidesOutput = { type: 'slides', slides: { title: string; bullets: string[]; image?:string }[] }
- NotesOutput = { type: 'notes', markdown: string }


## 6) API surface (proposed)

1) POST /api/download
   - Body: { outputId: string, format: 'pptx'|'docx'|'pdf'|'apkg'|'csv'|'anki-txt' } 
   - Behavior:
     - If `output.fileId` exists and matches `format` and status `ready`, return a redirect / signed URL or stream file with proper Content-Disposition headers.
     - If not ready, enqueue a worker job to produce the requested format (persist status = pending) and return 202 Accepted with job id and poll URL.

2) GET /api/download?jobId=... or /api/outputs/:id/download?format=pptx
   - Polling endpoint to check job status and return file or error.

Implementation notes:
- Use streaming responses: set Content-Type and Content-Disposition for direct downloads.
- Alternatively, generate and store file in storage and return signed URL (recommended for large files / CDN).


## 7) Worker implementation (proposed)

- Implement `src/workers/processGenerate.ts` to:
  1. Accept a job payload: { outputId, format }
  2. Fetch `output` record and parse content according to its `type`.
  3. Call serializer for requested format (e.g., slidesToPptx(slidesJson) => Buffer).
  4. Upload Buffer to storage (UploadThing/S3/Supabase) and update `output` record with `fileId`, `mimeType`, `fileName`, `status='ready'`.
  5. If error, set `status='failed'` and store error message for debugging.

- Worker queue: reuse `src/workers/queue.ts` for job management; add persistence or Redis for durability (long-term).


## 8) Serializers (proposed functions)

Create `src/services/serializers/*` with a simple API:
- flashcardsToAnkiTxt(flashcards) => Buffer
- flashcardsToCsv(flashcards) => Buffer
- notesToDocx(markdown) => Buffer
- notesToPdf(markdown|html) => Buffer (via Playwright)
- slidesToPptx(slides) => Buffer (via pptxgenjs)
- quizToCsv(quiz) => Buffer

Each function should be pure (input -> Buffer) and easy to test. Keep implementation small and well-typed.


## 9) UI changes

- For each viewer add a `Download` dropdown or button that calls the `/api/download` endpoint with the chosen format.
  - `NotesViewer`: add options: Markdown (.md), DOCX (.docx), PDF (.pdf)
  - `FlashcardsViewer`: add Anki .txt (keep existing client behavior), server CSV / APKG
  - `SlidesViewer`: hook up Export button to ask for PPTX (calls backend and downloads when ready)
  - `QuizViewer`: add Export CSV / Print PDF

- Polling UX for long-running exports:
  - After calling download endpoint, show toast and open a progress modal that polls the job endpoint. When ready, auto-download or show link.


## 10) Testing

- Unit tests for each serializer (input -> Buffer contains expected content). Use example JSON from agents.
- Integration test for `/api/download` that runs a lightweight serializer (e.g., markdown->pdf stub) and asserts headers/status.
- End-to-end manual test plan for each format (verify content, images, bullet formatting).


## 11) Security and ops

- Keep binary generation server-side to avoid exposing API keys in the browser.
- Use signed URLs with short TTLs if storing artifacts in cloud storage.
- Rate limit generation endpoints to prevent abuse and large bills.
- For APKG generation (if using Python genanki), sandbox the process and validate inputs strictly.


## 12) Backwards compatibility and migrations

- Add DB migration to extend `outputs` with `fileId`, `mimeType`, `fileName`, `status`, `format`.
- Keep existing `content` as canonical textual content for re-generation.
- Ensure API returns both raw content and file metadata for consumers.


## 13) Recommended incremental implementation plan (concrete PRs)

PR #1 — Small, high-value (1-2 days)
- Add serializer: `flashcardsToCsv` + server endpoint `POST /api/download` that returns CSV (sync). Update `FlashcardsViewer` to offer CSV download that calls endpoint and streams CSV.
- Add tests for `flashcardsToCsv`.

PR #2 — Notes docx + pdf (2-4 days)
- Add `notesToDocx` using `docx` library and `notesToPdf` using Playwright (render markdown -> HTML -> PDF).
- Add worker skeleton to `processGenerate.ts` and endpoint to enqueue jobs. Add DB fields (migration) to track job status.
- Add UI download flow for notes (polling modal).

PR #3 — Slides PPTX (2-3 days)
- Implement `slidesToPptx` using `pptxgenjs` or `officegen`.
- Hook Slide Viewer `Export` to call endpoint and download PPTX when ready.
- Add tests for pptx generation (smoke tests verifying buffers and minimal structure).

PR #4 — Quiz CSV/QTI and APKG (optional)
- Add CSV export for quizzes and investigate QTI support.
- Research APKG generation: either 3rd-party node library or spawn Python genanki. Treat as separate feature (security review required).

PR #5 — Polish + Storage + CDN
- Upload generated artifacts to storage, return signed URLs, cleanup expired artifacts, and add monitoring and rate-limiting.


## 14) Acceptance criteria

- Users can download flashcards as CSV/Anki (.txt) and optionally APKG.
- Users can download notes as DOCX and PDF identical in content (headings/bullets preserved).
- Users can download slides as PPTX with slide titles & bullets preserved.
- All downloads work via stable server-side endpoints, respect authentication, and support large inputs via background jobs.


## 15) Next steps I can take for you (pick-any):
- Implement PR #1 (flashcards CSV endpoint + tests) and open incremental branch + patch.
- Implement PR #2 skeleton: Prisma migration + worker + notes docx/pdf serializer.
- Create sample serializer implementations (pptx/docx/pdf) and unit tests.

If you want, I can start with PR #1 now and open iterative commits.


---

End of document.
