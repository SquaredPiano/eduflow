'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Download, Upload, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Custom node components
import FileNode from '@/components/canvas/FileNode';
import AgentNode from '@/components/canvas/AgentNode';
import OutputNode from '@/components/canvas/OutputNode';

const nodeTypes = {
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
  }>;
}

export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const queryClient = useQueryClient();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch project data
  const { data: project, isLoading } = useQuery<ProjectData>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  // Initialize canvas with project data
  useEffect(() => {
    if (!project) return;

    // Create nodes from files
    const fileNodes: Node[] = project.files.map((file, index) => ({
      id: `file-${file.id}`,
      type: 'fileNode',
      position: { x: 100, y: 100 + index * 150 },
      data: {
        label: file.name,
        fileId: file.id,
        url: file.url,
        mimeType: file.mimeType,
      },
    }));

    // Create agent nodes (AI processors)
    const agentNodes: Node[] = [
      {
        id: 'agent-notes',
        type: 'agentNode',
        position: { x: 500, y: 100 },
        data: { label: 'Notes Generator', agentType: 'notes' },
      },
      {
        id: 'agent-flashcards',
        type: 'agentNode',
        position: { x: 500, y: 300 },
        data: { label: 'Flashcards Generator', agentType: 'flashcards' },
      },
      {
        id: 'agent-quiz',
        type: 'agentNode',
        position: { x: 500, y: 500 },
        data: { label: 'Quiz Generator', agentType: 'quiz' },
      },
      {
        id: 'agent-slides',
        type: 'agentNode',
        position: { x: 500, y: 700 },
        data: { label: 'Slides Generator', agentType: 'slides' },
      },
    ];

    // Create output nodes
    const outputNodes: Node[] = project.outputs.map((output, index) => ({
      id: `output-${output.id}`,
      type: 'outputNode',
      position: { x: 900, y: 100 + index * 200 },
      data: {
        label: `${output.type} Output`,
        outputId: output.id,
        outputType: output.type,
        content: output.content,
      },
    }));

    setNodes([...fileNodes, ...agentNodes, ...outputNodes]);

    // Create edges based on file-output relationships
    const outputEdges: Edge[] = project.outputs
      .filter((output) => output.fileId)
      .map((output) => ({
        id: `file-${output.fileId}-output-${output.id}`,
        source: `file-${output.fileId}`,
        target: `agent-${output.type}`,
        animated: true,
        style: { stroke: '#3B82F6' },
      }));

    setEdges(outputEdges);
  }, [project, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  // Save canvas state
  const saveCanvas = async () => {
    setIsSaving(true);
    try {
      await api.post(`/api/projects/${projectId}/canvas`, {
        nodes,
        edges,
      });
      toast.success('Canvas saved successfully');
    } catch (error) {
      toast.error('Failed to save canvas');
    } finally {
      setIsSaving(false);
    }
  };

  // Export canvas as JSON
  const exportCanvas = () => {
    const canvasData = { nodes, edges };
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center max-w-md">
          <h3 className="font-semibold mb-2">Project not found</h3>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/project/${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{project.name} - Flow Canvas</h1>
            <p className="text-sm text-muted-foreground">
              Visualize your learning workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCanvas}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={saveCanvas} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Canvas
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background />
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
          />
          <Panel position="top-right" className="bg-background border rounded-lg p-4 m-4 space-y-2">
            <div className="text-sm font-semibold mb-2">Legend</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Files</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span>AI Agents</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Outputs</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
