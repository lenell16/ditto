import { account, getDb, session, user, verification } from '@workspace/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

// getDb() runs the pglite/Neon driver switch (and pglite's async migrate), so
// resolve it once at module load and hand the live instance to Better Auth.
const db = await getDb()

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
})
