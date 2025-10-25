export type ExportKind = 'pdf' | 'pptx'

export interface IExporter {
  export(input: { kind: ExportKind; content: unknown }): Promise<{ url: string }>
}
