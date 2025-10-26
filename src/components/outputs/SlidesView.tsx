'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  title: string;
  content: string[];
}

interface SlidesViewProps {
  outputId: string;
  onDownload?: () => void;
}

export function SlidesView({ outputId, onDownload }: SlidesViewProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`/api/generate?id=${outputId}`);
        if (!response.ok) throw new Error('Failed to fetch slides');
        
        const data = await response.json();
        let slideContent: Slide[] = [];
        
        if (data.output.content.slides) {
          slideContent = data.output.content.slides;
        } else if (Array.isArray(data.output.content)) {
          slideContent = data.output.content;
        }
        
        setSlides(slideContent);
      } catch (error) {
        console.error('Error fetching slides:', error);
        toast.error('Failed to load slides');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, [outputId]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No slides generated</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Slide {currentIndex + 1} of {slides.length}
        </h2>
        <Button size="sm" onClick={onDownload} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          Export PPTX
        </Button>
      </div>

      <Card className="flex-1 p-12 bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col justify-center">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          {currentSlide.title}
        </h1>
        <ul className="space-y-4 text-lg text-foreground/90">
          {currentSlide.content.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {slides.length}
        </span>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
