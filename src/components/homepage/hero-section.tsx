"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VideoPlayer from '../VideoPlayer';
import { Navbar } from './navbar';

interface LoaderData {
  isSignedIn: boolean;
}

export default function HeroSection({ loaderData }: { loaderData?: LoaderData }) {
  // Static stats for now - can be fetched from API later
  const stats = {
    filesProcessed: 2500,
    aiOutputsGenerated: 8400,
    projectsCreated: 620,
  };

  return (
    <section>
      <Navbar loaderData={loaderData} />
      <div className="pt-16 px-8">
        <div className="text-center">
          <h1 className="mx-auto mt-16 max-w-3xl text-5xl text-balance font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Transform Your Learning with AI
          </h1>
          <p className="text-muted-foreground mx-auto mb-6 mt-4 text-balance text-xl max-w-2xl">
            Generate comprehensive notes, flashcards, quizzes, and presentations from your lectures. 
            Import from Canvas LMS and visualize your learning journey.
          </p>
          <div className="flex flex-col items-center gap-2 *:w-full sm:flex-row sm:justify-center sm:*:w-auto">
            <Button asChild size="lg" variant="default" className="bg-primary hover:bg-primary/90">
              <Link href={loaderData?.isSignedIn ? '/dashboard' : '/api/auth/login'}>
                <span className="text-nowrap">Get Started Free</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">
                <span className="text-nowrap">Learn More</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-12 max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:border-primary/40">
            <div className="text-4xl font-bold text-primary">
              {stats.filesProcessed.toLocaleString()}+
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">Files Processed</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border-2 border-secondary/20 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:border-secondary/40">
            <div className="text-4xl font-bold text-secondary">
              {stats.aiOutputsGenerated.toLocaleString()}+
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">AI Outputs Generated</div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border-2 border-purple-500/20 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:border-purple-500/40">
            <div className="text-4xl font-bold text-purple-600">
              {stats.projectsCreated.toLocaleString()}+
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium">Projects Created</div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-6xl mx-auto mt-20 mb-12">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features for Modern Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Smart Notes</h3>
              <p className="text-sm text-muted-foreground">AI-powered note generation from your lectures and materials</p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Flashcards</h3>
              <p className="text-sm text-muted-foreground">Automatic flashcard creation for effective memorization</p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Practice Quizzes</h3>
              <p className="text-sm text-muted-foreground">Generate quizzes to test your understanding</p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Slide Decks</h3>
              <p className="text-sm text-muted-foreground">Beautiful presentation slides from your content</p>
            </div>
          </div>
        </div>

        {/* Demo Video */}
        <div className="flex justify-center mt-16">
          <VideoPlayer src="https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8Gu3B3mczu7JPAkBlwgiWGr6XbOSue4ZFzhR9QK" />
        </div>
      </div>
    </section>
  );
}
