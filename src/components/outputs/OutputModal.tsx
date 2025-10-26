'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NotesView } from './NotesView';
import { FlashcardsView } from './FlashcardsView';
import { QuizView } from './QuizView';
import { SlidesView } from './SlidesView';

interface OutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  outputType: 'notes' | 'flashcards' | 'quiz' | 'slides' | null;
  outputId: string | null;
  onDownload?: () => void;
}

export function OutputModal({ isOpen, onClose, outputType, outputId, onDownload }: OutputModalProps) {
  if (!outputType || !outputId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {outputType === 'notes' && 'Study Notes'}
            {outputType === 'flashcards' && 'Flashcards'}
            {outputType === 'quiz' && 'Quiz'}
            {outputType === 'slides' && 'Slides'}
          </DialogTitle>
        </DialogHeader>
        
        {outputType === 'notes' && <NotesView outputId={outputId} onDownload={onDownload} />}
        {outputType === 'flashcards' && <FlashcardsView outputId={outputId} onDownload={onDownload} />}
        {outputType === 'quiz' && <QuizView outputId={outputId} onDownload={onDownload} />}
        {outputType === 'slides' && <SlidesView outputId={outputId} onDownload={onDownload} />}
      </DialogContent>
    </Dialog>
  );
}
