'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Loader2,
  Sparkles,
  FolderKanban,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserData {
  user: {
    name: string;
    email: string;
    picture?: string;
  };
}

interface Project {
  id: string;
  name: string;
  _count?: {
    files: number;
    outputs: number;
  };
}

export default function DashboardHome() {
  const { data: userData } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  const hasProjects = projects.length > 0;
  const hasFiles = projects.some(p => (p._count?.files || 0) > 0);
  const hasOutputs = projects.some(p => (p._count?.outputs || 0) > 0);

  const steps = [
    {
      id: 1,
      title: 'Create a Project',
      description: 'Start by creating your first project to organize your learning materials',
      completed: hasProjects,
      link: '/dashboard/projects',
      icon: FolderKanban,
    },
    {
      id: 2,
      title: 'Upload Materials',
      description: 'Add PDFs, videos, documents, or import from Canvas',
      completed: hasFiles,
      link: hasProjects ? `/dashboard/project/${projects[0]?.id}` : '/dashboard/projects',
      icon: Sparkles,
    },
    {
      id: 3,
      title: 'Generate AI Content',
      description: 'Create notes, flashcards, quizzes, and slides with AI',
      completed: hasOutputs,
      link: hasProjects ? `/dashboard/project/${projects[0]?.id}` : '/dashboard/projects',
      icon: Network,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            {userData?.user.picture && (
              <img 
                src={userData.user.picture} 
                alt={userData.user.name}
                className="h-16 w-16 rounded-full border-2 border-gray-200"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back{userData?.user.name ? `, ${userData.user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-gray-600 mt-1">
                Let's continue your learning journey
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">Projects</div>
            <div className="text-3xl font-semibold text-gray-900">{projects.length}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">Files</div>
            <div className="text-3xl font-semibold text-gray-900">
              {projects.reduce((acc, p) => acc + (p._count?.files || 0), 0)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-1">AI Outputs</div>
            <div className="text-3xl font-semibold text-gray-900">
              {projects.reduce((acc, p) => acc + (p._count?.outputs || 0), 0)}
            </div>
          </div>
        </div>

        {/* Getting Started Flow */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Getting Started</h2>
          <p className="text-gray-600 mb-8">Follow these steps to get the most out of EduFlow</p>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Icon and connector */}
                    <div className="relative flex flex-col items-center">
                      <div className={`
                        flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all
                        ${step.completed 
                          ? 'bg-green-50 border-green-500' 
                          : 'bg-gray-50 border-gray-300'
                        }
                      `}>
                        {step.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Icon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`
                          w-0.5 h-16 mt-2
                          ${step.completed ? 'bg-green-500' : 'bg-gray-300'}
                        `} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {step.description}
                          </p>
                          {step.completed && (
                            <div className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </div>
                          )}
                        </div>
                        {!step.completed && (
                          <Link href={step.link}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              {step.id === 1 ? 'Get Started' : 'Continue'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Complete State */}
          {hasProjects && hasFiles && hasOutputs && (
            <div className="mt-8 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">You're all set!</h3>
              </div>
              <p className="text-gray-600 mb-4">
                You've completed the onboarding. Continue exploring your projects and generating AI content.
              </p>
              <Link href="/dashboard/projects">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View All Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
