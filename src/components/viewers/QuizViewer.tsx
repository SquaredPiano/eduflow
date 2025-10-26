'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizViewerProps {
  questions: QuizQuestion[];
  title?: string;
}

export function QuizViewer({ questions, title = 'Practice Quiz' }: QuizViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    setShowResult(true);
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
      toast.success('Correct!');
    } else {
      toast.error('Incorrect');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-6xl font-bold text-primary">{percentage.toFixed(0)}%</p>
            <p className="text-xl text-muted-foreground">
              You scored {score} out of {questions.length}
            </p>
          </div>
          
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Quiz
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  showResult
                    ? index === question.correctAnswer
                      ? 'bg-green-50 border-green-500'
                      : index === selectedAnswer
                      ? 'bg-red-50 border-red-500'
                      : 'border-gray-200'
                    : selectedAnswer === index
                    ? 'bg-primary/10 border-primary'
                    : 'border-gray-200 hover:bg-accent hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                  {showResult && index === question.correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && question.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {!showResult ? (
              <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
