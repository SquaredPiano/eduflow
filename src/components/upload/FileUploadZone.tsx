'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadDropzone } from '@/lib/uploadthing';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export function FileUploadZone({ projectId, onUploadComplete }: FileUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <div className="p-8">
        <UploadDropzone
          endpoint="learningMaterials"
          input={{ projectId }}
          onClientUploadComplete={(res) => {
            if (res) {
              toast.success(`${res.length} file(s) uploaded successfully!`);
              queryClient.invalidateQueries({ queryKey: ['project', projectId] });
              onUploadComplete?.();
            }
          }}
          onUploadError={(error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
          onUploadProgress={(progress) => {
            setUploadProgress(progress);
          }}
          className="ut-label:text-lg ut-allowed-content:ut-uploading:text-primary/50"
        />
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
