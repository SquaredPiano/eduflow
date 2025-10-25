export type ApiError = { status: number; message: string }

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw { status: res.status, message } as ApiError
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return (await res.json()) as T
  const text = await res.text()
  return text as unknown as T
}
