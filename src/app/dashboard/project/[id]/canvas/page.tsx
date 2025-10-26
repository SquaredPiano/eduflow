'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { api } from '@/lib/apiClient';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Panel,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Upload, 
  Loader2, 
  Plus,
  Sparkles,
  Settings2,
  Maximize2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Custom node components
import FileNode from '@/components/canvas/FileNode';
import { AgentNode } from '@/components/canvas/AgentNode';
import OutputNode from '@/components/canvas/OutputNode';
import { FloatingChat } from '@/components/canvas/FloatingChat';

const nodeTypes: NodeTypes = {
  fileNode: FileNode,
  agentNode: AgentNode,
  outputNode: OutputNode,
};

interface ProjectData {
  id: string;
  name: string;
  files: Array<{
    id: string;
    name: string;
    url: string;
    mimeType?: string;
  }>;
  outputs: Array<{
    id: string;
    type: string;
    content: any;
    fileId?: string;
    status?: string;
  }>;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const queryClient = useQueryClient();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch project data
  const { data: project, isLoading, error } = useQuery<ProjectData>({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectData> => {
      try {
        const data = await api.get<ProjectData>(`/api/projects/${projectId}`);
        console.log('✅ Project loaded:', data);
        return data;
      } catch (err) {
        console.error('❌ Failed to load project:', err);
        throw err;
      }
    },
    enabled: !!projectId,
    retry: 1,
  });

