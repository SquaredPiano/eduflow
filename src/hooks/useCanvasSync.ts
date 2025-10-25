'use client'

export function useCanvasSync() {
  async function sync(payload: unknown) {
    const res = await fetch('/api/canvas-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {})
    })
    if (!res.ok) throw new Error('Canvas sync failed')
    return res.json()
  }
  return { sync }
}

export default useCanvasSync
