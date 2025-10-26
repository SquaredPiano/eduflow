"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Settings, Layers } from "lucide-react";
import Link from "next/link";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch project details from Supabase
    // For now, just set loading to false
    setIsLoading(false);
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Project Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{projectName}</h1>
            <p className="text-sm text-muted-foreground">
              Project ID: {projectId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* TODO: Integrate Canvas component once Convex -> Supabase migration is complete */}
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Canvas Coming Soon
              </h2>
              <p className="text-muted-foreground mb-6">
                The draggable agents canvas is being integrated. You'll be able to:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Drag and drop AI agents onto the canvas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Connect agents to create workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Upload and transcribe educational content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span>Generate study materials automatically</span>
                </li>
              </ul>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
