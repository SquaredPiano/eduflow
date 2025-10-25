export async function exportContent(_input: { kind: 'pdf' | 'pptx'; content: unknown }): Promise<{ url: string }> {
  return { url: '/api/export/download/example' }
}
