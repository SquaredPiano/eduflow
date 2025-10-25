import type { FileEntity } from '../domain/entities/FileEntity'

// Handles upload bookkeeping and preprocessing (stub)
export async function ingestFile(_input: { name: string; mimeType: string; size: number; url?: string }): Promise<FileEntity> {
  const id = Math.random().toString(36).slice(2)
  // Dynamically import to avoid circular deps
  const { FileEntity } = await import('../domain/entities/FileEntity')
  return new FileEntity(id, _input.name, _input.mimeType, _input.size, _input.url)
}
