import { getDb } from '@workspace/db'
import { createIsolatedPgliteTestContext } from '@workspace/db/test'
import { betterAuth } from 'better-auth'
import { bearer, testUtils } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { createAuthBaseConfig } from '@/lib/create-auth'

const testBetterAuthSecret = 'test-better-auth-secret-at-least-32-chars'
const testBetterAuthUrl = 'http://localhost:3000'

function createTestAuth(db: Awaited<ReturnType<typeof getDb>>) {
  return betterAuth({
    ...createAuthBaseConfig(db),
    plugins: [bearer(), tanstackStartCookies(), testUtils()],
  })
}

export function createIsolatedAuthTestContext() {
  const dbContext = createIsolatedPgliteTestContext({
    prefix: 'ditto-auth-pglite-',
  })
  const originalBetterAuthSecret = process.env.BETTER_AUTH_SECRET
  const originalBetterAuthUrl = process.env.BETTER_AUTH_URL

  return {
    async setup() {
      await dbContext.setup()
      process.env.BETTER_AUTH_SECRET = testBetterAuthSecret
      process.env.BETTER_AUTH_URL = testBetterAuthUrl
    },
    async cleanup() {
      await dbContext.cleanup()

      if (originalBetterAuthSecret === undefined) {
        delete process.env.BETTER_AUTH_SECRET
      } else {
        process.env.BETTER_AUTH_SECRET = originalBetterAuthSecret
      }

      if (originalBetterAuthUrl === undefined) {
        delete process.env.BETTER_AUTH_URL
      } else {
        process.env.BETTER_AUTH_URL = originalBetterAuthUrl
      }
    },
    async createAuth() {
      const auth = createTestAuth(await getDb())
      const helpers = (await auth.$context).test

      return { auth, helpers }
    },
  }
}
