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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Welcome back{userData?.user.name ? `, ${userData.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-muted-foreground">
            Your learning dashboard
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid gap-6 sm:grid-cols-3 mb-16">
          <div className="stat-card rounded-xl border border-border bg-card p-8 text-center shadow-sm hover:shadow-md transition-all">
            <FolderKanban className="h-8 w-8 text-secondary mx-auto mb-3" />
            <div className="stat-value text-4xl font-bold text-foreground mb-1" data-value={projects.length}>
              0
            </div>
            <div className="text-sm font-medium text-muted-foreground">Projects</div>
          </div>
          <div className="stat-card rounded-xl border border-border bg-card p-8 text-center shadow-sm hover:shadow-md transition-all">
            <FileText className="h-8 w-8 text-secondary mx-auto mb-3" />
            <div className="stat-value text-4xl font-bold text-foreground mb-1" data-value={totalFiles}>
              0
            </div>
            <div className="text-sm font-medium text-muted-foreground">Files</div>
          </div>
          <div className="stat-card rounded-xl border border-border bg-card p-8 text-center shadow-sm hover:shadow-md transition-all">
            <Brain className="h-8 w-8 text-secondary mx-auto mb-3" />
            <div className="stat-value text-4xl font-bold text-foreground mb-1" data-value={totalOutputs}>
              0
            </div>
            <div className="text-sm font-medium text-muted-foreground">AI Outputs</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <Link href="/dashboard/projects">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary-hover text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {projects.length === 0 ? 'Create Your First Project' : 'View All Projects'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div ref={cardsRef} className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Recent Projects</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <Link 
                  key={project.id} 
                  href={`/dashboard/project/${project.id}`}
                  className="project-card"
                >
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:border-secondary/50 transition-all hover:-translate-y-1 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="rounded-lg bg-secondary/10 p-2.5 group-hover:scale-110 transition-all">
                        <FolderKanban className="h-5 w-5 text-secondary" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{project._count?.files || 0} files</span>
                      <span>•</span>
                      <span>{project._count?.outputs || 0} outputs</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
