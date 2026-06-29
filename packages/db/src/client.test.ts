import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { closeDb, getDb } from './client'
import { fixtureVector } from './seed/fixtures'
import { memories } from './schema'
import { createIsolatedPgliteTestContext } from './test'

const dbContext = createIsolatedPgliteTestContext()

describe('pglite database client', () => {
  beforeEach(async () => {
    await dbContext.setup()
  })

  afterEach(async () => {
    await dbContext.cleanup()
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
