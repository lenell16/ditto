import {
  EMBED_MSG_AUTH_REQUIRED,
  EMBED_MSG_HELLO,
  EMBED_MSG_INIT,
  EMBED_MSG_READY,
  EMBED_MSG_TOKEN_REFRESH,
  EMBED_SOURCE_EMBED,
  EMBED_SOURCE_HOST,
  isEmbedMessage,
} from '@/lib/protocol'

export const STORAGE_TOKEN_KEY = 'ditto-auth-token'
export const STORAGE_USER_KEY = 'ditto-auth-user'

export interface EmbedHostOptions {
  onReady?: () => void
  onAuthRequired?: () => void
}

export function installEmbedHost(
  iframe: HTMLIFrameElement,
  webAppOrigin: string,
  options?: EmbedHostOptions
): () => void {
  const sendToken = (token: string) => {
    iframe.contentWindow?.postMessage(
      { source: EMBED_SOURCE_HOST, type: EMBED_MSG_INIT, token },
      webAppOrigin
    )
  }

  const handler = async (event: MessageEvent) => {
    if (event.origin !== webAppOrigin) return
    if (!isEmbedMessage(event.data)) return
    if (event.data.source !== EMBED_SOURCE_EMBED) return

    switch (event.data.type) {
      case EMBED_MSG_HELLO: {
        const stored = await chrome.storage.local.get(STORAGE_TOKEN_KEY)
        const token = stored[STORAGE_TOKEN_KEY] as string | undefined
        if (token) sendToken(token)
        break
      }
      case EMBED_MSG_READY:
        options?.onReady?.()
        break
      case EMBED_MSG_AUTH_REQUIRED:
        options?.onAuthRequired?.()
        break
      default:
        break
    }
  }

  window.addEventListener('message', handler)

  const storageListener = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string
  ) => {
    if (area !== 'local') return
    if (!(STORAGE_TOKEN_KEY in changes)) return
    const token = changes[STORAGE_TOKEN_KEY].newValue as string | undefined
    if (!token) return
    iframe.contentWindow?.postMessage(
      {
        source: EMBED_SOURCE_HOST,
        type: EMBED_MSG_TOKEN_REFRESH,
        token,
      },
      webAppOrigin
    )
  }

  chrome.storage.onChanged.addListener(storageListener)

  return () => {
    window.removeEventListener('message', handler)
    chrome.storage.onChanged.removeListener(storageListener)
  }
}
