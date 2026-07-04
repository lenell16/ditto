import { account, session, user, verification } from '@workspace/db'
import type { getDb } from '@workspace/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export type AuthDb = Awaited<ReturnType<typeof getDb>>

function buildTrustedOrigins(): Array<string> {
  const origins: Array<string> = []
  const configured = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  if (configured) {
    origins.push(
      ...configured
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    )
  }
  if (process.env.NODE_ENV !== 'production') {
    // Extension popup sign-in sends Origin: chrome-extension://<id>
    origins.push('chrome-extension://*')
    // Portless injects PORTLESS_URL with the exact dev origin it serves
    // (e.g. https://memoria.localhost:1355, or a worktree-prefixed subdomain).
    // Trust it dynamically so local browser auth works regardless of the
    // proxy port, without hardcoding it or matching BETTER_AUTH_URL exactly.
    const portlessUrl = process.env.PORTLESS_URL?.trim()
    if (portlessUrl) {
      origins.push(new URL(portlessUrl).origin)
    }
  }
  return origins
}

export function createAuth(db: AuthDb) {
  return betterAuth({
    ...createAuthBaseConfig(db),
    plugins: [bearer(), tanstackStartCookies()],
  })
}

export function createAuthBaseConfig(db: AuthDb) {
  return {
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: true },
    trustedOrigins: buildTrustedOrigins(),
  }
}
