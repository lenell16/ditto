import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { closeDb, getDb } from './client'
import { fixtureVector } from './seed/fixtures'
import { memories } from './schema'

const originalDatabaseUrl = process.env.DATABASE_URL
const originalPgliteDataDir = process.env.PGLITE_DATA_DIR

let testDataDir: string | undefined

describe('pglite database client', () => {
  beforeEach(async () => {
    await closeDb()
    testDataDir = await mkdtemp(path.join(process.cwd(), '.data/test-pglite-'))
    delete process.env.DATABASE_URL
    process.env.PGLITE_DATA_DIR = testDataDir
  })

  afterEach(async () => {
    await closeDb()
    if (testDataDir) {
      await rm(testDataDir, { force: true, recursive: true })
      testDataDir = undefined
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

  it('runs migrations and persists inserted memories in an isolated pglite database', async () => {
    const db = await getDb()
    const [inserted] = await db
      .insert(memories)
      .values({
        content: 'Integration test memory',
        embedding: fixtureVector(42),
      })
      .returning()

    expect(inserted).toMatchObject({
      content: 'Integration test memory',
      id: expect.any(String),
    })

    await closeDb()

    const reopenedDb = await getDb()
    const rows = await reopenedDb.select().from(memories)

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      content: 'Integration test memory',
      id: inserted.id,
    })
    expect(rows[0]?.createdAt).toBeInstanceOf(Date)
  })
})
