"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Zap, BookOpen, Brain, Upload, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { useFadeInScroll, useSlideInLeft, useSlideInRight, useStaggerChildren } from "@/hooks/useScrollAnimation"
import { ThreeBackground } from "@/components/three/ThreeBackground"

export default function KhanInspiredLandingPage() {
  // Animation refs
  const heroTitleRef = useFadeInScroll(1.2);
  const heroDescRef = useSlideInLeft(1);
  const heroImageRef = useSlideInRight(1);
  const featuresRef = useStaggerChildren(0.6, 0.15);
  const stepsRef = useStaggerChildren(0.8, 0.2);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Clean Navigation */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">EduFlow</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-accent hover:bg-accent/90">
                  Get started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Khan Academy inspired with Three.js */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <ThreeBackground />
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 ref={heroTitleRef} className="text-5xl md:text-6xl font-bold leading-tight text-foreground">
                Learn anything with AI-powered study tools
              </h1>
              <p ref={heroDescRef} className="text-xl text-muted-foreground leading-relaxed">
                Transform your lectures, documents, and videos into comprehensive study materials. Generate notes, flashcards, and quizzes instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-lg px-8 py-6">
                    Start learning for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                  Watch demo
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">AI-powered</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-muted rounded-2xl border-2 border-border shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Brain className="h-24 w-24 text-accent mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive Canvas Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean cards */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to study smarter
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed to help you learn more effectively
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-lg transition-shadow border-2">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Upload className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Upload</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload PDFs, documents, videos, or audio. Automatic transcription and text extraction powered by AI.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow border-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Notes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate comprehensive study notes from any content. Structured, clear, and ready to review.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow border-2">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Flashcards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create interactive flashcards automatically. Export to Anki or study directly in the app.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow border-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Quick Quizzes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Test your knowledge with AI-generated quizzes. Multiple choice questions that adapt to your content.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow border-2">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Draggable Canvas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize your AI agents visually. Connect, arrange, and manage your learning workflow.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-lg transition-shadow border-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Export Anywhere</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download as PDF, export to Anki, or create PowerPoint presentations from your materials.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Start learning in 3 simple steps
            </h2>
            <p className="text-xl text-muted-foreground">
              From content to study materials in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload</h3>
              <p className="text-muted-foreground leading-relaxed">
                Drag and drop your files or paste a link. We support PDFs, videos, audio, and more.
              </p>
            </div>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Generate</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI processes your content and generates notes, flashcards, and quizzes instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Study</h3>
              <p className="text-muted-foreground leading-relaxed">
                Review your materials, take quizzes, and export to your favorite study tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students using EduFlow to study smarter, not harder.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get started for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">EduFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered study tools for modern learners
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 EduFlow. Built with ❤️ for learners everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
