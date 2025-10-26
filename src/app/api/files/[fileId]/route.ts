import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { UploadThingAdapter } from '@/adapters/uploadthing.adapter';

const prisma = new PrismaClient();
const uploadthingAdapter = new UploadThingAdapter();

/**
 * DELETE /api/files/[fileId]
 * 
 * Delete a file and its associated data
 */
export async function DELETE(
  req: Request,
  { params }: { params: { fileId: string } }
) {
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

    // 3. Get file and verify ownership
    const file = await prisma.file.findUnique({
      where: { id: params.fileId },
      select: {
        id: true,
        key: true,
        userId: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    if (file.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this file' },
        { status: 403 }
      );
    }

    // 4. Delete from UploadThing
    try {
      await uploadthingAdapter.deleteFiles([file.key]);
      console.log(`✅ Deleted file from UploadThing: ${file.key}`);
    } catch (uploadthingError) {
      console.error('⚠️ Failed to delete from UploadThing:', uploadthingError);
      // Continue with database deletion even if UploadThing fails
    }

    // 5. Delete transcripts (cascade should handle this, but being explicit)
    await prisma.transcript.deleteMany({
      where: { fileId: file.id },
    });

    // 6. Delete file record from database
    await prisma.file.delete({
      where: { id: file.id },
    });

    console.log(`🗑️ File ${file.id} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
