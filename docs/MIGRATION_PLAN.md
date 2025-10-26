# 🚀 EduFlow Frontend Migration Plan

## Executive Summary

This document provides a complete step-by-step plan to migrate the YouPac AI frontend to work with EduFlow's Auth0 + REST API architecture.

**Current State**: Frontend copied from YouPac AI, uses Clerk auth + Convex database  
**Target State**: Working with Auth0 auth + REST API backend  
**Estimated Time**: 20-25 hours of focused work  

---

## 📊 Migration Scope

### Dependencies to Remove
- ✅ `@clerk/react-router` - 27 references
- ✅ `convex/react` - 30+ references

### Dependencies to Add
- ✅ `@tanstack/react-query` - For data fetching/caching
- ✅ `axios` or `ky` - For HTTP client (optional, can use fetch)

### Files Requiring Changes
**Critical (Blocks Everything)**:
1. `src/root.tsx` - Remove Clerk/Convex providers, add Auth0 context

**High Priority (Core Features)**:
2. `src/routes/dashboard/index.tsx` - Projects list
3. `src/routes/dashboard/project.$projectId.tsx` - Project view
4. `src/routes/dashboard/settings.tsx` - User settings
5. `src/components/dashboard/nav-user.tsx` - User dropdown

**Medium Priority (Features)**:
6. `src/routes/dashboard/chat.tsx` - Agent chat
7. `src/routes/share.$shareId.tsx` - Share view
8. `src/components/homepage/hero.tsx` - Stats (optional)
9. `src/components/homepage/hero-section.tsx` - Stats (optional)

**Low Priority (Advanced)**:
10. `src/components/canvas/Canvas.tsx` - Canvas editor
11. All canvas node components - File/Agent/Output nodes

---

## 🔧 Phase 1: Setup Foundation (2-3 hours)

### Step 1.1: Install Dependencies

```bash
npm install @tanstack/react-query
npm install axios  # Optional, can use fetch
```

### Step 1.2: Create Auth Context for React Router

Create `src/providers/Auth0Provider.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function Auth0Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data?.user || null);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within Auth0Provider');
  }
  return context;
}
```

### Step 1.3: Create React Query Client

Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Step 1.4: Create API Client Helper

Create `src/lib/apiClient.ts`:

```typescript
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    );
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new APIError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
```

### Step 1.5: Update root.tsx

Replace `src/root.tsx`:

```typescript
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Auth0Provider } from '@/providers/Auth0Provider';
import { queryClient } from '@/lib/queryClient';
import type { Route } from './+types/root';

import './app.css';

export const meta: Route.MetaFunction = () => [
  { title: 'EduFlow - AI-Powered Learning Platform' },
  { 
    name: 'description', 
    content: 'Transform your educational content with AI-powered transcription, notes, and flashcards' 
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <Auth0Provider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Auth0Provider>
  );
}
```

---

## 🔧 Phase 2: Update Core Components (3-4 hours)

### Step 2.1: Update nav-user.tsx

Replace `src/components/dashboard/nav-user.tsx`:

