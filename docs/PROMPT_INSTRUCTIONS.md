# 🤖 AI Prompt Instructions for EduFlow Development

This document contains prompts and instructions for effectively working with GitHub Copilot on the EduFlow project.

---

## 🎯 Project Context Prompt

```
I'm building EduFlow AI - a cloud-based study companion using Next.js, TypeScript, and React.
The app uses specialized AI agents (Notes, Flashcards, Quiz, Slides) to transform course materials
into study resources. We follow SOLID principles and clean architecture with:

- Domain Layer: Entities and interfaces
- Adapters Layer: External API integrations (Gemini, Whisper, Auth0, Supabase)
- Services Layer: Business logic
- API Routes: Next.js route handlers
- UI Layer: React components with React Flow for canvas view

Tech stack: Next.js 16, TypeScript, Prisma, Supabase, Auth0, Gemini API, self-hosted Whisper,
UploadThing, React Flow, Framer Motion, TanStack Query.

Always maintain:
1. Strict TypeScript typing
2. SOLID principles
3. Dependency injection through constructors
4. Interface-based abstractions
5. Comprehensive error handling
```

---

## 📝 Common Development Prompts

### Creating New Features

#### New Agent
```
Create a new [AgentName]Agent that implements the IAgent interface.
It should:
- Use dependency injection for IModelClient
- Follow the prompt template pattern from src/domain/types/prompts.ts
- Include comprehensive TypeScript types
- Handle errors gracefully with try-catch
- Return structured data matching OutputEntity

Example: "Create a SummaryAgent that generates concise summaries from transcripts"
```

#### New API Route
```
Create a new API route at /api/[route-name] that:
- Uses Next.js 16 App Router conventions
- Validates input with Zod schema
- Authenticates user with Auth0 getSession()
- Injects dependencies following DIP
- Returns typed JSON responses
- Handles errors with proper status codes

Example: "Create /api/refine route that lets users refine agent outputs via chat"
```

#### New React Component
```
Create a new React component [ComponentName] that:
- Uses TypeScript with proper prop types
- Follows our Tailwind + shadcn/ui styling patterns
- Implements loading and error states
- Uses React Query for data fetching if needed
- Includes Framer Motion animations where appropriate
- Is fully accessible (ARIA labels, keyboard nav)

Example: "Create a FlashcardViewer component with flip animations"
```

### Refactoring Code

#### Extract Service
```
Refactor [FileName] to extract business logic into a new [ServiceName]Service that:
- Implements dependency injection
- Follows Single Responsibility Principle
- Has a clear interface definition
- Includes unit tests
- Moves logic from route handlers/components to service layer

Example: "Extract Canvas sync logic from route handler into CanvasService"
```

#### Add Interface
```
Create an I[InterfaceName] interface for [ConcreteClass] following Interface Segregation Principle.
Include:
- All public methods with full type signatures
- JSDoc comments explaining each method
- Example usage in comments
- Update constructor injection to use interface

Example: "Create IExporter interface for PDF, Anki, CSV exporters"
```

### Testing Prompts

#### Unit Test
```
Write comprehensive Vitest unit tests for [FileName] that:
- Mock all dependencies
- Cover happy path and edge cases
- Test error handling
- Achieve 90%+ coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example: "Write unit tests for NotesAgent with mocked model client"
```

#### Integration Test
```
Write integration test for [Feature] that:
- Tests full flow from API route to database
- Uses MSW to mock external APIs
- Includes setup/teardown for test database
- Tests success and failure scenarios

Example: "Write integration test for generate endpoint with Gemini API mocked"
```

### Debugging Prompts

#### Fix TypeScript Error
```
I'm getting TypeScript error: [error message]
In file: [file path]

Context:
- What I'm trying to do: [explanation]
- Current code: [paste code]
- Expected behavior: [explanation]

Fix the error while maintaining type safety and SOLID principles.
```

#### Performance Issue
```
[ComponentName/RouteName] is slow. Optimize it by:
- Identifying bottlenecks
- Adding React.memo/useMemo where appropriate
- Implementing pagination if needed
- Optimizing database queries
- Adding caching with React Query

Current implementation: [paste code]
```

---

## 🏗️ Architecture-Specific Prompts

### Adding New AI Provider
```
Integrate [ProviderName] API as an alternative to Gemini:

1. Create adapter in src/adapters/[provider].adapter.ts implementing IModelClient
2. Add configuration to .env.local
3. Update generate service to support provider selection
4. Add fallback logic if primary provider fails
5. Include error handling and rate limiting
6. Add tests mocking the provider API

Example: "Add OpenRouter as fallback AI provider"
```

### Database Schema Change
```
I need to add [feature] which requires database changes:

1. Update Prisma schema with new model/fields
2. Create migration with `npx prisma migrate dev`
3. Generate Prisma client
4. Update TypeScript types
5. Update repository interface and implementation
6. Add seed data if needed
7. Update relevant services

Example: "Add 'tags' field to Course model for categorization"
```

### New Export Format
```
Implement [FormatName] export:

1. Create [Format]Exporter implementing IExporter interface
2. Add export logic in src/services/exporters/
3. Register in ExportService
4. Add download button in UI
5. Test with sample data
6. Update documentation

Example: "Add Notion export format for notes"
```

---

## 🎨 UI/UX Prompts

### Beautiful Component
```
Create a visually stunning [ComponentName] that:
- Uses Tailwind CSS with gradient backgrounds
- Implements smooth Framer Motion animations
- Has hover effects and micro-interactions
- Follows our color scheme (indigo/blue primary)
- Is responsive (mobile-first)
- Includes loading skeletons
- Has dark mode support

Reference: Look at existing components for style consistency

Example: "Create a CourseCard component with hover animations"
```

