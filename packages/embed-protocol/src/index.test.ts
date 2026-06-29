import { describe, expect, it } from 'vitest'

import {
  EMBED_MSG_AUTH_REQUIRED,
  EMBED_MSG_HELLO,
  EMBED_MSG_INIT,
  EMBED_MSG_READY,
  EMBED_MSG_TOKEN_REFRESH,
  EMBED_SOURCE_EMBED,
  EMBED_SOURCE_HOST,
  createAuthRequiredMessage,
  createHelloMessage,
  createInitMessage,
  createReadyMessage,
  createTokenRefreshMessage,
  isEmbedMessage,
  isHostMessage,
} from './index'

describe('embed protocol messages', () => {
  it('creates embed-to-host status messages', () => {
    expect(createHelloMessage()).toEqual({
      source: EMBED_SOURCE_EMBED,
      type: EMBED_MSG_HELLO,
    })
    expect(createReadyMessage()).toEqual({
      source: EMBED_SOURCE_EMBED,
      type: EMBED_MSG_READY,
    })
    expect(createAuthRequiredMessage()).toEqual({
      source: EMBED_SOURCE_EMBED,
      type: EMBED_MSG_AUTH_REQUIRED,
    })
  })

  it('creates host-to-embed token messages', () => {
    expect(createInitMessage('test-token')).toEqual({
      source: EMBED_SOURCE_HOST,
      type: EMBED_MSG_INIT,
      token: 'test-token',
    })
    expect(createTokenRefreshMessage('refreshed-token')).toEqual({
      source: EMBED_SOURCE_HOST,
      type: EMBED_MSG_TOKEN_REFRESH,
      token: 'refreshed-token',
    })
  })

  it('accepts messages created by the protocol factories', () => {
    expect(isEmbedMessage(createHelloMessage())).toBe(true)
    expect(isEmbedMessage(createReadyMessage())).toBe(true)
    expect(isEmbedMessage(createAuthRequiredMessage())).toBe(true)
    expect(isHostMessage(createInitMessage('test-token'))).toBe(true)
    expect(isHostMessage(createTokenRefreshMessage('test-token'))).toBe(true)
  })

  it.each([
    { name: 'null', value: null },
    { name: 'primitive', value: 'HELLO' },
    { name: 'array', value: [] },
    {
      name: 'missing token',
      value: { source: EMBED_SOURCE_HOST, type: EMBED_MSG_INIT },
    },
    {
      name: 'non-string token',
      value: { source: EMBED_SOURCE_HOST, type: EMBED_MSG_INIT, token: 123 },
    },
    {
      name: 'embed message with host-only type',
      value: {
        source: EMBED_SOURCE_EMBED,
        type: EMBED_MSG_INIT,
        token: 'test-token',
      },
    },
    {
      name: 'host message with embed-only type',
      value: {
        source: EMBED_SOURCE_HOST,
        type: EMBED_MSG_HELLO,
        token: 'test-token',
      },
    },
  ])('rejects malformed host message: $name', ({ value }) => {
    expect(isHostMessage(value)).toBe(false)
  })

  it.each([
    { name: 'null', value: null },
    { name: 'primitive', value: 'READY' },
    { name: 'array', value: [] },
    { name: 'missing source', value: { type: EMBED_MSG_READY } },
    { name: 'missing type', value: { source: EMBED_SOURCE_EMBED } },
    {
      name: 'host message with embed-only type',
      value: { source: EMBED_SOURCE_HOST, type: EMBED_MSG_READY },
    },
    {
      name: 'embed message with unknown type',
      value: { source: EMBED_SOURCE_EMBED, type: 'UNKNOWN' },
    },
  ])('rejects malformed embed message: $name', ({ value }) => {
    expect(isEmbedMessage(value)).toBe(false)
  })
})
