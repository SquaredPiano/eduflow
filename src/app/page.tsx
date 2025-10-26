import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Sparkles, Zap, FileText, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">EduFlow</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/api/auth/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative mx-auto max-w-6xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Learning Platform</span>
          </div>
          
          {/* Main heading */}
          <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight">
            Transform Learning with{' '}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-secondary bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            Upload your educational content and watch as our advanced AI generates comprehensive notes, 
            interactive flashcards, quizzes, and presentation slides—all tailored to accelerate your learning journey.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/api/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent"
            >
              Learn More
            </a>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2,500+</div>
              <div className="text-sm text-muted-foreground">Files Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">8,400+</div>
              <div className="text-sm text-muted-foreground">AI Outputs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">620+</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary-light px-4 py-1.5 text-sm font-medium text-secondary ring-1 ring-inset ring-secondary/20">
              <Zap className="h-4 w-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform transforms your study materials into comprehensive learning tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Notes</h3>
              <p className="text-muted-foreground">
                AI-generated comprehensive notes from your lectures, videos, and documents
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Flashcards</h3>
              <p className="text-muted-foreground">
                Interactive flashcards with spaced repetition to maximize retention
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quizzes</h3>
              <p className="text-muted-foreground">
                Practice quizzes generated from your content to test understanding
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Slides</h3>
              <p className="text-muted-foreground">
                Beautiful presentation decks created automatically from your materials
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl md:text-5xl font-bold tracking-tight">
            Ready to Transform Your Learning?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students and educators who are already using EduFlow to accelerate their learning.
          </p>
          <Link
            href="/api/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl hover:scale-105"
          >
            Start Free Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">EduFlow</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 EduFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
