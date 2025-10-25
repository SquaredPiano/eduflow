'use client'

export type AgentMessage = { role: 'user' | 'assistant'; content: string }

export function useAgentChat() {
  async function send(messages: AgentMessage[]) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'chat', messages })
    })
    if (!res.ok) throw new Error('Agent chat failed')
    return res.json()
  }
  return { send }
}

export default useAgentChat
