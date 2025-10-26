'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Loader2, Trash2, FolderOpen, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  _count?: {
    files: number;
    outputs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFileSelectionOpen, setIsFileSelectionOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [canvasUrl, setCanvasUrl] = useState('');
  const [canvasApiKey, setCanvasApiKey] = useState('');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [availableFiles, setAvailableFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateOpen(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully!');
      router.push(`/dashboard/project/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    createMutation.mutate(newProject);
  };

  const handleImportFromCanvas = async () => {
    if (!canvasUrl || !canvasApiKey) {
      toast.error('Please enter both Canvas URL and API key');
      return;
    }

    try {
      toast.loading('Fetching courses from Canvas...');
      
      // Fetch courses from Canvas
      const response = await fetch('/api/canvas/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl, apiKey: canvasApiKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Canvas courses');
      }

      const { courses } = await response.json();
      setAvailableCourses(courses);
      toast.success(`Found ${courses.length} courses!`);
      setIsImportOpen(false);
      setIsFileSelectionOpen(true);
    } catch (error) {
      console.error('Canvas import error:', error);
      toast.error('Failed to connect to Canvas. Check your URL and API key.');
    }
  };

  const handleSelectCourse = async (course: any) => {
    setSelectedCourse(course);
    
    try {
      toast.loading('Fetching course files...');
      
      // Fetch files from the selected course
      const response = await fetch('/api/canvas/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasUrl,
          apiKey: canvasApiKey,
          courseId: course.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course files');
      }

      const { files } = await response.json();
      setAvailableFiles(files);
      toast.success(`Found ${files.length} files in ${course.name}!`);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch course files');
    }
  };

  const handleImportFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to import');
      return;
    }

    if (!selectedCourse) {
      toast.error('No course selected');
      return;
    }

    try {
      toast.loading('Creating project and importing files...');
      
      // Create a new project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedCourse.name,
          description: `Imported from Canvas: ${selectedCourse.course_code || selectedCourse.name}`,
        }),
      });

      if (!projectResponse.ok) {
        throw new Error('Failed to create project');
      }

      const project = await projectResponse.json();

      // Import selected files
      const importResponse = await fetch('/api/canvas/import-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          canvasUrl,
          apiKey: canvasApiKey,
          fileIds: selectedFiles,
        }),
      });

      if (!importResponse.ok) {
        throw new Error('Failed to import files');
      }

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsFileSelectionOpen(false);
      setSelectedFiles([]);
      setSelectedCourse(null);
      setAvailableFiles([]);
      setAvailableCourses([]);
      toast.success(`Project "${project.name}" created with ${selectedFiles.length} files!`);
      router.push(`/dashboard/project/${project.id}`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import files');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header - Clean and spacious */}
        <div className="mb-12 flex flex-col gap-6">
          <div className="space-y-1 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Projects</h1>
            <p className="text-base text-gray-600">
              Organize your coursework and learning materials
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="border-gray-300">
                  <Download className="mr-2 h-4 w-4" />
                  Import from Canvas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import from Canvas/Quercus</DialogTitle>
                  <DialogDescription>
                    Import your courses and materials from Canvas LMS.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="canvas-url">Canvas URL</Label>
                    <Input
                      id="canvas-url"
                      placeholder="e.g., https://q.utoronto.ca"
                      value={canvasUrl}
                      onChange={(e) => setCanvasUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Your Canvas API key"
                      value={canvasApiKey}
                      onChange={(e) => setCanvasApiKey(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Get your API key from: Account → Settings → New Access Token
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImportFromCanvas}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Fetch Courses
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Give your project a name and description to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., CS50 - Introduction to Computer Science"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What's this project about?"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    disabled={createMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* File Selection Modal */}
        <Dialog open={isFileSelectionOpen} onOpenChange={setIsFileSelectionOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Files to Import</DialogTitle>
              <DialogDescription>
                {selectedCourse ? `Choose files from ${selectedCourse.name}` : 'Select a course first'}
              </DialogDescription>
            </DialogHeader>
            
            {/* Course Selection */}
            {!selectedCourse && availableCourses.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto py-4">
                <h3 className="font-medium text-sm text-gray-700">Available Courses:</h3>
                {availableCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    <h4 className="font-semibold text-gray-900">{course.name}</h4>
                    {course.course_code && (
                      <p className="text-sm text-gray-600 mt-1">{course.course_code}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* File Selection */}
            {selectedCourse && (
              <div className="flex-1 overflow-y-auto py-4">
                {availableFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading files...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm text-gray-700">
                        {availableFiles.length} files available
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFiles(availableFiles.map(f => f.id))}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFiles([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    {availableFiles.map((file) => (
                      <label
                        key={file.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file.id]);
                            } else {
                              setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                            }
                          }}
                          className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.display_name || file.filename}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB · {file.content_type || 'Unknown type'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsFileSelectionOpen(false);
                  setSelectedCourse(null);
                  setAvailableFiles([]);
                  setSelectedFiles([]);
                }}
              >
                Cancel
              </Button>
              {selectedCourse && (
                <Button
                  onClick={handleImportFiles}
                  disabled={selectedFiles.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Import {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards - Minimal and clean */}
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">
              Projects
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '—' : projects.length}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">
              Files
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '—' : projects.reduce((acc, p) => acc + (p._count?.files || 0), 0)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">
              AI Outputs
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '—' : projects.reduce((acc, p) => acc + (p._count?.outputs || 0), 0)}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No projects yet</h3>
              <p className="mb-6 max-w-sm text-sm text-gray-600">
                Create your first project or import courses from Canvas to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link 
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                className="group block"
              >
                <div className="relative h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300">
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Are you sure you want to delete this project?')) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </Button>

                  {/* Project content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-8 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{project._count?.files || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <span>{project._count?.outputs || 0} outputs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
