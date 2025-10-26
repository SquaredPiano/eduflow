import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/files
 * 
 * Fetch all files for the authenticated user
 */
export async function GET(req: Request) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get database user ID
    const auth0Id = session.user.sub;
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Fetch user's files with transcript info
    const files = await prisma.file.findMany({
      where: { userId: dbUser.id },
      include: {
        transcripts: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Format response
    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      url: file.url,
      key: file.key,
      size: file.size,
      createdAt: file.createdAt.toISOString(),
      hasTranscript: file.transcripts.length > 0,
    }));

    return NextResponse.json({
      success: true,
      files: formattedFiles,
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
