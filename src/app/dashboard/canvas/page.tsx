'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Network, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description?: string;
}

function CanvasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams?.get('project');

  // If a project ID is provided, redirect to that project's canvas
  if (projectId) {
    router.push(`/dashboard/project/${projectId}/canvas`);
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Fetch user's projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<{ projects: Project[] }>('/api/projects');
      return response.projects || [];
    },
  });

  return (
    <div className="h-full bg-linear-to-br from-green-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <Network className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Flow Canvas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visualize your learning journey with interactive flow diagrams. 
            Each project has its own canvas showing the relationships between files, AI agents, and outputs.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Project Canvases
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}/canvas`}
                  className="group"
                >
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-green-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-green-600 transition-colors">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Network className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first project to start visualizing your learning journey with Flow Canvas.
            </p>
            <Link href="/dashboard/projects">
              <Button className="bg-[#0b8e16] hover:bg-[#097a12]">
                Create Your First Project
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-12 rounded-xl bg-green-50 border border-green-100 p-6">
          <h3 className="font-semibold text-green-900 mb-3">
            💡 What is Flow Canvas?
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Visual representation of your project's files, AI agents, and generated outputs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Interactive nodes showing relationships and data flow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Real-time updates as you add content to your projects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Integrated AI chat for contextual help</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <CanvasContent />
    </Suspense>
  );
}
