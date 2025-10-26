'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface ImportCanvasWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

interface Course {
  id: string;
  name: string;
  course_code: string;
}

interface CanvasFile {
  id: string;
  display_name: string;
  size: number;
  'content-type': string;
}

export function ImportCanvasWizard({ open, onOpenChange, projectId }: ImportCanvasWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [canvasUrl, setCanvasUrl] = useState('https://q.utoronto.ca');
  const [accessToken, setAccessToken] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [files, setFiles] = useState<CanvasFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Step 1: Verify token and fetch courses
  const fetchCoursesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${canvasUrl}/api/v1/courses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    onSuccess: (data) => {
      setCourses(data.filter((course: any) => course.name));
      setStep(2);
      toast.success('Connected to Canvas successfully');
    },
    onError: () => {
      toast.error('Failed to connect to Canvas. Check your URL and token.');
    },
  });

  // Step 2: Fetch files from selected courses
  const fetchFilesMutation = useMutation({
    mutationFn: async () => {
      const allFiles: CanvasFile[] = [];
      
      for (const courseId of selectedCourses) {
        const response = await fetch(
          `${canvasUrl}/api/v1/courses/${courseId}/files`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          const courseFiles = await response.json();
          allFiles.push(...courseFiles);
        }
      }
      
      return allFiles;
    },
    onSuccess: (data) => {
      setFiles(data);
      setStep(3);
      toast.success(`Found ${data.length} files`);
    },
    onError: () => {
      toast.error('Failed to fetch files from courses');
    },
  });

  // Step 3: Import selected files
  const importFilesMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/canvas-sync', {
        projectId,
        canvasUrl,
        accessToken,
        fileIds: selectedFiles,
      });
    },
    onSuccess: () => {
      toast.success(`Successfully imported ${selectedFiles.length} files!`);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      onOpenChange(false);
      resetWizard();
    },
    onError: () => {
      toast.error('Failed to import files');
    },
  });

  const resetWizard = () => {
    setStep(1);
    setAccessToken('');
    setCourses([]);
    setSelectedCourses([]);
    setFiles([]);
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import from Canvas LMS (Quercus)</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {
              step === 1 ? 'Connect to Canvas' :
              step === 2 ? 'Select Courses' :
              'Select Files to Import'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="canvasUrl">Canvas URL</Label>
              <Input
                id="canvasUrl"
                placeholder="https://q.utoronto.ca"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your institution's Canvas URL (default: UofT Quercus)
              </p>
            </div>
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Paste your Canvas API token here"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your token from: Account → Settings → New Access Token
              </p>
            </div>
            <Button
              onClick={() => fetchCoursesMutation.mutate()}
              disabled={!canvasUrl || !accessToken || fetchCoursesMutation.isPending}
              className="w-full"
            >
              {fetchCoursesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Connect & Fetch Courses
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the courses you want to import files from ({courses.length} courses found)
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
              {courses.map((course) => (
                <Card key={course.id} className="p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={course.id}
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCourses([...selectedCourses, course.id]);
                        } else {
                          setSelectedCourses(selectedCourses.filter((id) => id !== course.id));
                        }
                      }}
                    />
                    <Label htmlFor={course.id} className="cursor-pointer flex-1">
                      <div className="font-medium">{course.name}</div>
                      {course.course_code && (
                        <div className="text-xs text-muted-foreground">{course.course_code}</div>
                      )}
                    </Label>
                  </div>
                </Card>
              ))}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => fetchFilesMutation.mutate()}
                disabled={selectedCourses.length === 0 || fetchFilesMutation.isPending}
              >
                {fetchFilesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Fetch Files from {selectedCourses.length} Course{selectedCourses.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the files you want to import ({selectedFiles.length} of {files.length} selected)
            </p>
            <div className="flex gap-2 mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFiles(files.map((f) => f.id))}
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFiles([])}
              >
                Deselect All
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
              {files.map((file) => (
                <Card key={file.id} className="p-3 hover:bg-accent transition-colors">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={file.id}
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter((id) => id !== file.id));
                        }
                      }}
                    />
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <Label htmlFor={file.id} className="cursor-pointer flex-1">
                      <div className="font-medium text-sm">{file.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file['content-type']}
                      </div>
                    </Label>
                  </div>
                </Card>
              ))}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={() => importFilesMutation.mutate()}
                disabled={selectedFiles.length === 0 || importFilesMutation.isPending}
              >
                {importFilesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
