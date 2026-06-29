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
  // Extension popup sign-in sends Origin: chrome-extension://<id>
  if (process.env.NODE_ENV !== 'production') {
    origins.push('chrome-extension://*')
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
