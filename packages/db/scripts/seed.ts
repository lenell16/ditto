import { reset, seed } from 'drizzle-seed'

import { closeDb, getDb } from '../src/client'
import { MEMORY_FIXTURES } from '../src/seed/fixtures'
import * as schema from '../src/schema'
import { memories } from '../src/schema'

async function main() {
  try {
    const db = await getDb()
    await reset(db, schema)
    await seed(
      db,
      { memories },
      { seed: 1, count: MEMORY_FIXTURES.length }
    ).refine((f) => ({
      memories: {
        count: MEMORY_FIXTURES.length,
        columns: {
          content: f.valuesFromArray({
            values: MEMORY_FIXTURES.map((fixture) => fixture.content),
          }),
          embedding: f.valuesFromArray({
            // drizzle-seed types omit pgvector arrays; runtime accepts number[][]
            values: MEMORY_FIXTURES.map(
              (fixture) => fixture.embedding
            ) as unknown as Array<string | number | boolean | undefined>,
          }),
        },
      },
    }))
    console.log(`Seeded ${MEMORY_FIXTURES.length} memories`)
  } finally {
    await closeDb()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
