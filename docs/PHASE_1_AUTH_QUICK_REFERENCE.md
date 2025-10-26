# Phase 1 Authentication - Quick Reference

Quick reference for using the Phase 1 authentication system.

---

## Client-Side (React Components)

### Using `useAuth` Hook

```typescript
'use client'
import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, status, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  )
}
```

### Auth State

```typescript
interface AuthUser {
  id: string          // Database user ID (not Auth0 sub)
  name?: string | null
  email?: string | null
  picture?: string | null
}

type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

// Hook returns:
{
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  error: Error | undefined
  isLoading: boolean
}
```

---

## Server-Side (API Routes)

### Method 1: Using `withAuth` HOC (Recommended)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/apiAuth'

export const GET = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  // user is the database User record
  
  return NextResponse.json({
    message: `Hello, ${user.name}!`,
    userId: user.id,
  })
})
```

### Method 2: Manual Auth Check

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/apiAuth'

export async function POST(request: NextRequest) {
  const user = await requireAuth(request)
  
  if (!user) {
    return unauthorizedResponse()
  }
  
  // Your logic here with authenticated user
  
  return NextResponse.json({ success: true })
}
```

### Method 3: Optional Auth (Public Endpoint with User Info)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/apiAuth'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  
  // user may be null if not authenticated
  if (user) {
    // Show user-specific data
    return NextResponse.json({ message: `Hello, ${user.name}!` })
  } else {
    // Show public data
    return NextResponse.json({ message: 'Hello, guest!' })
  }
}
```

---

## Server Components

### Getting Session

```typescript
import { auth0 } from '@/lib/auth0'

export default async function ServerComponent() {
  const session = await auth0.getSession()
  
  if (!session) {
    return <div>Not logged in</div>
  }
  
  return <div>Hello, {session.user.name}!</div>
}
```

### Getting Database User

```typescript
import { auth0 } from '@/lib/auth0'
import { getUserByAuth0Id } from '@/lib/userSync'

export default async function ServerComponent() {
  const session = await auth0.getSession()
  
  if (!session?.user.sub) {
    return <div>Not logged in</div>
  }
  
  const user = await getUserByAuth0Id(session.user.sub)
  
  if (!user) {
    return <div>User not found in database</div>
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Courses: {user.courses.length}</p>
      <p>Files: {user.files.length}</p>
    </div>
  )
}
```

---

## Database Queries

### Get User with Relations

```typescript
import { getUserByAuth0Id } from '@/lib/userSync'

const user = await getUserByAuth0Id(auth0Id)
// Returns user with courses, files, transcripts, outputs
```

### Sync User from Session

```typescript
import { syncUserToDatabase } from '@/lib/userSync'

const session = await auth0.getSession()
const user = await syncUserToDatabase(session)
// Creates or updates user in database
```

### Manual User Query

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    courses: true,
    files: {
      include: {
        transcripts: {
          include: {
            outputs: true,
          },
        },
      },
    },
  },
})
```

---

## Auth Links

### Login

```tsx
<a href="/auth/login">Sign In</a>
// or
<Link href="/auth/login">Sign In</Link>
```

### Logout

```tsx
<a href="/auth/logout">Sign Out</a>
// or
<Link href="/auth/logout">Sign Out</Link>
```

### Sign Up (Auth0 Sign Up Screen)

```tsx
<a href="/auth/login?screen_hint=signup">Create Account</a>
```

---

## Route Protection

### Protected Routes (Middleware)

These routes automatically require authentication:
- `/dashboard`
- `/api/generate`
- `/api/transcribe`
- `/api/export`
- `/api/ingest`
- `/api/canvas-sync`

Unauthenticated users are redirected to `/auth/login`.

### Public Routes

These routes are always accessible:
- `/` (landing page)
- `/auth/*` (Auth0 routes)
- `/api/uploadthing` (UploadThing routes)

### Adding Protected Routes

Edit `src/middleware.ts`:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/api/generate',
  '/api/transcribe',
  '/api/export',
  '/api/ingest',
  '/api/canvas-sync',
  '/your-new-route', // Add here
]
```

---

## Common Patterns

### Conditional Rendering Based on Auth

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <>
      {isAuthenticated ? (
        <AuthenticatedView />
      ) : (
        <UnauthenticatedView />
      )}
    </>
  )
}
```

### Redirect if Not Authenticated

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])
  
  if (isLoading || !isAuthenticated) return null
  
  return <div>Protected content</div>
}
```

### Redirect if Authenticated

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])
  
  if (isLoading || isAuthenticated) return null
  
  return <div>Landing page content</div>
}
```

---

## Debugging

### Check Auth State

```typescript
const { user, status, isAuthenticated, error } = useAuth()
console.log('Auth State:', { user, status, isAuthenticated, error })
```

### Check Session (Server)

```typescript
const session = await auth0.getSession()
console.log('Session:', session)
```

### Check Database User

```typescript
import { getUserByAuth0Id } from '@/lib/userSync'

const user = await getUserByAuth0Id(auth0Id)
console.log('DB User:', user)
```

### Check Middleware Logs

Middleware logs when syncing users:
```
User synced: user@example.com (clxxxxx)
```

---

## TypeScript Types

```typescript
// Auth User (from useAuth hook)
interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  picture?: string | null
}

// Database User (from Prisma)
interface User {
  id: string
  email: string
  auth0Id: string
  name: string | null
  createdAt: Date
  courses: Course[]
  files: File[]
}

// Auth Status
type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'
```

---

## Summary

**Client-Side**: Use `useAuth()` hook  
**Server-Side API**: Use `withAuth()` HOC  
**Server Components**: Use `auth0.getSession()` + `getUserByAuth0Id()`  
**Route Protection**: Automatic via middleware  
**Login/Logout**: Use `/auth/login` and `/auth/logout` links

---

## Need Help?

- See `docs/PHASE_1_AUTH_TESTING.md` for complete testing guide
- See `docs/PHASE_1_FIXES_SUMMARY.md` for implementation details
- See `docs/AUTH_FLOW_IMPLEMENTATION.md` for architecture overview