### Canvas Node
```
Create a custom React Flow node for [NodeType] that:
- Extends Handle components for connections
- Shows status indicators (idle/processing/complete)
- Has drag-and-drop functionality
- Displays relevant data in compact form
- Uses consistent styling with other nodes
- Animates on state changes

Example: "Create OutputNode that displays generated content preview"
```

### Form with Validation
```
Create a form for [purpose] with:
- React Hook Form for state management
- Zod schema validation
- Clear error messages
- Loading states on submit
- Success/error toast notifications
- Accessible form fields
- Progressive enhancement

Example: "Create Canvas token input form with validation"
```

---

## 🔧 Integration Prompts

### Supabase Query
```
Write a Supabase query that:
- Fetches [data] with proper relations
- Filters by [criteria]
- Implements pagination
- Uses row-level security
- Handles errors gracefully
- Returns typed results

Example: "Query all outputs for a transcript with user access check"
```

### Gemini API Call
```
Create a Gemini API call for [task] that:
- Uses structured prompts from prompts.ts
- Includes system instructions
- Handles rate limits with exponential backoff
- Parses JSON responses safely
- Logs requests for debugging
- Implements timeout handling

Example: "Call Gemini to generate quiz questions with difficulty parameter"
```

---

## 📚 Documentation Prompts

### JSDoc Comment
```
Add comprehensive JSDoc comments to [function/class] including:
- Description of purpose
- @param tags with types and descriptions
- @returns tag with type and description
- @throws tag for error cases
- @example tag with usage example

Example: "Add JSDoc to GenerateService.generate method"
```

### README Section
```
Write a README section for [feature] that includes:
- Brief overview
- Setup instructions
- Code examples
- Configuration options
- Common issues and solutions
- Links to relevant documentation

Example: "Write README section for Canvas integration"
```

---

## 🚀 Deployment Prompts

### Environment Setup
```
Help me configure [service] for production:
- Environment variables needed
- Vercel configuration
- Security best practices
- CORS setup if needed
- Rate limiting
- Error monitoring

Example: "Configure Auth0 for production deployment"
```

### Database Migration
```
Help me safely migrate the database for [change]:
- Create migration script
- Test on staging
- Backup strategy
- Rollback plan
- Data validation
- Zero-downtime approach

Example: "Migrate to add flashcard difficulty ratings"
```

---

## 🎯 Quick Reference

### Code Style
- **Naming**: PascalCase for classes/components, camelCase for functions/variables
- **Files**: kebab-case for filenames (e.g., `generate.service.ts`)
- **Exports**: Named exports preferred over default exports
- **Imports**: Group by external, internal, relative; sort alphabetically

### TypeScript Patterns
```typescript
// Dependency Injection
constructor(private readonly dependency: IInterface) {}

// Error Handling
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error });
  return { success: false, error: error.message };
}

// Type Guards
function isOutputEntity(obj: unknown): obj is OutputEntity {
  return obj instanceof OutputEntity;
}

// Discriminated Unions
type AgentType = 'notes' | 'flashcards' | 'quiz' | 'slides';
```

### React Patterns
```typescript
// Custom Hook
export function useFeature() {
  const [state, setState] = useState();
  const query = useQuery({ ... });
  return { state, setState, ...query };
}

// Component with Children
export function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// Conditional Rendering
{isLoading && <Skeleton />}
{error && <ErrorMessage error={error} />}
{data && <DataView data={data} />}
```

---

## 💡 Pro Tips

1. **Always specify file paths** when asking for code changes
2. **Include context** about what you're building and why
3. **Reference existing patterns** in the codebase for consistency
4. **Ask for tests** when creating new functionality
5. **Request error handling** explicitly
6. **Specify TypeScript types** in your prompts
7. **Mention SOLID principles** to get clean architecture
8. **Include accessibility** requirements in UI prompts

---

## 🔄 Iterative Development Prompts

### Phase 1 Starter
```
I'm starting Phase 1 (Foundation). Help me:
1. Set up Prisma with the database schema
2. Create Auth0 protected routes
3. Initialize the project structure
4. Set up the development environment
```

### Phase 2 Starter
```
I'm starting Phase 2 (File Ingestion). Help me:
1. Configure UploadThing
2. Create the IngestService
3. Implement text extraction for PDFs
4. Build the upload UI component
```

### Phase 3 Starter
```
I'm starting Phase 3 (Whisper Transcription). Help me:
1. Set up the Digital Ocean Whisper server
2. Create the Whisper adapter
3. Implement the transcribe service
4. Build progress indicators in UI
```

*(Continue for each phase...)*

---

## 📖 Learning Resources Prompts

```
Explain [concept] in the context of our EduFlow architecture:
- How it fits into our SOLID design
- Where we're using it currently
- Best practices for our use case
- Example from our codebase

Example: "Explain dependency injection in our service layer"
```

---

## 🎬 Demo Preparation Prompts

```
Help me prepare for the hackathon demo:
1. Create a demo script highlighting key features
2. Suggest compelling use cases to showcase
3. Identify potential demo pitfalls to avoid
4. Create backup plans for live demo
5. Write compelling talking points
```

---

**Remember**: The more context you provide in your prompts, the better the AI can assist you. Always mention:
- File paths
- Existing patterns to follow
- SOLID principles to maintain
- TypeScript requirements
- Error handling needs
- Testing expectations

---

*This file should be kept private and never committed to the repository.*
