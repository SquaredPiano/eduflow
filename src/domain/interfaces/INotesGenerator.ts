export interface INotesGenerator {
  generateNotes(input: { transcript: string }): Promise<{ notes: string }>
}

export default INotesGenerator
