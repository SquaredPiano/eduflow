'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Maximize, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  title: string;
  content: string[];
  image?: string;
}

interface SlidesViewerProps {
  slides: Slide[];
  title?: string;
}

export function SlidesViewer({ slides, title = 'Presentation Slides' }: SlidesViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const slide = slides[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') setIsFullscreen(false);
  };

  const handleExportPPTX = () => {
    // In a real implementation, you'd use a library like pptxgenjs
    toast.info('PowerPoint export coming soon!');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="outline" onClick={() => setShowGrid(false)}>
            Exit Grid View
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {slides.map((s, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setCurrentSlide(index);
                setShowGrid(false);
              }}
            >
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Slide {index + 1}</div>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{s.title}</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {s.content.slice(0, 3).map((line, i) => (
                    <p key={i} className="line-clamp-1">• {line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'space-y-4'}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {!isFullscreen && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowGrid(true)}>
              <Grid3x3 className="mr-2 h-4 w-4" />
              Grid View
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              <Maximize className="mr-2 h-4 w-4" />
              Present
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPPTX}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      )}

      <Card className={`${isFullscreen ? 'h-screen rounded-none' : 'aspect-video'}`}>
        <CardContent className="h-full p-12 flex flex-col justify-center">
          <div className="space-y-8">
            <h2 className={`${isFullscreen ? 'text-6xl' : 'text-4xl'} font-bold text-primary`}>
              {slide.title}
            </h2>
            
            <div className={`space-y-4 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
              {slide.content.map((line, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <p>{line}</p>
                </div>
              ))}
            </div>

            {slide.image && (
              <div className="mt-8">
                <img
                  src={slide.image}
                  alt={`Slide ${currentSlide + 1} image`}
                  className="max-h-64 rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className={`flex items-center justify-between ${isFullscreen ? 'absolute bottom-8 left-8 right-8' : ''}`}>
        <Button
          variant={isFullscreen ? 'secondary' : 'outline'}
          onClick={handlePrevious}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {isFullscreen && (
          <Button variant="secondary" onClick={handleFullscreen}>
            Exit Fullscreen (Esc)
          </Button>
        )}

        <Button
          variant={isFullscreen ? 'secondary' : 'outline'}
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
