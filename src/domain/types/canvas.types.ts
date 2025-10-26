/**
 * Canvas Domain Types
 * 
 * TypeScript types for the React Flow canvas state management.
 * These mirror the Prisma schema but are optimized for client-side use.
 * 
 * KEY CONCEPTS:
 * - Projects contain canvases and files (shown in dashboard)
 * - ONE canvas per project
 * - ONE source material node per canvas (the root)
 * - MULTIPLE agent nodes that chain together
 * - Edges: source → agents, agents → agents
 */

import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

// ============================================
// PROJECT (Dashboard view)
// ============================================

export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  userId: string;
  quercusCourseId?: string; // If imported from Quercus
  thumbnail?: string;
  lastOpenedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated relations
  canvas?: FlowCanvasState;
  files?: FileData[];
  fileCount?: number; // For dashboard display without loading all files
}

export interface FileData {
  id: string;
  name: string;
  type: string;
  url: string;
  key: string;
  size: number;
  projectId: string;
  quercusFileId?: string;
  hasTranscript: boolean;
  createdAt: string;
}

// ============================================
// ENUMS (matching Prisma)
// ============================================

export enum AgentType {
  FLASHCARD = 'flashcard',
  QUIZ = 'quiz',
  NOTES = 'notes',
  SLIDES = 'slides',
  SUMMARY = 'summary',
}

export enum AgentStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum EdgeSourceType {
  SOURCE_MATERIAL = 'source_material',
  AGENT = 'agent',
}

// ============================================
// CANVAS STATE
// ============================================

export interface FlowCanvasState {
  id: string;
  projectId: string; // Parent project
  zoom: number;
  viewportX: number;
  viewportY: number;
  
  // Single source material node
  sourceNode?: SourceMaterialNodeData;
  
  // Multiple agent nodes
  agentNodes: AgentNodeData[];
  
