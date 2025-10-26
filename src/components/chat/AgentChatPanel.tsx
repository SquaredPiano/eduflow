take'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AgentChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  outputType?: string;
  outputContent?: any;
  outputTitle?: string;
}

export function AgentChatPanel({
  isOpen,
  onClose,
  outputType,
  outputContent,
  outputTitle,
}: AgentChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: outputType
        ? `Hi! I'm here to help you refine your ${outputType}. What would you like to improve?`
        : "Hi! I'm your AI learning assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await api.post<{ message: string; provider: string }>('/api/chat', {
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ],
        outputType,
        outputContent,
      });
      return response;
    },
    onSuccess: (data) => {
      console.log('Chat response:', data);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    chatMutation.mutate(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Chat Panel - No backdrop, slides in smoothly */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-40 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  {outputTitle && (
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {outputTitle}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {chatMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="min-h-[60px] max-h-[120px] resize-none bg-white"
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 h-[60px] px-4"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating chat button for when panel is closed
export function ChatFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow z-40 flex items-center justify-center"
    >
      <MessageSquare className="h-6 w-6" />
    </motion.button>
  );
}
