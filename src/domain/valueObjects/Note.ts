export type NoteVO = {
  title?: string
  body: string
}

export function createNote(body: string, title?: string): NoteVO {
  if (!body) throw new Error('Note body cannot be empty')
  return { title: title?.trim(), body: body.trim() }
}

export default NoteVO