```typescript
'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/providers/Auth0Provider';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

### Step 2.2: Update dashboard layout

Replace `src/routes/dashboard/layout.tsx`:

```typescript
import { Outlet, redirect } from 'react-router';
import type { Route } from './+types/layout';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export async function loader({ request }: Route.LoaderArgs) {
  // Check auth on server side
  const response = await fetch(new URL('/api/auth/me', request.url), {
    headers: request.headers,
  });

  if (!response.ok) {
    throw redirect('/api/auth/login');
  }

  return null;
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <SiteHeader />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
```

---

## 🔧 Phase 3: Create Backend API Routes (4-5 hours)

### Step 3.1: Create Projects API

Create `src/app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get('includeArchived') === 'true';

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.sub,
      ...(includeArchived ? {} : { archived: false }),
    },
    include: {
      _count: {
        select: { files: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      userId: session.user.sub,
    },
  });

  return NextResponse.json(project);
}
```

Create `src/app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      userId: session.user.sub,
    },
    include: {
      files: {
        orderBy: { createdAt: 'desc' },
      },
      outputs: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, archived } = body;

  const project = await prisma.project.updateMany({
    where: {
      id: params.id,
      userId: session.user.sub,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(archived !== undefined && { archived }),
    },
  });

  if (project.count === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.deleteMany({
    where: {
      id: params.id,
      userId: session.user.sub,
    },
  });

  if (project.count === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

### Step 3.2: Update Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
  archived    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  files       File[]
  outputs     Output[]
  
  @@index([userId])
  @@index([userId, archived])
}

model File {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  url         String
  size        Int
  mimeType    String
  status      String   @default("pending") // pending, processing, ready, error
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  transcripts Transcript[]
  outputs     Output[]
  
  @@index([projectId])
}

model Output {
  id          String   @id @default(cuid())
  projectId   String
  fileId      String?
  type        String   // notes, flashcards, quiz, slides
  content     Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  file        File?    @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
  @@index([fileId])
}
```

Run migrations:

```bash
npx prisma migrate dev --name add_projects
npx prisma generate
```

---

## 🔧 Phase 4: Update Dashboard Routes (5-6 hours)

### Step 4.1: Update dashboard index (Projects List)

Replace `src/routes/dashboard/index.tsx`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    files: number;
  };
}

export default function DashboardIndex() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Fetch projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects'),
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully');
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleCreate = () => {
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    createMutation.mutate(newProject);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">
            Manage your learning projects and AI-generated content
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Give your project a name and description to get started
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., CS50 Course"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects && projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to start organizing your learning materials
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Link to={`/dashboard/project/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(project.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardTitle>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  {project._count.files} files
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 4.2: Update project view

Replace `src/routes/dashboard/project.$projectId.tsx`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { api } from '@/lib/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  files: any[];
  outputs: any[];
}

export default function ProjectView() {
  const { projectId } = useParams();

  const { data: project, isLoading } = useQuery<ProjectData>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground mt-2">{project.description}</p>
        )}
      </div>

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="outputs">AI Outputs</TabsTrigger>
          <TabsTrigger value="canvas">Canvas View</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          {/* File upload and management UI - TO BE BUILT */}
          <div className="text-muted-foreground">
            File management UI coming soon...
          </div>
        </TabsContent>

        <TabsContent value="outputs" className="mt-6">
          {/* AI outputs viewer - TO BE BUILT */}
          <div className="text-muted-foreground">
            AI outputs viewer coming soon...
          </div>
        </TabsContent>

        <TabsContent value="canvas" className="mt-6">
          {/* Flow canvas - TO BE BUILT */}
          <div className="text-muted-foreground">
            Flow canvas coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🔧 Phase 5: Canvas Import Wizard (3-4 hours)

### Step 5.1: Create Canvas Import API

This connects to your existing `src/adapters/canvas.adapter.ts`.

Create `src/app/api/canvas/courses/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { canvasAdapter } from '@/adapters/canvas.adapter';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { canvasUrl, accessToken } = await request.json();

  if (!canvasUrl || !accessToken) {
    return NextResponse.json(
      { error: 'Canvas URL and access token are required' },
      { status: 400 }
    );
  }

  try {
    // Verify token and get courses
    const courses = await canvasAdapter.getCourses(canvasUrl, accessToken);
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses from Canvas' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/canvas/files/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';
import { canvasAdapter } from '@/adapters/canvas.adapter';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { canvasUrl, accessToken, courseIds } = await request.json();

  if (!canvasUrl || !accessToken || !courseIds) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const files = await canvasAdapter.getFilesFromCourses(
      canvasUrl,
      accessToken,
      courseIds
    );
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch files from Canvas' },
      { status: 500 }
    );
  }
}
```

### Step 5.2: Create Import Wizard Component

