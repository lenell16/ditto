export const EMBED_SOURCE_HOST = 'ditto-host'
export const EMBED_SOURCE_EMBED = 'ditto-embed'

export const EMBED_MSG_HELLO = 'HELLO'
export const EMBED_MSG_INIT = 'INIT'
export const EMBED_MSG_READY = 'READY'
export const EMBED_MSG_TOKEN_REFRESH = 'TOKEN_REFRESH'
export const EMBED_MSG_AUTH_REQUIRED = 'AUTH_REQUIRED'

export interface EmbedMessageBase {
  source: string
  type: string
}

export interface EmbedInitMessage extends EmbedMessageBase {
  source: typeof EMBED_SOURCE_HOST
  type: typeof EMBED_MSG_INIT
  token: string
}

export interface EmbedTokenRefreshMessage extends EmbedMessageBase {
  source: typeof EMBED_SOURCE_HOST
  type: typeof EMBED_MSG_TOKEN_REFRESH
  token: string
}

export type EmbedHostMessage = EmbedInitMessage | EmbedTokenRefreshMessage

export function isEmbedMessage(data: unknown): data is EmbedMessageBase {
  return Boolean(
    data && typeof data === 'object' && 'source' in data && 'type' in data
  )
}
