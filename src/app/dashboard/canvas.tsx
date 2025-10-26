'use client'

import { useState } from 'react'
import { useCanvasSync } from '@/hooks/useCanvasSync'

export default function CanvasIntegration() {
  const [canvasToken, setCanvasToken] = useState('')
  const [userId, setUserId] = useState('')
  const [syncResult, setSyncResult] = useState<{
    coursesAdded: number
    filesAdded: number
  } | null>(null)

  const { sync, loading, error } = useCanvasSync()

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canvasToken.trim() || !userId.trim()) {
      return
    }

    try {
      const result = await sync({ userId, canvasToken })
      setSyncResult(result)
      setCanvasToken('') // Clear token for security
    } catch (err) {
      console.error('Sync failed:', err)
    }
  }

  return (
    <div className="canvas-integration">
      <h2>Canvas LMS Integration</h2>
      
      <div className="instructions">
        <p>To sync your Canvas courses:</p>
        <ol>
          <li>Go to <a href="https://q.utoronto.ca/profile/settings" target="_blank" rel="noopener noreferrer">Canvas Settings</a></li>
          <li>Scroll to "Approved Integrations"</li>
          <li>Click "+ New Access Token"</li>
          <li>Give it a name (e.g. "EduFlow")</li>
          <li>Copy the token and paste it below</li>
        </ol>
      </div>

      <form onSubmit={handleSync}>
        <div className="form-group">
          <label htmlFor="userId">User ID (temporary - will use Auth0 session):</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="canvasToken">Canvas Access Token:</label>
          <input
            id="canvasToken"
            type="password"
            value={canvasToken}
            onChange={(e) => setCanvasToken(e.target.value)}
            placeholder="Paste your Canvas token here"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !canvasToken.trim() || !userId.trim()}>
          {loading ? 'Syncing...' : 'Sync Canvas Courses'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {syncResult && (
        <div className="success-message">
          ✅ Sync complete!
          <ul>
            <li>Courses added: {syncResult.coursesAdded}</li>
            <li>Files added: {syncResult.filesAdded}</li>
          </ul>
        </div>
      )}

      <style jsx>{`
        .canvas-integration {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        h2 {
          margin-top: 0;
          color: #333;
        }

        .instructions {
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 2rem;
        }

        .instructions p {
          margin: 0 0 0.5rem 0;
          font-weight: bold;
        }

        .instructions ol {
          margin: 0.5rem 0 0 1.5rem;
        }

        .instructions li {
          margin: 0.25rem 0;
        }

        .instructions a {
          color: #1976d2;
          text-decoration: underline;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        button {
          width: 100%;
          padding: 0.75rem;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        button:hover:not(:disabled) {
          background: #1565c0;
        }

        button:disabled {
          background: #bbb;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 1rem;
          padding: 1rem;
          background: #ffebee;
          color: #c62828;
          border-radius: 4px;
        }

        .success-message {
          margin-top: 1rem;
          padding: 1rem;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 4px;
        }

        .success-message ul {
          margin: 0.5rem 0 0 1.5rem;
        }
      `}</style>
    </div>
  )
}
