'use client'

export function useUpload() {
  async function ingest(formData: FormData) {
    const res = await fetch('/api/ingest', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Ingest failed')
    return res.json()
  }
  return { ingest }
}

export default useUpload
