import { EMBED_TOKEN_KEY } from '@/lib/embed/detect'

export function getEmbedBearerToken(): string | null {
  if (typeof window === 'undefined') return null
  if (window.self === window.top) return null

  try {
    return sessionStorage.getItem(EMBED_TOKEN_KEY)
  } catch {
    return null
  }
}

export function embedAuthorizedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = getEmbedBearerToken()
  if (!token) return fetch(input, init)

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
