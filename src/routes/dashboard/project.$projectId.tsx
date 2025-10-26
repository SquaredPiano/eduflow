'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import { useState } from 'react';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Video, 
  FileImage, 
  File as FileIcon,
  Loader2, 
  Trash2, 
  Download,
  Brain,
  Sparkles,
  MessageSquare,
  BookOpen,
  CreditCard as FlashcardIcon,
  ClipboardList,
  Presentation,
  Eye,
  Settings,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  files: FileData[];
  outputs: OutputData[];
  createdAt: string;
  updatedAt: string;
}

interface FileData {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  mimeType?: string;
  status: string;
  createdAt: string;
}

interface OutputData {
  id: string;
  type: string;
  content: any;
  createdAt: string;
  fileId?: string;
}

export default function ProjectView() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('files');

  // Fetch project data
  const { data: project, isLoading, error } = useQuery<ProjectData>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => api.delete(`/api/files/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('File deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete file');
    },
  });

  // Generate AI content mutation
  const generateMutation = useMutation({
    mutationFn: ({ fileId, type }: { fileId: string; type: string }) =>
      api.post('/api/generate', { fileId, type, projectId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      const typeLabel = variables.type.charAt(0).toUpperCase() + variables.type.slice(1);
      toast.success(`${typeLabel} generation started! 🎉`);
    },
    onError: () => {
      toast.error('Failed to start generation');
    },
  });

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileIcon className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-secondary" />;
    if (mimeType.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-destructive" />;
    return <FileIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case 'notes': return <BookOpen className="h-5 w-5 text-primary" />;
      case 'flashcards': return <FlashcardIcon className="h-5 w-5 text-secondary" />;
      case 'quiz': return <ClipboardList className="h-5 w-5 text-warning" />;
      case 'slides': return <Presentation className="h-5 w-5 text-purple-500" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center max-w-md">
          <div className="text-destructive mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <h3 className="font-semibold">Failed to load project</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The project may not exist or you don't have access
            </p>
          </div>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center max-w-md">
          <h3 className="font-semibold mb-2">Project not found</h3>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Last updated {new Date(project.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{project.files.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-secondary" />
              AI Outputs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{project.outputs.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-warning" />
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {project.files.filter(f => f.status === 'processing').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {project.files.filter(f => f.status === 'ready').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="outputs" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Outputs
          </TabsTrigger>
          <TabsTrigger value="canvas" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Canvas
          </TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6 mt-6">
          {/* Upload Section */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Upload Files</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, PPTX, MP4, and more
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary-hover text-white">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Generation Panel */}
          {project.files.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Generate AI Content
                </CardTitle>
                <CardDescription>
                  Select a file and choose what you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start p-4 hover:border-primary hover:bg-primary/5"
                    onClick={() => {
                      if (project.files.length > 0) {
                        generateMutation.mutate({ fileId: project.files[0].id, type: 'notes' });
                      }
                    }}
                    disabled={generateMutation.isPending}
                  >
                    <BookOpen className="h-6 w-6 text-primary mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Notes</div>
                      <div className="text-xs text-muted-foreground">Comprehensive summary</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start p-4 hover:border-secondary hover:bg-secondary/5"
                    onClick={() => {
                      if (project.files.length > 0) {
                        generateMutation.mutate({ fileId: project.files[0].id, type: 'flashcards' });
                      }
                    }}
                    disabled={generateMutation.isPending}
                  >
                    <FlashcardIcon className="h-6 w-6 text-secondary mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Flashcards</div>
                      <div className="text-xs text-muted-foreground">Quick study cards</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start p-4 hover:border-warning hover:bg-warning/5"
                    onClick={() => {
                      if (project.files.length > 0) {
                        generateMutation.mutate({ fileId: project.files[0].id, type: 'quiz' });
                      }
                    }}
                    disabled={generateMutation.isPending}
                  >
                    <ClipboardList className="h-6 w-6 text-warning mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Quiz</div>
                      <div className="text-xs text-muted-foreground">Test your knowledge</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start p-4 hover:border-purple-500 hover:bg-purple-50"
                    onClick={() => {
                      if (project.files.length > 0) {
                        generateMutation.mutate({ fileId: project.files[0].id, type: 'slides' });
                      }
                    }}
                    disabled={generateMutation.isPending}
                  >
                    <Presentation className="h-6 w-6 text-purple-500 mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Slides</div>
                      <div className="text-xs text-muted-foreground">Presentation ready</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Files List */}
          {project.files.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No files yet</h3>
              <p className="text-muted-foreground">
                Upload your first file to get started
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.files.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{file.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="capitalize">{file.status}</span>
                            <span>•</span>
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          {deleteFileMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Outputs Tab */}
        <TabsContent value="outputs" className="space-y-4 mt-6">
          {project.outputs.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No AI outputs yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate notes, flashcards, or quizzes from your files
              </p>
              <Button onClick={() => setActiveTab('files')} className="bg-primary hover:bg-primary-hover text-white">
                Go to Files
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.outputs.map((output) => (
                <Card key={output.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getOutputIcon(output.type)}
                      <span className="capitalize">{output.type}</span>
                    </CardTitle>
                    <CardDescription>
                      Generated {new Date(output.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {JSON.stringify(output.content).substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Canvas Tab */}
        <TabsContent value="canvas" className="mt-6">
          <Card className="p-12 text-center border-2 border-dashed">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Visual Flow Canvas</h3>
            <p className="text-muted-foreground mb-4">
              Coming soon: Visualize your learning workflow with an interactive canvas
            </p>
            <Button variant="outline" disabled>
              Open Canvas
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
