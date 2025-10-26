"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploadDropzone } from "@/components/upload/FileUploadDropzone"
import { FileText, Zap, BookOpen, FlipVertical, Upload, Download, Sparkles } from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  id: string
  name: string
  type: string
  url: string
  size: number
  createdAt: string
  hasTranscript?: boolean
}

export default function EnhancedDashboardPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = async (uploadedFiles: Array<{ url: string; key: string; name: string }>) => {
    console.log('Upload complete:', uploadedFiles)
    await fetchFiles()
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">EduFlow AI</span>
          </Link>
          <nav className="ml-auto flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/api/auth/logout">
              <Button variant="outline">Logout</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Welcome to EduFlow AI</h1>
            <p className="text-muted-foreground mt-2">
              Upload your learning materials and transform them with AI
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.length}</div>
                <p className="text-xs text-muted-foreground">Uploaded documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Ready</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.filter(f => f.hasTranscript).length}</div>
                <p className="text-xs text-muted-foreground">Text extracted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notes Generated</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Study notes created</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
                <FlipVertical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Study sets created</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="files">My Files ({files.length})</TabsTrigger>
              <TabsTrigger value="generate">Generate Content</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>
                    Create and manage your learning projects with AI-powered canvas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/project/demo">
                      <Button className="w-full" size="lg">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Create New Project
                      </Button>
                    </Link>
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-4">Recent Projects</p>
                      <div className="space-y-2">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <Link href="/project/demo">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Demo Project</p>
                                  <p className="text-sm text-muted-foreground">Click to explore the canvas interface</p>
                                </div>
                                <Button variant="ghost" size="sm">Open</Button>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Learning Materials</CardTitle>
                  <CardDescription>
                    Upload PDFs, documents, presentations, videos, or audio files. Supported formats: PDF, DOCX, PPTX, MP4, MP3
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadDropzone
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Files</CardTitle>
                  <CardDescription>
                    Manage your uploaded files and view extraction status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading files...</p>
                  ) : files.length === 0 ? (
                    <p className="text-muted-foreground">No files uploaded yet. Upload your first file to get started!</p>
                  ) : (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type} · {file.hasTranscript ? '✓ Text extracted' : '⏳ Processing...'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(file.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <BookOpen className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Generate Notes</CardTitle>
                    <CardDescription>
                      Create comprehensive study notes from your uploaded content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled={files.length === 0}>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Notes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <FlipVertical className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Create Flashcards</CardTitle>
                    <CardDescription>
                      Generate flashcards to help you memorize key concepts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled={files.length === 0}>
                      <Zap className="h-4 w-4 mr-2" />
                      Create Flashcards
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <BookOpen className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Generate Quiz</CardTitle>
                    <CardDescription>
                      Create multiple-choice quizzes to test your knowledge
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled={files.length === 0}>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <FileText className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Create Slides</CardTitle>
                    <CardDescription>
                      Transform your content into presentation slides
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled={files.length === 0}>
                      <Zap className="h-4 w-4 mr-2" />
                      Create Slides
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
