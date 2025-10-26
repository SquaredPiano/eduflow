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
 * DELETE /api/user/account
 * Delete user account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cascade delete will handle:
    // - Projects (and their files, outputs)
    // - Files (and their transcripts, outputs)
    // - Outputs
    // - Transcripts
    // - Courses
    
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`🗑️ Account deleted: ${user.email} (${user.id})`);

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
