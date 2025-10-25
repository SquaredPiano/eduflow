export class FileEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly url?: string
  ) {}
}
