'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Flashcard {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface FlashcardsViewerProps {
  flashcards: Flashcard[];
  title?: string;
  outputId?: string; // Optional: for server-side downloads
}

export function FlashcardsViewer({ flashcards, title = 'Flashcards', outputId }: FlashcardsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learned, setLearned] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    // Just cycle through randomly for now
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setCurrentIndex(randomIndex);
    setIsFlipped(false);
  };

  const handleMarkLearned = () => {
    const newLearned = new Set(learned);
    if (learned.has(currentIndex)) {
      newLearned.delete(currentIndex);
      toast.success('Unmarked as learned');
    } else {
      newLearned.add(currentIndex);
      toast.success('Marked as learned');
    }
    setLearned(newLearned);
  };

  const handleExportAnki = () => {
    const ankiFormat = flashcards
      .map((card) => `${card.front}\t${card.back}`)
      .join('\n');
    const blob = new Blob([ankiFormat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-anki-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to Anki format');
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
        : `flashcards-${format}-${Date.now()}`;

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

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No flashcards available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length} • {learned.size} learned
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportAnki}>
                Anki Text (.txt)
              </DropdownMenuItem>
              {outputId && (
                <>
                  <DropdownMenuItem onClick={() => handleServerDownload('csv')}>
                    CSV Spreadsheet (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleServerDownload('anki-enhanced')}>
                    Enhanced Anki (.txt)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative h-[400px] perspective-1000">
        <Card
          className={`absolute inset-0 cursor-pointer transition-all duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex items-center justify-center h-full p-8">
            <div className={`text-center ${isFlipped ? 'rotate-y-180' : ''}`}>
              <p className="text-2xl font-medium mb-4">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-sm text-muted-foreground">
                {isFlipped ? 'Click to see front' : 'Click to reveal answer'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant={learned.has(currentIndex) ? 'default' : 'outline'}
          onClick={handleMarkLearned}
        >
          {learned.has(currentIndex) ? '✓ Learned' : 'Mark as Learned'}
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={flashcards.length <= 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
