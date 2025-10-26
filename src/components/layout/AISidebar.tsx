'use client';

import { useState } from 'react';
import { Bot, MessageSquare, Sparkles, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function AISidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, { role: 'user', content: message }]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'I can help you with that! This is a placeholder response. The AI agent will be integrated soon.' 
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700 hover:scale-110 transition-all z-50"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 z-40',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Ask me anything</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 180px)' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 rounded-full bg-blue-50 p-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="mb-2 font-semibold text-gray-900">Start a conversation</h4>
              <p className="text-sm text-gray-600 max-w-xs">
                Ask questions about your projects, get help with study materials, or generate content.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-lg p-3 max-w-[85%]',
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-blue-600 hover:bg-blue-700 h-[60px] px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