  // GSAP: Canvas entry animation
  useEffect(() => {
    if (canvasRef.current) {
      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power3.out',
      });
    }
  }, []);

  // Initialize canvas with project data + GSAP animations
  useEffect(() => {
    if (!project) return;

    // Map eduflow types to youpac-ai agent types
    const typeMapping = {
      'notes': 'title', // Title agent in youpac-ai
      'flashcards': 'description', // Description agent
      'quiz': 'thumbnail', // Thumbnail agent  
      'slides': 'tweets', // Tweets agent
    };

    const fileNodes: Node[] = project.files.map((file, index) => ({
      id: `file-${file.id}`,
      type: 'fileNode',
      position: { x: 100, y: 100 + index * 180 },
      data: {
        label: file.name,
        fileId: file.id,
        url: file.url,
        mimeType: file.mimeType,
        onView: () => window.open(file.url, '_blank'),
      },
    }));

    // AI Agent nodes with enhanced configuration (adapted for eduflow)
    const agentNodes: Node[] = [
      {
        id: 'agent-notes',
        type: 'agentNode',
        position: { x: 500, y: 100 },
        data: {
          type: 'title', // Using youpac-ai type mapping
          label: 'Notes Generator',
          draft: project.outputs.find((o) => o.type === 'notes')?.content?.content || '',
          status: project.outputs.find((o) => o.type === 'notes')?.status || 'idle',
          connections: fileNodes.map((n) => n.id),
          onGenerate: () => handleGenerate('notes'),
          onView: () => handleViewOutput('notes'),
          onChat: () => console.log('Chat with notes agent'),
        },
      },
      {
        id: 'agent-flashcards',
        type: 'agentNode',
        position: { x: 500, y: 320 },
        data: {
          type: 'description',
          label: 'Flashcards Generator',
          draft: project.outputs.find((o) => o.type === 'flashcards')?.content?.cards?.[0]?.front || '',
          status: project.outputs.find((o) => o.type === 'flashcards')?.status || 'idle',
          connections: fileNodes.map((n) => n.id),
          onGenerate: () => handleGenerate('flashcards'),
          onView: () => handleViewOutput('flashcards'),
          onChat: () => console.log('Chat with flashcards agent'),
        },
      },
      {
        id: 'agent-quiz',
        type: 'agentNode',
        position: { x: 500, y: 540 },
        data: {
          type: 'thumbnail',
          label: 'Quiz Generator',
          draft: project.outputs.find((o) => o.type === 'quiz')?.content?.questions?.[0]?.question || '',
          status: project.outputs.find((o) => o.type === 'quiz')?.status || 'idle',
          connections: fileNodes.map((n) => n.id),
          onGenerate: () => handleGenerate('quiz'),
          onView: () => handleViewOutput('quiz'),
          onChat: () => console.log('Chat with quiz agent'),
        },
      },
      {
        id: 'agent-slides',
        type: 'agentNode',
        position: { x: 500, y: 760 },
        data: {
          type: 'tweets',
          label: 'Slides Generator',
          draft: project.outputs.find((o) => o.type === 'slides')?.content?.slides?.[0]?.title || '',
          status: project.outputs.find((o) => o.type === 'slides')?.status || 'idle',
          connections: fileNodes.map((n) => n.id),
          onGenerate: () => handleGenerate('slides'),
          onView: () => handleViewOutput('slides'),
          onChat: () => console.log('Chat with slides agent'),
        },
      },
    ];

    const outputNodes: Node[] = project.outputs.map((output, index) => ({
      id: `output-${output.id}`,
      type: 'outputNode',
      position: { x: 950, y: 100 + index * 220 },
      data: {
        label: `${output.type} Output`,
        outputId: output.id,
        outputType: output.type,
        content: output.content,
        onView: () =>
          router.push(`/dashboard/project/${projectId}?tab=outputs&output=${output.id}`),
        onDownload: () => handleDownloadOutput(output.id),
      },
    }));

    const allNodes = [...fileNodes, ...agentNodes, ...outputNodes];
    setNodes(allNodes);

    // Create animated edges
    const outputEdges: Edge[] = project.outputs
      .filter((output) => output.fileId)
      .flatMap((output) => [
        {
          id: `file-${output.fileId}-agent-${output.type}`,
          source: `file-${output.fileId}`,
          target: `agent-${output.type}`,
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
        },
        {
          id: `agent-${output.type}-output-${output.id}`,
          source: `agent-${output.type}`,
          target: `output-${output.id}`,
          animated: true,
          style: { stroke: '#8B5CF6', strokeWidth: 2 },
        },
      ]);

    setEdges(outputEdges);

    // GSAP: Animate nodes in with stagger
    setTimeout(() => {
      gsap.fromTo(
        '.react-flow__node',
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        }
      );
    }, 100);
  }, [project, setNodes, setEdges, projectId, router]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } }, eds)
      );

      // GSAP: Animate new connection
      setTimeout(() => {
        gsap.from('.react-flow__edge-path:last-child', {
          strokeDasharray: '5, 5',
          strokeDashoffset: 10,
          duration: 1,
          ease: 'none',
        });
      }, 50);
    },
    [setEdges]
  );

  const handleGenerate = async (type: string) => {
    if (!project?.files[0]) {
      toast.error('Please upload a file first');
      return;
    }

    setIsGenerating(true);
    try {
      await api.post('/api/generate', {
        fileId: project.files[0].id,
        type,
      });

      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Generating ${type}...`);

      // GSAP: Pulse animation on agent node
      const tl = gsap.timeline();
      tl.to(`#agent-${type}`, {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 5,
        ease: 'power2.inOut',
      });
    } catch (error) {
      toast.error('Failed to start generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewOutput = (type: string) => {
    router.push(`/dashboard/project/${projectId}?tab=outputs&type=${type}`);
  };

  const handleDownloadOutput = (outputId: string) => {
    toast.info('Downloading output...');
    // TODO: Implement download
  };

  const saveCanvas = async () => {
    setIsSaving(true);
    try {
      await api.post(`/api/projects/${projectId}/canvas`, {
        nodes,
        edges,
        viewport: reactFlowInstance?.getViewport(),
      });
      toast.success('Canvas saved successfully');

      // GSAP: Success animation
      const tl = gsap.timeline();
      tl.to('.save-button', {
        scale: 1.2,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });
    } catch (error) {
      toast.error('Failed to save canvas');
    } finally {
      setIsSaving(false);
    }
  };

  const exportCanvas = () => {
    const canvasData = {
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport(),
      project: { name: project?.name },
    };
    const blob = new Blob([JSON.stringify(canvasData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'canvas'}-flow.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Canvas exported');
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // TODO: Implement actual AI chat
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I can help you with that! This is a placeholder response. The AI chat will be integrated with your agents soon.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F6]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading canvas...</p>
          <p className="text-xs text-gray-400 mt-2">Project ID: {projectId}</p>
        </motion.div>
      </div>
    );
  }

  if (error || (!project && !isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F6]">
        <Card className="p-6 text-center max-w-md">
          <h3 className="font-semibold mb-4 text-red-600">
            {error ? 'Failed to load project' : 'Project not found'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {error 
              ? 'There was an error loading this project. Please try again or contact support if the issue persists.'
              : "This project doesn't exist or you don't have access to it."
            }
            <br />
            <span className="text-xs text-gray-500 mt-2 block">Project ID: {projectId}</span>
            {error && (
              <span className="text-xs text-red-500 mt-2 block">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </span>
            )}
          </p>
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry Loading
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!project) {
    return null; // Should not reach here due to checks above
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#FAF9F6]" ref={canvasRef}>
      {/* Animated Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/project/${projectId}`}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600">Flow Canvas - AI Learning Workflow</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" onClick={exportCanvas}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={saveCanvas}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 save-button"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Canvas
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* React Flow Canvas with animations */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          fitView
          className="bg-[#FAF9F6]"
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'fileNode':
                  return '#3B82F6';
                case 'agentNode':
                  return '#0b8e16';
                case 'outputNode':
                  return '#8B5CF6';
                default:
                  return '#94a3b8';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Animated Legend Panel */}
          <Panel position="top-right" className="space-y-2">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white border rounded-lg p-4 shadow-lg"
            >
              <div className="text-sm font-semibold mb-3 text-gray-900">Legend</div>
              <div className="space-y-2">
                {[
                  { color: 'bg-blue-600', label: 'Source Files' },
                  { color: 'bg-green-600', label: 'AI Agents' },
                  { color: 'bg-purple-600', label: 'Outputs' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-gray-700">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Panel */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white border rounded-lg p-4 shadow-lg"
            >
              <div className="text-sm font-semibold mb-3 text-gray-900">Stats</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Files:</span>
                  <span className="font-semibold text-gray-900">{project.files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outputs:</span>
                  <span className="font-semibold text-gray-900">{project.outputs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nodes:</span>
                  <span className="font-semibold text-gray-900">{nodes.length}</span>
                </div>
              </div>
            </motion.div>
          </Panel>

          {/* Quick Actions Panel */}
          <Panel position="bottom-left" className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                className="bg-white"
                onClick={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 800 })}
              >
                <Maximize2 className="mr-2 h-4 w-4" />
                Fit View
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                className="bg-white"
                onClick={() => router.push(`/dashboard/project/${projectId}?tab=files`)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Add Files
              </Button>
            </motion.div>
          </Panel>
        </ReactFlow>

        {/* Floating AI Chat */}
        <FloatingChat
          agents={[
            { id: 'agent-notes', type: 'notes', draft: '' },
            { id: 'agent-flashcards', type: 'flashcards', draft: '' },
            { id: 'agent-quiz', type: 'quiz', draft: '' },
            { id: 'agent-slides', type: 'slides', draft: '' },
          ]}
          messages={messages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
        />
      </div>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Canvas Settings</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Auto-Layout
                  </label>
                  <Button variant="outline" className="w-full">
                    Apply Auto-Layout
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Canvas Theme
                  </label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Grid Size
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    defaultValue="16"
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
