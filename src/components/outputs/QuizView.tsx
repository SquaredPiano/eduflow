'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface QuizViewProps {
  outputId: string;
  onDownload?: () => void;
}

export function QuizView({ outputId, onDownload }: QuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/generate?id=${outputId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz');
        
        const data = await response.json();
        let quizQuestions: Question[] = [];
        
        if (data.output.content.questions) {
          quizQuestions = data.output.content.questions;
        } else if (Array.isArray(data.output.content)) {
          quizQuestions = data.output.content;
        }
        
        setQuestions(quizQuestions);
        setAnswers(new Array(quizQuestions.length).fill(null));
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [outputId]);

  const handleSelectAnswer = (optionIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(optionIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (selectedAnswer === questions[currentIndex].correct) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1]);
      setShowResult(answers[currentIndex + 1] !== null);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">No quiz questions generated</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct;
  const allAnswered = answers.every(a => a !== null);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Question {currentIndex + 1} of {questions.length}
          </h2>
          {allAnswered && (
            <p className="text-sm text-muted-foreground">
              Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Card className="flex-1 p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? showResult
                    ? index === currentQuestion.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-emerald-500 bg-emerald-50'
                  : showResult && index === currentQuestion.correct
                  ? 'border-green-500 bg-green-50'
                  : 'border-border hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground">{option}</span>
                {showResult && index === currentQuestion.correct && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correct && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {showResult && currentQuestion.explanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Explanation:</p>
            <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}
      </Card>

      <div className="flex gap-2 mt-6">
        {!showResult ? (
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
          >
            {currentIndex === questions.length - 1 ? 'Finished!' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  );
}
