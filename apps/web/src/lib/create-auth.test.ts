import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { closeDb, getDb } from '@workspace/db'
import { betterAuth } from 'better-auth'
import { bearer, testUtils } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { createAuthBaseConfig } from './create-auth'

const originalBetterAuthSecret = process.env.BETTER_AUTH_SECRET
const originalBetterAuthUrl = process.env.BETTER_AUTH_URL
const originalDatabaseUrl = process.env.DATABASE_URL
const originalPgliteDataDir = process.env.PGLITE_DATA_DIR

let testDataDir: string | undefined

function createTestAuth(db: Awaited<ReturnType<typeof getDb>>) {
  return betterAuth({
    ...createAuthBaseConfig(db),
    plugins: [bearer(), tanstackStartCookies(), testUtils()],
  })
}

describe('auth boundary', () => {
  beforeEach(async () => {
    await closeDb()
    testDataDir = await mkdtemp(path.join(tmpdir(), 'ditto-auth-pglite-'))
    process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret-at-least-32-chars'
    process.env.BETTER_AUTH_URL = 'http://localhost:3000'
    delete process.env.DATABASE_URL
    process.env.PGLITE_DATA_DIR = testDataDir
  })

  afterEach(async () => {
    await closeDb()
    if (testDataDir) {
      await rm(testDataDir, { force: true, recursive: true })
      testDataDir = undefined
    }

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

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }

    if (originalPgliteDataDir === undefined) {
      delete process.env.PGLITE_DATA_DIR
    } else {
      process.env.PGLITE_DATA_DIR = originalPgliteDataDir
    }
  })

  it('creates authenticated headers that resolve to the saved user session', async () => {
    const db = await getDb()
    const auth = createTestAuth(db)
    const test = (await auth.$context).test
    const user = test.createUser({
      email: 'auth-boundary@example.com',
      name: 'Auth Boundary',
    })

    await test.saveUser(user)

    const headers = await test.getAuthHeaders({ userId: user.id })
    const session = await auth.api.getSession({ headers })

    expect(headers.get('cookie')).toContain('session_token')
    expect(session?.user).toMatchObject({
      email: user.email,
      id: user.id,
      name: user.name,
    })
  })
})
