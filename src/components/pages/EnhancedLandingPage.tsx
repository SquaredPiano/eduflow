"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Zap, BookOpen, FlipVertical, Download, Users, Brain, Upload } from "lucide-react"

export default function EnhancedLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">EduFlow AI</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
              How It Works
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Transform Your Learning Materials
                <span className="text-primary block">with AI-Powered Tools</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Upload your PDFs, documents, and presentations. Generate notes, flashcards, quizzes, and slides instantly with advanced AI.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Powerful Features for Modern Learning
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to create comprehensive study materials from your content
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Upload className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart File Upload</CardTitle>
                <CardDescription>
                  Upload PDFs, DOCX, PPTX, videos, and audio files. Automatic text extraction and transcription.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI-Generated Notes</CardTitle>
                <CardDescription>
                  Create comprehensive study notes from your materials using advanced AI models.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FlipVertical className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Interactive Flashcards</CardTitle>
                <CardDescription>
                  Generate flashcards automatically to help you memorize key concepts effectively.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Quiz Generation</CardTitle>
                <CardDescription>
                  Create multiple-choice quizzes to test your knowledge and track progress.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Presentation Slides</CardTitle>
                <CardDescription>
                  Transform your content into polished presentation slides ready to present.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Download className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Export Anywhere</CardTitle>
                <CardDescription>
                  Export to PDF, Anki, CSV, and PowerPoint. Take your materials wherever you study.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Simple 3-Step Process
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                From upload to study materials in minutes
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Upload Your Files</h3>
              <p className="text-muted-foreground">
                Drag and drop your PDFs, documents, presentations, or videos. We support all major formats.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">AI Processes Content</h3>
              <p className="text-muted-foreground">
                Our AI extracts text, analyzes content, and prepares it for transformation into study materials.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Generate & Export</h3>
              <p className="text-muted-foreground">
                Create notes, flashcards, quizzes, and slides. Export to your preferred format and start learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Transform Your Learning?
              </h2>
              <p className="max-w-[600px] text-primary-foreground/90 md:text-xl">
                Join students and educators using EduFlow AI to create better study materials faster.
              </p>
            </div>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                <Zap className="h-4 w-4" />
                Start Creating Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold">EduFlow AI</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Auth0, Prisma, and Google Gemini. © 2025 EduFlow AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
