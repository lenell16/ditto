import { account, getDb, session, user, verification } from '@workspace/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

// getDb() runs the pglite/Neon driver switch (and pglite's async migrate), so
// resolve it once at module load and hand the live instance to Better Auth.
const db = await getDb()

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

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true },
  trustedOrigins: buildTrustedOrigins(),
  plugins: [bearer(), tanstackStartCookies()],
})
