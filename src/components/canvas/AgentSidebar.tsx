'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  HelpCircle, 
  Presentation,
  Sparkles,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AgentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const agents = [
  {
    type: 'notes',
    label: 'Notes Generator',
    description: 'Generate comprehensive study notes',
    icon: FileText,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'flashcards',
    label: 'Flashcards Creator',
    description: 'Create spaced-repetition flashcards',
    icon: Brain,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    type: 'quiz',
    label: 'Quiz Generator',
    description: 'Generate practice quizzes',
    icon: HelpCircle,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    type: 'slides',
    label: 'Slides Extractor',
    description: 'Extract key points for slides',
    icon: Presentation,
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
  const onDragStart = (event: React.DragEvent, agentType: string, agentLabel: string) => {
    event.dataTransfer.setData('application/reactflow', agentType);
    event.dataTransfer.setData('agentLabel', agentLabel);
    event.dataTransfer.effectAllowed = 'move';
    
    // Close sidebar when dragging starts to prevent backdrop from blocking drop
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 bg-white border-r shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-linear-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Agents</h3>
              <p className="text-xs text-gray-500">Drag & drop onto canvas</p>
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

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-900 font-medium mb-1">How to use:</p>
              <ol className="text-blue-700 space-y-1 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">1.</span>
                  <span>Drag an agent card from below</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">2.</span>
                  <span>Drop it onto the canvas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">3.</span>
                  <span>Connect files to agent nodes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">4.</span>
                  <span>Click "Generate" to create content</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.type}
                draggable
                onDragStart={(e: React.DragEvent) => onDragStart(e, agent.type, agent.label)}
                className="cursor-grab active:cursor-grabbing"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <Card className="p-4 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-gray-200 bg-linear-to-br from-white to-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg bg-linear-to-br ${agent.gradient} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 text-${agent.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {agent.label}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          AI
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {agent.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <ChevronRight className="h-3 w-3" />
                        <span>Drag to add</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            <p className="mb-2">💡 <span className="font-medium">Pro Tip:</span></p>
            <p>Connect multiple files to one agent for batch generation</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Floating button to open sidebar
export function AgentSidebarToggle({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed left-6 bottom-6 h-14 px-6 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all z-30 flex items-center gap-3 font-medium ${
        isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Sparkles className="h-5 w-5" />
      <span>Add AI Agents</span>
    </motion.button>
  );
}
