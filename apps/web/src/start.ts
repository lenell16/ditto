import { createMiddleware, createStart } from '@tanstack/react-start'
import type { CustomFetch } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'

import { embedAuthorizedFetch } from '@/lib/embed/embed-request'

const EMBED_FRAME_ANCESTORS =
  process.env.EMBED_FRAME_ANCESTORS ?? 'chrome-extension:'

const embedCspMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next }) => {
    setResponseHeader(
      'Content-Security-Policy',
      `frame-ancestors 'self' ${EMBED_FRAME_ANCESTORS}`
    )
    return next()
  }
)

const embedFetch: CustomFetch = async (url, init) => {
  if (typeof window === 'undefined') {
    return fetch(url, init)
  }
  return embedAuthorizedFetch(url, init)
}

export const startInstance = createStart(() => ({
  requestMiddleware: [embedCspMiddleware],
  serverFns: {
    fetch: embedFetch,
  },
}))
