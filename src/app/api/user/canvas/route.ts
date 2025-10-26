import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('appSession');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    const auth0User = session.user;
    
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    });
    
    return dbUser;
  } catch {
    return null;
  }
}

/**
 * POST /api/user/canvas
 * Save Canvas LMS credentials
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { canvasUrl, canvasToken } = body;

    if (!canvasUrl || !canvasToken) {
      return NextResponse.json(
        { error: 'Canvas URL and token are required' },
        { status: 400 }
      );
    }

    // Update user with Canvas credentials
    await prisma.user.update({
      where: { id: user.id },
      data: {
        canvasUrl,
        canvasToken, // In production, encrypt this!
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Canvas settings save error:', error);
    return NextResponse.json(
      { error: 'Failed to save Canvas settings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/canvas
 * Get Canvas LMS credentials
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        canvasUrl: true,
        canvasToken: true,
      },
    });

    return NextResponse.json(userData || { canvasUrl: null, canvasToken: null });
  } catch (error) {
    console.error('Canvas settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Canvas settings' },
      { status: 500 }
    );
  }
}
