'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsViewProps {
  outputId: string;
  onDownload?: () => void;
}

export function FlashcardsView({ outputId, onDownload }: FlashcardsViewProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(`/api/generate?id=${outputId}`);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        
        const data = await response.json();
        let cards: Flashcard[] = [];
        
        if (Array.isArray(data.output.content)) {
          cards = data.output.content;
        } else if (data.output.content.flashcards) {
          cards = data.output.content.flashcards;
        }
        
        setFlashcards(cards);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        toast.error('Failed to load flashcards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [outputId]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No flashcards generated</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Flashcards ({currentIndex + 1} / {flashcards.length})
        </h2>
        <Button size="sm" onClick={onDownload} className="bg-emerald-600 hover:bg-emerald-700">
          Export Anki
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div 
          className="relative w-full max-w-2xl h-96 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <Card 
              className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center">
                <p className="text-sm text-emerald-600 font-medium mb-4">QUESTION</p>
                <p className="text-2xl font-semibold text-foreground">{currentCard.front}</p>
                <p className="text-xs text-muted-foreground mt-6">Click to flip</p>
              </div>
            </Card>

            {/* Back */}
            <Card 
              className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="text-center">
                <p className="text-sm text-teal-600 font-medium mb-4">ANSWER</p>
                <p className="text-xl text-foreground">{currentCard.back}</p>
                <p className="text-xs text-muted-foreground mt-6">Click to flip back</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Flip
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
