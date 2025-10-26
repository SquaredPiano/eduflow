'use client'

import { useState } from 'react'

export function useCanvasSync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sync(payload: { userId: string; canvasToken: string }) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/canvas-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Canvas sync failed')
      }

      return res.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Canvas sync failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { sync, loading, error }
}

export default useCanvasSync
