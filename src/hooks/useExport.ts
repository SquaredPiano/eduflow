'use client'

import { useState } from 'react'
import { ExportFormat } from '@/domain/interfaces/IExporter'

export function useExport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function exportOutput(outputId: string, format: ExportFormat) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outputId, format })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = `eduflow-export.${format}`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Get the file blob
      const blob = await res.blob()

      // Create download link and trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { success: true, filename }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { exportOutput, loading, error }
}

export default useExport
