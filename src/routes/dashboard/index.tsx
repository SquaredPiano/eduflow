'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Loader2, Trash2, Upload, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    files: number;
  };
}

export default function DashboardIndex() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Fetch projects with React Query
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects'),
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully! 🎉');
    },
    onError: () => {
      toast.error('Failed to create project. Please try again.');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleCreate = () => {
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    createMutation.mutate(newProject);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center max-w-md">
          <div className="text-destructive mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <h3 className="font-semibold">Failed to load projects</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your connection and try again
            </p>
          </div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-primary" />
            My Learning Projects
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Organize your educational content and generate AI-powered study materials
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-white">
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Project</DialogTitle>
              <DialogDescription>
                Give your project a name and description to organize your learning materials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., CS50 Computer Science, Biology 101"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="What topics or courses does this project cover?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={4}
                  className="text-base resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {projects && projects.length === 0 ? (
        <Card className="p-16 text-center border-2 border-dashed border-border bg-muted/30">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-base">
                Create your first project to start organizing your learning materials and generating AI study tools
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button 
                onClick={() => setIsCreateOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary-hover text-white"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Project
              </Button>
              <Button 
                variant="outline" 
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Import from Canvas
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Card 
              key={project.id} 
              className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 bg-card"
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <Link 
                    to={`/dashboard/project/${project.id}`} 
                    className="hover:text-primary transition-colors flex-1 line-clamp-2"
                  >
                    {project.name}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2 text-base">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{project._count.files} files</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(project.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <Link to={`/dashboard/project/${project.id}`}>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    Open Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats (Optional) */}
      {projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {projects.reduce((sum, p) => sum + p._count.files, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-accent border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {projects.reduce((sum, p) => sum + p._count.files, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
