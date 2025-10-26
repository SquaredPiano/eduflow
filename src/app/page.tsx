'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Sparkles, Zap, FileText, GraduationCap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP: Fade in hero elements with stagger
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll('.animate-fade-in');
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out'
        }
      );
    }

    // GSAP: Count up animation for stats
    if (statsRef.current) {
      const statNumbers = statsRef.current.querySelectorAll('.stat-number');
      statNumbers.forEach((stat) => {
        const target = parseInt(stat.getAttribute('data-target') || '0');
        const isPercentage = stat.textContent?.includes('%');
        
        gsap.to(stat, {
          innerHTML: isPercentage ? target : target,
          duration: 2,
          snap: { innerHTML: 1 },
          ease: 'power2.out',
          onUpdate: function() {
            const value = Math.ceil(gsap.getProperty(stat, 'innerHTML') as number);
            if (isPercentage) {
              stat.textContent = `${value}%`;
            } else {
              stat.textContent = `${value.toLocaleString()}+`;
            }
          }
        });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="rounded-lg bg-linear-to-br from-secondary/20 to-secondary/10 p-1.5 transition-all group-hover:scale-110">
                <GraduationCap className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-xl font-semibold text-foreground">EduFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/api/auth/login"
                className="inline-flex items-center justify-center rounded-lg bg-secondary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-secondary-hover hover:shadow-md hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-linear-to-b from-secondary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-2 text-sm font-medium text-secondary animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Learning Platform</span>
          </div>
          
          {/* Main heading */}
          <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-fade-in">
            Transform Learning with{' '}
            <span className="bg-linear-to-r from-secondary via-secondary/80 to-secondary/60 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>
          
          <p className="mx-auto mb-12 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in">
            Upload your educational content and let AI generate comprehensive notes, 
            interactive flashcards, quizzes, and presentation slides.
          </p>
          
          {/* CTA Button */}
          <div className="animate-fade-in">
            <Link
              href="/api/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-secondary px-8 py-4 text-base font-medium text-white shadow-lg transition-all hover:bg-secondary-hover hover:shadow-xl hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          {/* Stats */}
          <div ref={statsRef} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 animate-fade-in">
            <div className="text-center">
              <div className="stat-number text-4xl font-bold text-secondary mb-2" data-target="2500">0+</div>
              <div className="text-sm text-muted-foreground font-medium">Files Processed</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-4xl font-bold text-secondary mb-2" data-target="8400">0+</div>
              <div className="text-sm text-muted-foreground font-medium">AI Outputs</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-4xl font-bold text-secondary mb-2" data-target="620">0+</div>
              <div className="text-sm text-muted-foreground font-medium">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-4xl font-bold text-secondary mb-2" data-target="95">0%</div>
              <div className="text-sm text-muted-foreground font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Four Powerful Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AI-generated study materials from your content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-secondary/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all group-hover:scale-110">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Notes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive study notes extracted from lectures and documents
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-secondary/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all group-hover:scale-110">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Flashcards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Interactive cards with spaced repetition for better retention
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-secondary/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all group-hover:scale-110">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Quizzes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice questions generated to test your understanding
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-secondary/50 hover:-translate-y-1">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all group-hover:scale-110">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Slides</h3>
              <p className="text-muted-foreground leading-relaxed">
                Beautiful presentation decks created from your materials
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="rounded-lg bg-secondary/10 p-1.5">
                <GraduationCap className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-lg font-semibold text-foreground">EduFlow</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 EduFlow. Transform learning with AI.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
