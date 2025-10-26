'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Edit, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotesViewerProps {
  content: string;
  title?: string;
  outputId?: string; // Optional: for server-side downloads
  onEdit?: () => void;
  onExport?: () => void;
}

export function NotesViewer({ content, title = 'AI-Generated Notes', outputId, onEdit, onExport }: NotesViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Notes copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Notes downloaded');
  };

  const handleServerDownload = async (format: string) => {
    if (!outputId) {
      toast.error('Cannot download: Output ID not available');
      return;
    }

    try {
      toast.loading('Generating download...');
      
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outputId,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `notes-${format}-${Date.now()}`;

      // Create blob and download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`Downloaded ${format.toUpperCase()} file`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  Markdown (.md)
                </DropdownMenuItem>
                {outputId && (
                  <>
                    <DropdownMenuItem onClick={() => handleServerDownload('docx')}>
                      Word Document (.docx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleServerDownload('pdf')}>
                      PDF Document (.pdf)
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Refine
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
