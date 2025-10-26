'use client';"use client"



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';import { Plus, FileText, Calendar, MoreVertical } from "lucide-react";

import { useState } from 'react';import Link from "next/link";

import Link from 'next/link';import { Button } from "@/components/ui/button";

import { api } from '@/lib/apiClient';import {

import { Button } from '@/components/ui/button';  Card,

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';  CardContent,

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';  CardDescription,

import { Input } from '@/components/ui/input';  CardFooter,

import { Label } from '@/components/ui/label';  CardHeader,

import { Textarea } from '@/components/ui/textarea';  CardTitle,

import { Plus, FileText, Loader2, Trash2, Upload, BookOpen, GraduationCap } from 'lucide-react';} from "@/components/ui/card";

import { toast } from 'sonner';import {

  Dialog,

interface Project {  DialogContent,

  id: string;  DialogDescription,

  name: string;  DialogFooter,

  description?: string;  DialogHeader,

  createdAt: string;  DialogTitle,

  updatedAt: string;  DialogTrigger,

  _count: {} from "@/components/ui/dialog";

    files: number;import {

  };  DropdownMenu,

}  DropdownMenuContent,

  DropdownMenuItem,

export default function DashboardPage() {  DropdownMenuTrigger,

  const queryClient = useQueryClient();} from "@/components/ui/dropdown-menu";

  const [isCreateOpen, setIsCreateOpen] = useState(false);import { Input } from "@/components/ui/input";

  const [newProject, setNewProject] = useState({ name: '', description: '' });import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

  // Fetch projects with React Queryimport { useState } from "react";

  const { data: projects, isLoading, error } = useQuery<Project[]>({

    queryKey: ['projects'],export default function DashboardPage() {

    queryFn: () => api.get('/api/projects'),  const [isCreateOpen, setIsCreateOpen] = useState(false);

  });  const [newProject, setNewProject] = useState({

    title: "",

  // Create project mutation    description: "",

  const createMutation = useMutation({  });

    mutationFn: (data: { name: string; description?: string }) =>

      api.post('/api/projects', data),  // TODO: Replace with actual Prisma queries

    onSuccess: () => {  const projects: any[] = [];

      queryClient.invalidateQueries({ queryKey: ['projects'] });  const isLoading = false;

      setIsCreateOpen(false);

      setNewProject({ name: '', description: '' });  const handleCreateProject = async () => {

      toast.success('Project created successfully! 🎉');    if (!newProject.title.trim()) {

    },      alert("Project title is required");

    onError: () => {      return;

      toast.error('Failed to create project. Please try again.');    }

    },

  });    try {

      // TODO: Create project via API

  // Delete project mutation      console.log("Creating project:", newProject);

  const deleteMutation = useMutation({      setIsCreateOpen(false);

    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),      setNewProject({ title: "", description: "" });

    onSuccess: () => {    } catch (error) {

      queryClient.invalidateQueries({ queryKey: ['projects'] });      console.error("Failed to create project:", error);

      toast.success('Project deleted successfully');    }

    },  };

    onError: () => {

      toast.error('Failed to delete project');  return (

    },    <div className="space-y-6 p-6">

  });      <div className="flex items-center justify-between">

        <div>

  const handleCreate = () => {          <h1 className="text-3xl font-bold">Learning Projects</h1>

    if (!newProject.name.trim()) {          <p className="text-muted-foreground">

      toast.error('Project name is required');            Organize your study materials and transform them with AI-powered tools

      return;          </p>

    }        </div>

    createMutation.mutate(newProject);        

  };        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>

          <DialogTrigger asChild>

  if (error) {            <Button className="bg-green-600 hover:bg-green-700">

    return (              <Plus className="mr-2 h-4 w-4" />

      <div className="flex items-center justify-center min-h-screen">              New Project

        <Card className="p-6 text-center max-w-md">            </Button>

          <div className="text-destructive mb-4">          </DialogTrigger>

            <FileText className="h-12 w-12 mx-auto mb-2" />          <DialogContent>

            <h3 className="font-semibold">Failed to load projects</h3>            <DialogHeader>

            <p className="text-sm text-muted-foreground mt-2">              <DialogTitle>Create New Learning Project</DialogTitle>

              Please check your connection and try again              <DialogDescription>

            </p>                Organize materials for a course, topic, or learning goal

          </div>              </DialogDescription>

          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}>            </DialogHeader>

            Retry            <div className="grid gap-4 py-4">

          </Button>              <div className="grid gap-2">

        </Card>                <Label htmlFor="title">Project Title</Label>

      </div>                <Input

    );                  id="title"

  }                  placeholder="e.g., Introduction to Machine Learning"

                  value={newProject.title}

  if (isLoading) {                  onChange={(e) =>

    return (                    setNewProject({ ...newProject, title: e.target.value })

      <div className="flex items-center justify-center min-h-screen bg-background">                  }

        <div className="text-center">                />

          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />              </div>

          <p className="text-muted-foreground">Loading your projects...</p>              <div className="grid gap-2">

        </div>                <Label htmlFor="description">Description (optional)</Label>

      </div>                <Textarea

    );                  id="description"

  }                  placeholder="What will you learn in this project?"

                  value={newProject.description}

  return (                  onChange={(e) =>

    <div className="container mx-auto p-6 space-y-8">                    setNewProject({ ...newProject, description: e.target.value })

      {/* Header Section */}                  }

      <div className="flex items-center justify-between">                />

        <div>              </div>

          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">            </div>

            <GraduationCap className="h-10 w-10 text-primary" />            <DialogFooter>

            My Learning Projects              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>

          </h1>                Cancel

          <p className="text-muted-foreground mt-2 text-lg">              </Button>

            Organize your educational content and generate AI-powered study materials              <Button onClick={handleCreateProject} className="bg-green-600 hover:bg-green-700">

          </p>                Create Project

        </div>              </Button>

            </DialogFooter>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>          </DialogContent>

          <DialogTrigger asChild>        </Dialog>

            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">      </div>

              <Plus className="mr-2 h-5 w-5" />

              New Project      {isLoading ? (

            </Button>        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          </DialogTrigger>          {[1, 2, 3].map((i) => (

          <DialogContent className="sm:max-w-[500px]">            <Card key={i} className="animate-pulse">

            <DialogHeader>              <CardHeader className="space-y-2">

              <DialogTitle className="text-2xl">Create New Project</DialogTitle>                <div className="h-4 w-3/4 bg-muted rounded" />

              <DialogDescription>                <div className="h-3 w-1/2 bg-muted rounded" />

                Give your project a name and description to organize your learning materials              </CardHeader>

              </DialogDescription>              <CardContent>

            </DialogHeader>                <div className="h-32 bg-muted rounded" />

            <div className="space-y-4 py-4">              </CardContent>

              <div className="space-y-2">            </Card>

                <Label htmlFor="name" className="text-base font-semibold">          ))}

                  Project Name *        </div>

                </Label>      ) : projects.length === 0 ? (

                <Input        <Card className="border-dashed">

                  id="name"          <CardContent className="flex flex-col items-center justify-center py-12">

                  placeholder="e.g., CS50 Computer Science, Biology 101"            <div className="p-3 rounded-full bg-green-50 mb-4">

                  value={newProject.name}              <FileText className="h-12 w-12 text-green-600" />

                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}            </div>

                  className="text-base"            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>

                />            <p className="text-muted-foreground text-center mb-4 max-w-sm">

              </div>              Create your first learning project to start uploading materials and generating study content

              <div className="space-y-2">            </p>

                <Label htmlFor="description" className="text-base font-semibold">            <Button onClick={() => setIsCreateOpen(true)} className="bg-green-600 hover:bg-green-700">

                  Description (Optional)              <Plus className="mr-2 h-4 w-4" />

                </Label>              Create First Project

                <Textarea            </Button>

                  id="description"          </CardContent>

                  placeholder="What topics or courses does this project cover?"        </Card>

                  value={newProject.description}      ) : (

                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  rows={4}          {projects.map((project) => (

                  className="text-base resize-none"            <Card key={project.id} className="group relative overflow-hidden hover:shadow-md transition-shadow">

                />              <Link href={`/dashboard/project/${project.id}`}>

              </div>                <CardHeader>

            </div>                  <div className="flex items-start justify-between">

            <DialogFooter>                    <div className="space-y-1">

              <Button                       <CardTitle className="line-clamp-1">

                variant="outline"                         {project.title}

                onClick={() => setIsCreateOpen(false)}                      </CardTitle>

                className="mr-2"                      <CardDescription className="line-clamp-2">

              >                        {project.description || "No description"}

                Cancel                      </CardDescription>

              </Button>                    </div>

              <Button                     <DropdownMenu>

                onClick={handleCreate}                       <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>

                disabled={createMutation.isPending}                        <Button

                className="bg-primary hover:bg-primary/90 text-white"                          variant="ghost"

              >                          size="icon"

                {createMutation.isPending && (                          className="opacity-0 group-hover:opacity-100 transition-opacity"

                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />                        >

                )}                          <MoreVertical className="h-4 w-4" />

                Create Project                        </Button>

              </Button>                      </DropdownMenuTrigger>

            </DialogFooter>                      <DropdownMenuContent align="end">

          </DialogContent>                        <DropdownMenuItem>

        </Dialog>                          Edit

      </div>                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-destructive">

      {/* Empty State */}                          Delete

      {projects && projects.length === 0 ? (                        </DropdownMenuItem>

        <Card className="p-16 text-center border-2 border-dashed border-border bg-muted/30">                      </DropdownMenuContent>

          <div className="max-w-md mx-auto space-y-4">                    </DropdownMenu>

            <div className="flex justify-center">                  </div>

              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">                </CardHeader>

                <BookOpen className="h-10 w-10 text-primary" />                <CardFooter>

              </div>                  <div className="flex items-center text-sm text-muted-foreground">

            </div>                    <Calendar className="mr-1 h-3 w-3" />

            <div>                    Updated recently

              <h3 className="text-2xl font-semibold mb-2">No projects yet</h3>                  </div>

              <p className="text-muted-foreground text-base">                </CardFooter>

                Create your first project to start organizing your learning materials and generating AI study tools              </Link>

              </p>            </Card>

            </div>          ))}

            <div className="flex gap-3 justify-center pt-4">        </div>

              <Button       )}

                onClick={() => setIsCreateOpen(true)}    </div>

                size="lg"  );

                className="bg-primary hover:bg-primary/90 text-white"}

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
                    href={`/dashboard/project/${project.id}`} 
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
                <Link href={`/dashboard/project/${project.id}`}>
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
