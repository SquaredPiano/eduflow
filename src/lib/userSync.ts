import { PrismaClient } from '@prisma/client'

/**
 * Utility for synchronizing Auth0 users with the database
 * Follows Single Responsibility Principle
 */

const prisma = new PrismaClient()

// Type for Auth0 user session
interface Auth0User {
  sub?: string
  email?: string
  name?: string
  [key: string]: unknown
}

interface UserSession {
  user: Auth0User
  [key: string]: unknown
}

/**
 * Sync Auth0 user to database
 * Creates user if doesn't exist, updates if exists
 * @param session - Auth0 session object
 * @returns Database user record or null on error
 */
export async function syncUserToDatabase(session: UserSession | null | undefined) {
  if (!session?.user) {
    return null
  }

  const { sub: auth0Id, email, name } = session.user

  if (!auth0Id || !email) {
    console.error('Invalid session: missing auth0Id or email')
    return null
  }

  try {
    // Use upsert to create or update user atomically
    const user = await prisma.user.upsert({
      where: { auth0Id },
      update: {
        email,
        // Only update name if provided
        ...(name && { name }),
      },
      create: {
        auth0Id,
        email,
        ...(name && { name }),
      },
    })

    console.log(`User synced: ${user.email} (${user.id})`)
    return user
  } catch (error) {
    console.error('Error syncing user to database:', error)
    return null
  }
}

/**
 * Get user from database by Auth0 ID
 * @param auth0Id - Auth0 user ID (sub)
 * @returns Database user or null if not found
 */
export async function getUserByAuth0Id(auth0Id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        courses: true,
        files: {
          include: {
            transcripts: {
              include: {
                outputs: true,
              },
            },
          },
        },
      },
    })
    return user
  } catch (error) {
    console.error('Error fetching user from database:', error)
    return null
  }
}

/**
 * Get user from database by email
 * @param email - User email
 * @returns Database user or null if not found
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

/**
 * Cleanup function to disconnect Prisma client
 * Should be called when the application shuts down
 */
export async function disconnectDatabase() {
  await prisma.$disconnect()
}
