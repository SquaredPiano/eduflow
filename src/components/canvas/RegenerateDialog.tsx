'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface RegenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (userContext: string) => Promise<void>;
  agentType: 'notes' | 'flashcards' | 'quiz' | 'slides';
  outputId?: string;
}

const agentLabels = {
  notes: 'Notes',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
  slides: 'Slides',
};

const examplePrompts = {
  notes: [
    'Make the notes more concise and bullet-pointed',
    'Add more detailed explanations with examples',
    'Focus on key concepts and definitions',
    'Organize the notes by topic',
  ],
  flashcards: [
    'Make the questions more challenging',
    'Add more cards covering edge cases',
    'Simplify the language for beginners',
    'Create flashcards for specific topics only',
  ],
  quiz: [
    'Make this quiz harder with more advanced questions',
    'Add more multiple choice questions',
    'Focus on application-based questions',
    'Create questions for [specific topic]',
  ],
  slides: [
    'Make the slides more visual and concise',
    'Add more slides with detailed explanations',
    'Organize by chronological order',
    'Focus on [specific topic]',
  ],
};

export function RegenerateDialog({
  isOpen,
  onClose,
  onRegenerate,
  agentType,
  outputId,
}: RegenerateDialogProps) {
  const [userContext, setUserContext] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!userContext.trim()) {
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(userContext.trim());
      setUserContext('');
      onClose();
    } catch (error) {
      console.error('Regeneration error:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setUserContext(example);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Regenerate {agentLabels[agentType]}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add instructions to customize the output
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            disabled={isRegenerating}
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Examples */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Example instructions:
            </label>
            <div className="flex flex-wrap gap-2">
              {examplePrompts[agentType].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-700 dark:text-gray-300"
                  disabled={isRegenerating}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="userContext"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your instructions:
            </label>
            <textarea
              id="userContext"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder={`e.g., "${examplePrompts[agentType][0]}"`}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isRegenerating}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Be specific about what you want changed or improved in the regenerated content.
            </p>
          </div>

          {/* Version Info */}
          {outputId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
              <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                ℹ️ This will create a new version while keeping the original
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            disabled={isRegenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userContext.trim() || isRegenerating}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Regenerate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
