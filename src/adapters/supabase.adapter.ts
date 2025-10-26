import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class SupabaseAdapter {
  // User methods
  async getUserByAuth0Id(auth0Id: string) {
    return prisma.user.findUnique({ where: { auth0Id } })
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async createUser(data: { email: string; auth0Id: string }) {
    return prisma.user.create({ data })
  }

  async updateUser(userId: string, data: { canvasToken?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data
    })
  }

  // Course methods
  async getCoursesByUserId(userId: string) {
    return prisma.course.findMany({ where: { userId } })
  }

  async createCourse(data: { name: string; userId: string; canvasId?: string }) {
    return prisma.course.create({ data })
  }

  // File methods
  async getFilesByCourseId(courseId: string) {
    return prisma.file.findMany({ where: { courseId } })
  }

  async createFile(data: {
    name: string
    type: string
    url: string
    courseId: string
    canvasId?: string
  }) {
    return prisma.file.create({ data })
  }

  async getFileById(fileId: string) {
    return prisma.file.findUnique({ where: { id: fileId } })
  }

  // Transcript methods
  async createTranscript(data: { content: string; fileId: string }) {
    return prisma.transcript.create({ data })
  }

  async getTranscriptsByFileId(fileId: string) {
    return prisma.transcript.findMany({ where: { fileId } })
  }

  // Output methods
  async createOutput(data: {
    type: string
    content: object
    transcriptId: string
  }) {
    return prisma.output.create({ data })
  }

  async getOutputsByTranscriptId(transcriptId: string) {
    return prisma.output.findMany({ where: { transcriptId } })
  }
}
