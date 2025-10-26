import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { createCanvasClient } from '@/lib/canvas.client';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('appSession');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    const auth0User = session.user;
    
    // Get the database user by Auth0 ID
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
      select: {
        id: true,
        email: true,
        auth0Id: true,
        name: true,
        canvasUrl: true,
        canvasToken: true,
        createdAt: true,
      },
    });
    
    return dbUser;
  } catch {
    return null;
  }
}

/**
 * GET /api/canvas/courses
 * Fetch courses from Canvas LMS
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.canvasUrl || !user.canvasToken) {
      return NextResponse.json(
        { error: 'Canvas credentials not configured' },
        { status: 400 }
      );
    }

    const client = createCanvasClient(user.canvasUrl, user.canvasToken);

    const searchParams = request.nextUrl.searchParams;
    const enrollmentType = searchParams.get('enrollment_type') as any;
    const enrollmentState = searchParams.get('enrollment_state') as any;
    const include = searchParams.getAll('include');

    const courses = await client.getCourses({
      enrollment_type: enrollmentType || undefined,
      enrollment_state: enrollmentState || 'active',
      include: include.length > 0 ? include : ['term', 'teachers'],
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Canvas courses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Canvas courses' },
      { status: 500 }
    );
  }
}
