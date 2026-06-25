import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

export const EMBED_TOKEN_KEY = 'ditto-embed-token'

// First-load embed detection. One concept, two environment-specific truths:
//   - server: `Sec-Fetch-Dest: iframe` (browser-set, forbidden to spoof, so a
//     URL typed into a top-level tab — which sends `document` — cannot fool
//     the server into skipping auth on the very first request).
//   - client: `window.self !== window.top` (a top-level tab cannot fake being
//     framed).
//
// The `.server()` body is dead-code-eliminated from the client bundle by the
// Start compiler, so the `@tanstack/react-start/server` import stays
// server-only.
export const isEmbeddedLoad = createIsomorphicFn()
  .server(() => getRequestHeader('Sec-Fetch-Dest') === 'iframe')
  .client(() => isEmbedded())

// The one client signal that a top-level browser tab cannot fake: a top-level
// document always has window.self === window.top. Used by the client-only
// embed plumbing (bridge installation, badge, bearer-token attachment).
export function isEmbedded(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
}
