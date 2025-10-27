'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  ArrowRight, 
  Loader2,
  Sparkles,
  FolderKanban,
  FileText,
  Brain
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
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: userData } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
  });

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  const totalFiles = projects.reduce((acc, p) => acc + (p._count?.files || 0), 0);
  const totalOutputs = projects.reduce((acc, p) => acc + (p._count?.outputs || 0), 0);

  useEffect(() => {
    // GSAP: Animate stats on load
    if (statsRef.current && !isLoading) {
      const cards = statsRef.current.querySelectorAll('.stat-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );

      // Animate numbers
      const numbers = statsRef.current.querySelectorAll('.stat-value');
      numbers.forEach((num) => {
        const target = parseInt(num.getAttribute('data-value') || '0');
        gsap.to(num, {
          innerHTML: target,
          duration: 1.5,
          snap: { innerHTML: 1 },
          ease: 'power2.out',
        });
      });
    }

    // GSAP: Animate project cards
    if (cardsRef.current && projects.length > 0) {
      const cards = cardsRef.current.querySelectorAll('.project-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    }
  }, [projects, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Header with green accent */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-6 shadow-lg shadow-emerald-500/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-3">
            Welcome back{userData?.user.name ? `, ${userData.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-powered learning dashboard
          </p>
        </div>

        {/* Stats with green theme */}
        <div ref={statsRef} className="grid gap-6 sm:grid-cols-3 mb-12">
          <div className="stat-card rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all hover:-translate-y-1 group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/30">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <div className="stat-value text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-1" data-value={projects.length}>
              0
            </div>
            <div className="text-sm font-medium text-gray-600">Projects</div>
          </div>
          <div className="stat-card rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all hover:-translate-y-1 group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="stat-value text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-1" data-value={totalFiles}>
              0
            </div>
            <div className="text-sm font-medium text-gray-600">Files</div>
          </div>
          <div className="stat-card rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all hover:-translate-y-1 group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/30">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="stat-value text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-1" data-value={totalOutputs}>
              0
            </div>
            <div className="text-sm font-medium text-gray-600">AI Outputs</div>
          </div>
        </div>

        {/* Quick Actions with gradient buttons */}
        <div className="text-center space-y-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-200 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to learn?</h2>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? "Create your first project and start transforming your learning materials with AI"
                : "Continue your learning journey or start a new project"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/projects">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:scale-105 w-full sm:w-auto"
                >
                  <FolderKanban className="mr-2 h-5 w-5" />
                  {projects.length === 0 ? 'Create Your First Project' : 'View All Projects'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {projects.length > 0 && (
                <Link href="/dashboard/projects">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all hover:scale-105 w-full sm:w-auto"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create New Project
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto mt-8">
            <div className="text-center p-6 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-md">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Notes</h3>
              <p className="text-xs text-gray-600">AI-generated comprehensive study notes</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-md">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 mb-3">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Flashcards</h3>
              <p className="text-xs text-gray-600">Interactive cards for active recall</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-md">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Quizzes</h3>
              <p className="text-xs text-gray-600">Practice tests to reinforce learning</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-md">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 mb-3">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Presentations</h3>
              <p className="text-xs text-gray-600">Beautiful slides from your materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
