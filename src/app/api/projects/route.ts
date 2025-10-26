import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Auth0 Next.js SDK automatically handles authentication
    // We'll validate the session exists via middleware or here
    const { searchParams } = new URL(request.url);
    
    // For now, skip auth check - implement proper Auth0 middleware later
    // In production, use Auth0's withApiAuthRequired or custom middleware
    const userId = searchParams.get('userId'); // Temp workaround
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.sub,
        ...(includeArchived ? {} : { archived: false }),
      },
      include: {
        _count: {
          select: { files: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const res = new NextResponse();
    const session = await getSession(request, res);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: session.user.sub,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
