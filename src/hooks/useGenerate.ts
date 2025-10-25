'use client'

export function useGenerate() {
  async function generate(payload: unknown) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {})
    })
    if (!res.ok) throw new Error('Generate failed')
    return res.json()
  }
  return { generate }
}

export default useGenerate
