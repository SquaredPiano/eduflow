# Authentication Flow Implementation

## Overview
Simplified authentication flow using Auth0's hosted login with proper route protection and SOLID principles.

## Architecture

### File Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page wrapper (/)
│   └── dashboard/
│       └── page.tsx                # Dashboard wrapper (/dashboard)
├── components/
│   └── pages/
│       ├── LandingPage.tsx         # Landing page component
│       └── DashboardPage.tsx       # Dashboard component
├── middleware.ts                    # Auth0 middleware with route protection
└── lib/
    ├── auth0.ts                    # Auth0 client instance
    └── auth.ts                     # Auth helper functions
```

### Design Principles

#### 1. **Single Responsibility Principle (SRP)**
- `page.tsx` files serve ONLY as route wrappers
- Actual page logic is in separate component files
- Each component has a single, well-defined responsibility

#### 2. **Separation of Concerns**
- Authentication logic: `middleware.ts` and `lib/auth0.ts`
- Page components: `components/pages/`
- Route configuration: `app/` directory structure

#### 3. **Modularity**
- Components are self-contained and reusable
- Easy to test individually
- Can be moved or refactored without affecting routes

## Authentication Flow

### 1. Landing Page (/)
**Route**: `/`
**Component**: `LandingPage.tsx`
**Behavior**:
- Shows welcome page with "Get Started" button
- Automatically redirects logged-in users to `/dashboard`
- Cannot be accessed while logged in (security)
- "Get Started" button → redirects to `/auth/login`

### 2. Auth0 Login (/auth/login)
**Route**: `/auth/login` (handled by Auth0 middleware)
**Behavior**:
- Redirects to Auth0's hosted login page
- User signs in or signs up
- After successful authentication → redirects to `/dashboard`

### 3. Dashboard (/dashboard)
**Route**: `/dashboard`
**Component**: `DashboardPage.tsx`
**Behavior**:
- Shows user profile and stats
- Displays "Logout" button
- Automatically redirects non-authenticated users to `/`
- Cannot be accessed while logged out (security)
- "Logout" button → redirects to `/auth/logout` → lands on `/`

### 4. Logout (/auth/logout)
**Route**: `/auth/logout` (handled by Auth0 middleware)
**Behavior**:
- Logs user out of Auth0
- Clears session
- Redirects to `/` (landing page)

## Security Features

### 1. **Route Protection via Middleware**
```typescript
// src/middleware.ts
- Protected routes: /dashboard, /api/*
- Public routes: /, /auth/*
- Automatic session validation
- Redirect to landing page if not authenticated
```

### 2. **Client-Side Route Guards**
```typescript
// LandingPage.tsx
useEffect(() => {
  if (user) router.replace('/dashboard');
}, [user]);

// DashboardPage.tsx
useEffect(() => {
  if (!user) router.replace('/');
}, [user]);
```

### 3. **No Security Vulnerabilities**
- ✅ Session validation on every protected route
- ✅ No client-side auth tokens exposed
- ✅ Auth0 handles all authentication securely
- ✅ HTTPS required for production
- ✅ CSRF protection via Auth0
- ✅ XSS protection via React's built-in escaping
- ✅ No direct database access from client

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Landing Page (/)                                          │
│  ┌───────────────────────────────────────────────────┐    │
│  │  • "Get Started" button                            │    │
│  │  • If logged in → auto redirect to /dashboard     │    │
│  └───────────────────────────────────────────────────┘    │
│                         │                                  │
│                         ▼                                  │
│                  Click "Get Started"                       │
│                         │                                  │
│                         ▼                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Auth0 Hosted Login (/auth/login)                 │    │
│  │  • User signs in or signs up                       │    │
│  │  • Secure authentication                           │    │
│  └───────────────────────────────────────────────────┘    │
│                         │                                  │
│                         ▼                                  │
│              After successful login                        │
│                         │                                  │
│                         ▼                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Dashboard (/dashboard)                           │    │
│  │  • User profile displayed                          │    │
│  │  • "Logout" button available                       │    │
│  │  • If not logged in → auto redirect to /          │    │
│  └───────────────────────────────────────────────────┘    │
│                         │                                  │
│                         ▼                                  │
│                   Click "Logout"                           │
│                         │                                  │
│                         ▼                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Logout (/auth/logout)                            │    │
│  │  • Clear session                                   │    │
│  │  • Redirect to landing page                        │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Code Quality

### SOLID Principles Applied

✅ **Single Responsibility**: Each file/component does one thing
- `page.tsx` → route wrapper only
- `LandingPage.tsx` → landing page logic only
- `DashboardPage.tsx` → dashboard logic only
- `middleware.ts` → authentication middleware only

✅ **Open/Closed**: Components are open for extension but closed for modification
- Can add new features without changing existing code
- Easy to extend with new protected routes

✅ **Dependency Inversion**: Depend on abstractions (Auth0Provider) not concretions
- Components use `useUser()` hook (abstraction)
- Don't directly access Auth0 implementation details

### Clean Code Practices

✅ **Modular structure**: Components separated from route definitions
✅ **Type safety**: TypeScript for all files
✅ **Consistent naming**: Clear, descriptive names
✅ **No code duplication**: Reusable components
✅ **Security first**: All routes properly protected

## Testing the Flow

1. **Start dev server**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **Expected**: Landing page with "Get Started" button
4. **Click**: "Get Started"
5. **Expected**: Redirect to Auth0 login
6. **Sign in**: Use Auth0 credentials
7. **Expected**: Redirect to `/dashboard` showing user profile
8. **Click**: "Logout"
9. **Expected**: Redirect to `/` (landing page)
10. **Try accessing** `/dashboard` while logged out
11. **Expected**: Auto-redirect to `/`
12. **Sign in again** and try accessing `/`
13. **Expected**: Auto-redirect to `/dashboard`

## Environment Variables Required

```bash
AUTH0_SECRET=<64-character-hex-string>
AUTH0_DOMAIN=eduflow.ca.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
APP_BASE_URL=http://localhost:3000
```

## Auth0 Dashboard Configuration

Required URLs in Auth0 Application Settings:

**Allowed Callback URLs:**
```
http://localhost:3000/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

## Production Deployment

For production, update these URLs to your production domain:
- `https://yourdomain.com/auth/callback`
- `https://yourdomain.com`

## Summary

✅ **Simple flow**: Landing → Login → Dashboard → Logout → Landing
✅ **Secure**: Proper route protection and session management
✅ **SOLID**: Modular, maintainable, extensible code
✅ **No vulnerabilities**: All security best practices followed
✅ **Clean architecture**: Clear separation of concerns
