'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface NotesViewProps {
  outputId: string;
  onDownload?: () => void;
}

export function NotesView({ outputId, onDownload }: NotesViewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/generate?id=${outputId}`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        
        const data = await response.json();
        let noteContent = '';
        
        if (typeof data.output.content === 'string') {
          noteContent = data.output.content;
        } else if (data.output.content.content) {
          noteContent = data.output.content.content;
        } else {
          noteContent = JSON.stringify(data.output.content, null, 2);
        }
        
        setContent(noteContent);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [outputId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Notes copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Study Notes</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" onClick={onDownload} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Download MD
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <Card className="p-6 prose prose-emerald max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </Card>
      </div>
    </div>
  );
}
