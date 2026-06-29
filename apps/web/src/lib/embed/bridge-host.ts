import {
  createAuthRequiredMessage,
  createHelloMessage,
  createReadyMessage,
  isHostMessage,
} from '@workspace/embed-protocol'

import { EMBED_TOKEN_KEY, isEmbedded } from '@/lib/embed/detect'
import type { EmbedAuthStatus } from '@/lib/embed/status'
import { getSession } from '@/server/auth'

export function setEmbedToken(token: string) {
  try {
    sessionStorage.setItem(EMBED_TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

function isAllowedHostOrigin(origin: string): boolean {
  if (origin.startsWith('chrome-extension://')) return true
  const allowed = import.meta.env.VITE_ALLOWED_EMBEDDER
  if (allowed && origin === allowed) return true
  return false
}

export interface EmbedBridgeOptions {
  onReady?: () => void
  onAuthRequired?: () => void
}

const statusListeners = new Set<(status: EmbedAuthStatus) => void>()
let refCount = 0
let cleanup: (() => void) | undefined

function emitStatus(status: EmbedAuthStatus) {
  for (const listener of statusListeners) {
    listener(status)
  }
}

export function subscribeEmbedBridgeStatus(
  listener: (status: EmbedAuthStatus) => void
): () => void {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}

export function acquireEmbedBridge(router: {
  invalidate: () => void | Promise<void>
}): () => void {
  if (!isEmbedded()) return () => {}

  refCount += 1
  if (refCount === 1) {
    emitStatus('connecting')
    cleanup = installEmbedBridge(router, {
      onReady: () => emitStatus('connected'),
      onAuthRequired: () => emitStatus('auth-required'),
    })
  }

  return () => {
    refCount -= 1
    if (refCount > 0) return

    cleanup?.()
    cleanup = undefined
    emitStatus('idle')
  }
}

export function installEmbedBridge(
  router: { invalidate: () => void | Promise<void> },
  options?: EmbedBridgeOptions
): () => void {
  if (!isEmbedded()) return () => {}

  window.parent.postMessage(createHelloMessage(), '*')

  const handler = async (event: MessageEvent) => {
    if (!isAllowedHostOrigin(event.origin)) return
    if (!isHostMessage(event.data)) return

    setEmbedToken(event.data.token)
    await router.invalidate()

    const session = await getSession()
    if (!session) {
      window.parent.postMessage(createAuthRequiredMessage(), event.origin)
      options?.onAuthRequired?.()
      return
    }

    window.parent.postMessage(createReadyMessage(), event.origin)
    options?.onReady?.()
  }

  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
