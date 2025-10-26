'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Video, 
  FileType, 
  Loader2, 
  Download,
  Trash2,
  Brain,
  BookText,
  GraduationCap,
  FileQuestion,
  Presentation
} from 'lucide-react';
import { toast } from 'sonner';

interface File {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType?: string;
  status: string;
  createdAt: string;
}

interface Output {
  id: string;
  type: string;
  content: any;
  createdAt: string;
  fileId?: string;
  file?: File;
}

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  files: File[];
  outputs: Output[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
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
    mutationFn: (data: { fileId: string; type: string }) => 
      api.post('/api/generate', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Generating ${variables.type}...`);
    },
    onError: () => {
      toast.error('Failed to start generation');
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileText className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.includes('pdf')) return <FileType className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case 'notes':
        return <BookText className="h-5 w-5" />;
      case 'flashcards':
        return <GraduationCap className="h-5 w-5" />;
      case 'quiz':
        return <FileQuestion className="h-5 w-5" />;
      case 'slides':
        return <Presentation className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

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

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center max-w-md">
          <div className="text-destructive mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <h3 className="font-semibold">Project not found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The project you're looking for doesn't exist
            </p>
          </div>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files">
            <FileText className="mr-2 h-4 w-4" />
            Files ({project.files.length})
          </TabsTrigger>
          <TabsTrigger value="outputs">
            <Brain className="mr-2 h-4 w-4" />
            AI Outputs ({project.outputs.length})
          </TabsTrigger>
          <TabsTrigger value="canvas">
            <GraduationCap className="mr-2 h-4 w-4" />
            Canvas View
          </TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* Upload Section */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upload Files</h3>
                  <p className="text-muted-foreground text-sm">
                    Drag and drop files here or click to browse
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Files List */}
          {project.files.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No files yet</h3>
              <p className="text-muted-foreground text-sm">
                Upload files to start generating AI study materials
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.files.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-primary">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} • {file.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* AI Generation Section */}
          {project.files.length > 0 && (
            <Card className="bg-linear-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Generate AI Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={() => generateMutation.mutate({ fileId: project.files[0].id, type: 'notes' })}
                    disabled={generateMutation.isPending}
                  >
                    <BookText className="h-6 w-6 text-primary" />
                    <span className="text-sm font-semibold">Notes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-secondary/30 hover:bg-secondary/10"
                    onClick={() => generateMutation.mutate({ fileId: project.files[0].id, type: 'flashcards' })}
                    disabled={generateMutation.isPending}
                  >
                    <GraduationCap className="h-6 w-6 text-secondary" />
                    <span className="text-sm font-semibold">Flashcards</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={() => generateMutation.mutate({ fileId: project.files[0].id, type: 'quiz' })}
                    disabled={generateMutation.isPending}
                  >
                    <FileQuestion className="h-6 w-6 text-primary" />
                    <span className="text-sm font-semibold">Quiz</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-secondary/30 hover:bg-secondary/10"
                    onClick={() => generateMutation.mutate({ fileId: project.files[0].id, type: 'slides' })}
                    disabled={generateMutation.isPending}
                  >
                    <Presentation className="h-6 w-6 text-secondary" />
                    <span className="text-sm font-semibold">Slides</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Outputs Tab */}
        <TabsContent value="outputs" className="space-y-4">
          {project.outputs.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No AI outputs yet</h3>
              <p className="text-muted-foreground text-sm">
                Generate AI content from your files to see outputs here
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.outputs.map((output) => (
                <Card key={output.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getOutputIcon(output.type)}
                      <span className="capitalize">{output.type}</span>
                      {output.file && (
                        <span className="text-sm text-muted-foreground font-normal">
                          from {output.file.name}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generated {new Date(output.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        Refine with AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Canvas View Tab */}
        <TabsContent value="canvas" className="space-y-4">
          <Card className="p-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Canvas View Coming Soon</h3>
            <p className="text-muted-foreground text-sm">
              Visualize your learning flow with an interactive canvas
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
