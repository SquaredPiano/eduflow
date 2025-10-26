import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface CanvasData {
  nodes: any[];
  edges: any[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

/**
 * POST /api/projects/[id]/canvas
 * Save canvas state (nodes, edges, viewport)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = (await params).id;
    const body: CanvasData = await request.json();
    const { nodes, edges, viewport } = body;

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: 'Missing canvas data (nodes and edges required)' },
        { status: 400 }
      );
    }

    // Verify project exists and user owns it
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user || project.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this project' },
        { status: 403 }
      );
    }

    // Save canvas data to project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasState: {
          nodes,
          edges,
          viewport,
          lastSaved: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Canvas saved successfully',
      canvasState: updatedProject.canvasState,
    });
  } catch (error) {
    console.error('Save canvas error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to save canvas',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/projects/[id]/canvas
 * Retrieve saved canvas state
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = (await params).id;

    // Verify project exists and user owns it
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        userId: true,
        canvasState: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user || project.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this project' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      canvasState: project.canvasState || {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    });
  } catch (error) {
    console.error('Get canvas error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to get canvas',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
