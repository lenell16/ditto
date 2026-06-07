import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { PGlite } from '@electric-sql/pglite'
import { vector } from '@electric-sql/pglite-pgvector'
import { Pool } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'

import { getPgliteDataDir } from './paths'
import * as schema from './schema'

type Db =
  | ReturnType<typeof drizzlePglite<typeof schema>>
  | ReturnType<typeof drizzleNeon<typeof schema>>

let db: Db | undefined
let pool: Pool | undefined
let pglite: PGlite | undefined

export async function getDb() {
  if (db) return db
  const url = process.env.DATABASE_URL
  if (url) {
    pool = new Pool({ connectionString: url })
    db = drizzleNeon({ client: pool, schema })
    return db
  }
  const dataDir = getPgliteDataDir()
  await mkdir(dataDir, { recursive: true })
  pglite = await PGlite.create({ dataDir, extensions: { vector } })
  await pglite.exec('CREATE EXTENSION IF NOT EXISTS vector')
  db = drizzlePglite({ client: pglite, schema })
  const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url))
  await migrate(db, { migrationsFolder })
  return db
}

export async function closeDb() {
  if (pool) {
    await pool.end()
    pool = undefined
  }
  if (pglite) {
    await pglite.close()
    pglite = undefined
  }
  db = undefined
}