  // Edges connecting them
  edges: CanvasEdgeData[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

// ============================================
// SOURCE MATERIAL NODE (singular)
// ============================================

export interface SourceMaterialNodeData {
  id: string;
  nodeId: string; // React Flow node ID
  positionX: number;
  positionY: number;
  
  // Linked content
  fileId?: string;
  transcriptId?: string;
  title: string;
  preview?: string;
  
  // Populated relations
  file?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  };
  transcript?: {
    id: string;
    content: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// AGENT NODE (multiple)
// ============================================

export interface AgentNodeData {
  id: string;
  canvasId: string;
  nodeId: string; // React Flow node ID
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  isCollapsed: boolean;
  
  // Agent configuration
  agentType: AgentType;
  status: AgentStatus;
  config?: Record<string, unknown>;
  
  // Generated output
  outputId?: string;
  output?: {
    id: string;
    type: string;
    content: unknown;
    createdAt: string;
  };
  
  // Error state
  errorMessage?: string;
  processedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EDGE DATA (source → agent OR agent → agent)
// ============================================

export interface CanvasEdgeData {
  id: string;
  canvasId: string;
  edgeId: string; // React Flow edge ID
  
  // Source can be material or agent
  sourceType: EdgeSourceType;
  sourceNodeId?: string;      // If source is material
  sourceAgentId?: string;     // If source is agent
  
  // Target is always an agent
  targetAgentId: string;
  
  // Styling
  type?: string;
  animated: boolean;
  label?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REACT FLOW TYPES (for UI)
// ============================================

export interface SourceMaterialNodeProps extends Record<string, unknown> {
  id: string;
  title: string;
  fileType?: string;
  preview?: string;
}

export interface AgentNodeProps extends Record<string, unknown> {
  id: string;
  agentType: AgentType;
  status: AgentStatus;
  config?: Record<string, unknown>;
  output?: unknown;
  errorMessage?: string;
  isCollapsed: boolean;
}

export type SourceMaterialNode = ReactFlowNode<SourceMaterialNodeProps, 'sourceMaterial'>;
export type AgentNode = ReactFlowNode<AgentNodeProps, 'agent'>;
export type CanvasNode = SourceMaterialNode | AgentNode;
export type CanvasEdge = ReactFlowEdge<{ animated?: boolean; label?: string }>;

// ============================================
// API TYPES
// ============================================

// Project APIs
export interface CreateProjectRequest {
  name: string;
  description?: string;
  quercusCourseId?: string; // If importing from Quercus
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  thumbnail?: string;
  lastOpenedAt?: string;
}

export interface ImportQuercusProjectRequest {
  courseId: string;        // Quercus course ID
  courseName: string;      // Course name from Quercus
  fileIds?: string[];      // Optional: specific files to import
}

// Canvas APIs
export interface CreateCanvasRequest {
  projectId: string;
  
  // Optional: create with initial source material
  sourceNode?: {
    fileId?: string;
    transcriptId?: string;
    title: string;
    positionX?: number;
    positionY?: number;
  };
}

export interface UpdateCanvasRequest {
  zoom?: number;
  viewportX?: number;
  viewportY?: number;
}

// File APIs (within a project)
export interface UploadFileRequest {
  projectId: string;
  // File data comes from UploadThing
}

export interface ImportQuercusFilesRequest {
  projectId: string;
  fileIds: string[];      // Quercus file IDs to import
}

export interface CreateSourceNodeRequest {
  canvasId: string;
  nodeId: string;
  fileId?: string;
  transcriptId?: string;
  title: string;
  positionX: number;
  positionY: number;
  preview?: string;
}

export interface UpdateSourceNodeRequest {
  positionX?: number;
  positionY?: number;
  title?: string;
  preview?: string;
}

export interface CreateAgentNodeRequest {
  canvasId: string;
  nodeId: string;
  agentType: AgentType;
  positionX: number;
  positionY: number;
  config?: Record<string, unknown>;
}

export interface UpdateAgentNodeRequest {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  isCollapsed?: boolean;
  status?: AgentStatus;
  config?: Record<string, unknown>;
  outputId?: string;
  errorMessage?: string;
}

export interface CreateEdgeRequest {
  canvasId: string;
  edgeId: string;
  sourceType: EdgeSourceType;
  sourceNodeId?: string;    // If source is material
  sourceAgentId?: string;   // If source is agent
  targetAgentId: string;    // Always required
  type?: string;
  animated?: boolean;
  label?: string;
}

export interface UpdateEdgeRequest {
  type?: string;
  animated?: boolean;
  label?: string;
}

// ============================================
// AGENT CONFIGURATION TYPES
// ============================================

export interface FlashcardConfig {
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  includeHints?: boolean;
}

export interface QuizConfig {
  questionCount?: number;
  questionType?: 'multiple_choice' | 'true_false' | 'short_answer' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in minutes
}

export interface NotesConfig {
  format?: 'outline' | 'paragraph' | 'bullet_points';
  detailLevel?: 'brief' | 'moderate' | 'detailed';
  includeExamples?: boolean;
}

export interface SlidesConfig {
  slideCount?: number;
  template?: 'minimal' | 'modern' | 'academic';
  includeImages?: boolean;
}

export interface SummaryConfig {
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullet_points';
  includeKeyPoints?: boolean;
}

export type AgentConfig =
  | FlashcardConfig
  | QuizConfig
  | NotesConfig
  | SlidesConfig
  | SummaryConfig;

// ============================================
// UTILITY TYPES
// ============================================

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// HELPER TYPE GUARDS & UTILITIES
// ============================================

export function isAgentProcessing(node: AgentNodeData): boolean {
  return node.status === AgentStatus.PROCESSING;
}

export function isAgentCompleted(node: AgentNodeData): boolean {
  return node.status === AgentStatus.COMPLETED;
}

export function isAgentError(node: AgentNodeData): boolean {
  return node.status === AgentStatus.ERROR;
}

export function isAgentIdle(node: AgentNodeData): boolean {
  return node.status === AgentStatus.IDLE;
}

export function isEdgeFromSource(edge: CanvasEdgeData): boolean {
  return edge.sourceType === EdgeSourceType.SOURCE_MATERIAL;
}

export function isEdgeFromAgent(edge: CanvasEdgeData): boolean {
  return edge.sourceType === EdgeSourceType.AGENT;
}

/**
 * Get all agent nodes that are directly connected to the source material
 */
export function getSourceConnectedAgents(
  sourceNodeId: string,
  edges: CanvasEdgeData[],
  agentNodes: AgentNodeData[]
): AgentNodeData[] {
  const connectedAgentIds = edges
    .filter(edge => edge.sourceType === EdgeSourceType.SOURCE_MATERIAL && edge.sourceNodeId === sourceNodeId)
    .map(edge => edge.targetAgentId);
  
  return agentNodes.filter(node => connectedAgentIds.includes(node.id));
}

/**
 * Get all agent nodes that are downstream from a given agent
 */
export function getDownstreamAgents(
  agentId: string,
  edges: CanvasEdgeData[],
  agentNodes: AgentNodeData[]
): AgentNodeData[] {
  const downstreamAgentIds = edges
    .filter(edge => edge.sourceType === EdgeSourceType.AGENT && edge.sourceAgentId === agentId)
    .map(edge => edge.targetAgentId);
  
  return agentNodes.filter(node => downstreamAgentIds.includes(node.id));
}

/**
 * Get all agent nodes that feed into a given agent
 */
export function getUpstreamAgents(
  agentId: string,
  edges: CanvasEdgeData[],
  agentNodes: AgentNodeData[]
): AgentNodeData[] {
  const upstreamAgentIds = edges
    .filter(edge => edge.sourceType === EdgeSourceType.AGENT && edge.targetAgentId === agentId)
    .map(edge => edge.sourceAgentId)
    .filter((id): id is string => id !== undefined);
  
  return agentNodes.filter(node => upstreamAgentIds.includes(node.id));
}

/**
 * Check if an agent is directly connected to source material
 */
export function isConnectedToSource(
  agentId: string,
  edges: CanvasEdgeData[]
): boolean {
  return edges.some(
    edge => 
      edge.sourceType === EdgeSourceType.SOURCE_MATERIAL && 
      edge.targetAgentId === agentId
  );
}

/**
 * Get the execution order of agents (topological sort)
 * Returns agents in the order they should be processed
 */
export function getAgentExecutionOrder(
  sourceNodeId: string | undefined,
  edges: CanvasEdgeData[],
  agentNodes: AgentNodeData[]
): AgentNodeData[] {
  if (!sourceNodeId) return [];
  
  const visited = new Set<string>();
  const order: AgentNodeData[] = [];
  
  function visit(agentId: string) {
    if (visited.has(agentId)) return;
    visited.add(agentId);
    
    // Visit all upstream dependencies first
    const upstream = getUpstreamAgents(agentId, edges, agentNodes);
    upstream.forEach(agent => visit(agent.id));
    
    // Then add this agent
    const agent = agentNodes.find(n => n.id === agentId);
    if (agent) order.push(agent);
  }
  
  // Start with agents connected to source
  const sourceConnected = getSourceConnectedAgents(sourceNodeId, edges, agentNodes);
  sourceConnected.forEach(agent => visit(agent.id));
  
  return order;
}
