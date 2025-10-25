export interface IRepository<T extends { id: string }> {
  getById(id: string): Promise<T | null>
  list(): Promise<T[]>
  save(entity: T): Promise<void>
  delete(id: string): Promise<void>
}
