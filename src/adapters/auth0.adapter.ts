import { PrismaClient } from '@prisma/client'
import { auth0 } from '@/lib/auth0'

/**
 * Auth0Adapter - Server-side adapter for Auth0 integration
 * Handles user synchronization between Auth0 and database
 * Follows Single Responsibility Principle - only handles Auth0-DB sync
 */
export class Auth0Adapter {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  /**
   * Get the current authenticated user session
   * @returns User session from Auth0 or null if not authenticated
   */
  async getSession() {
    try {
      const session = await auth0.getSession()
      return session
    } catch (error) {
      console.error('Error getting Auth0 session:', error)
      return null
    }
  }

  /**
   * Sync Auth0 user to database
   * Creates user if doesn't exist, updates if exists
   * @param auth0Id - Auth0 user ID (sub)
   * @param email - User email
   * @param name - User name (optional)
   * @returns Database user record
   */
  async syncUser(auth0Id: string, email: string, name?: string) {
    try {
      // Use upsert to create or update user atomically
      const user = await this.prisma.user.upsert({
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

      return user
    } catch (error) {
      console.error('Error syncing user to database:', error)
      throw new Error('Failed to sync user')
    }
  }

  /**
   * Get user from database by Auth0 ID
   * @param auth0Id - Auth0 user ID (sub)
   * @returns Database user or null if not found
   */
  async getUserByAuth0Id(auth0Id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { auth0Id },
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
  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      })
      return user
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  /**
   * Ensure user exists in database, syncing from session if needed
   * This should be called on protected route access
   * @returns Database user or null if session invalid
   */
  async ensureUserInDatabase() {
    try {
      const session = await this.getSession()
      
      if (!session?.user) {
        return null
      }

      const { sub: auth0Id, email, name } = session.user

      if (!auth0Id || !email) {
        console.error('Invalid session: missing auth0Id or email')
        return null
      }

      // Sync user to database (creates if doesn't exist)
      const user = await this.syncUser(auth0Id, email, name)
      return user
    } catch (error) {
      console.error('Error ensuring user in database:', error)
      return null
    }
  }

  /**
   * Clean up database connection
   * Should be called when the adapter is no longer needed
   */
  async disconnect() {
    await this.prisma.$disconnect()
  }
}
