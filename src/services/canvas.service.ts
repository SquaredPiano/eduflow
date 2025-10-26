import { CanvasAdapter } from '@/adapters/canvas.adapter'
import { SupabaseAdapter } from '@/adapters/supabase.adapter'
import { logger } from '@/lib/logger'

export class CanvasService {
  constructor(
    private canvasAdapter: CanvasAdapter,
    private repository: SupabaseAdapter
  ) {}

  async syncCourses(
    userId: string, 
    accessToken: string
  ): Promise<{ coursesAdded: number; filesAdded: number }> {
    logger.info(`Starting Canvas sync for user ${userId}`)

    const courses = await this.canvasAdapter.getCourses(accessToken)
    const eightMonthsAgo = new Date()
    eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8)

    let coursesAdded = 0
    let filesAdded = 0

    for (const canvasCourse of courses) {
      // Skip old courses and non-active courses
      if (canvasCourse.workflow_state !== 'available') continue
      if (new Date(canvasCourse.created_at) < eightMonthsAgo) continue

      logger.info(`Syncing course: ${canvasCourse.name}`)

      // Check if course already exists
      const existingCourses = await this.repository.getCoursesByUserId(userId)
      const exists = existingCourses.some(c => c.canvasId === canvasCourse.id)

      let courseId: string
      
      if (!exists) {
        // Create course
        const course = await this.repository.createCourse({
          name: canvasCourse.name,
          userId,
          canvasId: canvasCourse.id
        })
        courseId = course.id
        coursesAdded++
        logger.info(`Created course: ${course.id}`)
      } else {
        courseId = existingCourses.find(c => c.canvasId === canvasCourse.id)!.id
        logger.info(`Course already exists: ${courseId}`)
      }

      // Get files from Canvas
      const files = await this.canvasAdapter.getCourseFiles(
        canvasCourse.id,
        accessToken
      )

      logger.info(`Found ${files.length} files in course ${canvasCourse.name}`)

      for (const canvasFile of files) {
        // Check if file already imported
        const existingFiles = await this.repository.getFilesByCourseId(courseId)
        const fileExists = existingFiles.some(f => f.canvasId === canvasFile.id)

        if (fileExists) {
          logger.info(`File already imported: ${canvasFile.display_name}`)
          continue
        }

        // Filter supported file types
        const supportedTypes = ['application/pdf', 'video/mp4', 'audio/mpeg', 'audio/wav']
        if (!supportedTypes.includes(canvasFile['content-type'])) {
          logger.info(`Skipping unsupported file type: ${canvasFile['content-type']}`)
          continue
        }

        // Create file record (don't download yet - we'll use Canvas URLs)
        await this.repository.createFile({
          name: canvasFile.display_name,
          type: this.mapContentTypeToFileType(canvasFile['content-type']),
          url: canvasFile.url,
          key: `canvas-${canvasFile.id}`, // Canvas files use Canvas ID as key
          size: canvasFile.size,
          userId,
          courseId,
          canvasId: canvasFile.id
        })

        filesAdded++
        logger.info(`Added file: ${canvasFile.display_name}`)
      }
    }

    logger.info(`Canvas sync complete: ${coursesAdded} courses, ${filesAdded} files`)
    return { coursesAdded, filesAdded }
  }

  async verifyAndStoreToken(userId: string, accessToken: string): Promise<boolean> {
    const isValid = await this.canvasAdapter.verifyToken(accessToken)
    
    if (isValid) {
      await this.repository.updateUser(userId, { canvasToken: accessToken })
      logger.info(`Canvas token stored for user ${userId}`)
    }

    return isValid
  }

  private mapContentTypeToFileType(contentType: string): string {
    if (contentType.includes('pdf')) return 'pdf'
    if (contentType.includes('mp4')) return 'mp4'
    if (contentType.includes('audio')) return 'audio'
    return 'other'
  }
}

export async function syncWithCanvas(_input: { courseId: string; content: unknown }) {
  return { ok: true }
}