Create `src/components/canvas/ImportCanvasWizard.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImportCanvasWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCanvasWizard({ open, onOpenChange }: ImportCanvasWizardProps) {
  const [step, setStep] = useState(1);
  const [canvasUrl, setCanvasUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Step 1: Verify token and fetch courses
  const fetchCoursesMutation = useMutation({
    mutationFn: () => api.post('/api/canvas/courses', { canvasUrl, accessToken }),
    onSuccess: (data) => {
      setCourses(data);
      setStep(2);
    },
    onError: () => {
      toast.error('Failed to connect to Canvas. Check your URL and token.');
    },
  });

  // Step 2: Fetch files from selected courses
  const fetchFilesMutation = useMutation({
    mutationFn: () =>
      api.post('/api/canvas/files', {
        canvasUrl,
        accessToken,
        courseIds: selectedCourses,
      }),
    onSuccess: (data) => {
      setFiles(data);
      setStep(3);
    },
    onError: () => {
      toast.error('Failed to fetch files from courses');
    },
  });

  // Step 3: Import selected files
  const importFilesMutation = useMutation({
    mutationFn: () =>
      api.post('/api/canvas/import', {
        canvasUrl,
        accessToken,
        fileIds: selectedFiles,
      }),
    onSuccess: () => {
      toast.success('Files imported successfully!');
      onOpenChange(false);
      // Reset state
      setStep(1);
      setCanvasUrl('');
      setAccessToken('');
      setCourses([]);
      setSelectedCourses([]);
      setFiles([]);
      setSelectedFiles([]);
    },
    onError: () => {
      toast.error('Failed to import files');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import from Canvas LMS</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {
              step === 1 ? 'Connect to Canvas' :
              step === 2 ? 'Select Courses' :
              'Select Files'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="canvasUrl">Canvas URL</Label>
              <Input
                id="canvasUrl"
                placeholder="https://canvas.institution.edu"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Your Canvas API token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your token from Canvas Settings → Approved Integrations
              </p>
            </div>
            <Button
              onClick={() => fetchCoursesMutation.mutate()}
              disabled={!canvasUrl || !accessToken || fetchCoursesMutation.isPending}
              className="w-full"
            >
              {fetchCoursesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Connect & Fetch Courses
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the courses you want to import files from
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={course.id}
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCourses([...selectedCourses, course.id]);
                      } else {
                        setSelectedCourses(selectedCourses.filter((id) => id !== course.id));
                      }
                    }}
                  />
                  <Label htmlFor={course.id} className="cursor-pointer">
                    {course.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => fetchFilesMutation.mutate()}
                disabled={selectedCourses.length === 0 || fetchFilesMutation.isPending}
                className="flex-1"
              >
                {fetchFilesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Next: Select Files
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the files you want to import ({selectedFiles.length} selected)
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={file.id}
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFiles([...selectedFiles, file.id]);
                      } else {
                        setSelectedFiles(selectedFiles.filter((id) => id !== file.id));
                      }
                    }}
                  />
                  <Label htmlFor={file.id} className="cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                      <span>{file.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => importFilesMutation.mutate()}
                disabled={selectedFiles.length === 0 || importFilesMutation.isPending}
                className="flex-1"
              >
                {importFilesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import {selectedFiles.length} Files
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 Testing Checklist

### Foundation Tests
- [ ] Auth0 login/logout works
- [ ] Protected routes redirect to login
- [ ] User info appears in navbar after login
- [ ] React Query dev tools visible in dev mode

### Projects Tests
- [ ] Create new project
- [ ] View projects list
- [ ] Delete project
- [ ] View individual project
- [ ] Navigate between tabs

### Canvas Import Tests
- [ ] Enter Canvas credentials
- [ ] Fetch courses successfully
- [ ] Select multiple courses
- [ ] Fetch files from courses
- [ ] Select files
- [ ] Import files to project

---

## 📊 Migration Progress Tracker

Copy this to track your progress:

```markdown
## Phase 1: Foundation
- [ ] Install dependencies
- [ ] Create Auth0Provider
- [ ] Create React Query client
- [ ] Create API client helper
- [ ] Update root.tsx

## Phase 2: Core Components
- [ ] Update nav-user.tsx
- [ ] Update dashboard layout
- [ ] Test auth flow

## Phase 3: Backend APIs
- [ ] Create projects API (GET, POST)
- [ ] Create projects/[id] API (GET, PATCH, DELETE)
- [ ] Update Prisma schema
- [ ] Run migrations
- [ ] Test APIs with Postman/Thunder Client

## Phase 4: Dashboard Routes
- [ ] Update dashboard index
- [ ] Update project view
- [ ] Test project CRUD operations

## Phase 5: Canvas Import
- [ ] Create canvas/courses API
- [ ] Create canvas/files API
- [ ] Create ImportCanvasWizard component
- [ ] Test full import flow

## Phase 6: Polish (Future)
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Add toast notifications
- [ ] Test on mobile
- [ ] Performance optimization
```

---

## 🚀 Quick Start Commands

```bash
# Install new dependencies
npm install @tanstack/react-query axios

# Create new files
mkdir -p src/providers
mkdir -p src/lib
mkdir -p src/app/api/projects
mkdir -p src/app/api/canvas
mkdir -p src/components/canvas

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start dev server
npm run dev

# Test in browser
# 1. Visit http://localhost:3000
# 2. Click sign in
# 3. After login, go to /dashboard
# 4. Try creating a project
```

---

## 🆘 Common Issues & Solutions

### Issue: Auth loop (keeps redirecting)
**Solution**: Make sure middleware doesn't protect `/api/auth/*` routes

### Issue: React Query not working
**Solution**: Ensure QueryClientProvider wraps your app in root.tsx

### Issue: API returns 401
**Solution**: Check Auth0 session is valid, inspect network tab

### Issue: Prisma client not found
**Solution**: Run `npx prisma generate` after schema changes

### Issue: Canvas import fails
**Solution**: Verify Canvas URL format and token validity

---

## 📚 Reference Documentation

- **Auth0 React Router**: https://auth0.com/docs/quickstart/spa/react
- **React Query**: https://tanstack.com/query/latest/docs/framework/react/overview
- **Prisma**: https://www.prisma.io/docs/
- **Canvas LMS API**: https://canvas.instructure.com/doc/api/

---

**This plan provides everything needed to complete the migration. Start with Phase 1 and work sequentially. Each phase builds on the previous one. Good luck! 🚀**
