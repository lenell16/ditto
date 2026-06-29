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

export interface EmbedHelloMessage extends EmbedMessageBase {
  source: typeof EMBED_SOURCE_EMBED
  type: typeof EMBED_MSG_HELLO
}

export interface EmbedReadyMessage extends EmbedMessageBase {
  source: typeof EMBED_SOURCE_EMBED
  type: typeof EMBED_MSG_READY
}

export interface EmbedAuthRequiredMessage extends EmbedMessageBase {
  source: typeof EMBED_SOURCE_EMBED
  type: typeof EMBED_MSG_AUTH_REQUIRED
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

export type EmbedToHostMessage =
  | EmbedHelloMessage
  | EmbedReadyMessage
  | EmbedAuthRequiredMessage

export type HostToEmbedMessage = EmbedInitMessage | EmbedTokenRefreshMessage

export type EmbedProtocolMessage = EmbedToHostMessage | HostToEmbedMessage

function isRecord(data: unknown): data is Record<string, unknown> {
  return Boolean(data && typeof data === 'object' && !Array.isArray(data))
}

export function createHelloMessage(): EmbedHelloMessage {
  return { source: EMBED_SOURCE_EMBED, type: EMBED_MSG_HELLO }
}

export function createReadyMessage(): EmbedReadyMessage {
  return { source: EMBED_SOURCE_EMBED, type: EMBED_MSG_READY }
}

export function createAuthRequiredMessage(): EmbedAuthRequiredMessage {
  return { source: EMBED_SOURCE_EMBED, type: EMBED_MSG_AUTH_REQUIRED }
}

export function createInitMessage(token: string): EmbedInitMessage {
  return { source: EMBED_SOURCE_HOST, type: EMBED_MSG_INIT, token }
}

export function createTokenRefreshMessage(
  token: string
): EmbedTokenRefreshMessage {
  return { source: EMBED_SOURCE_HOST, type: EMBED_MSG_TOKEN_REFRESH, token }
}

export function isHostMessage(data: unknown): data is HostToEmbedMessage {
  if (!isRecord(data)) return false
  if (data.source !== EMBED_SOURCE_HOST) return false
  if (data.type !== EMBED_MSG_INIT && data.type !== EMBED_MSG_TOKEN_REFRESH) {
    return false
  }
  return typeof data.token === 'string'
}

export function isEmbedMessage(data: unknown): data is EmbedToHostMessage {
  if (!isRecord(data)) return false
  if (data.source !== EMBED_SOURCE_EMBED) return false
  return (
    data.type === EMBED_MSG_HELLO ||
    data.type === EMBED_MSG_READY ||
    data.type === EMBED_MSG_AUTH_REQUIRED
  )
}
