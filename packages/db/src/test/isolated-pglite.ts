import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { closeDb } from '../client'

interface IsolatedPgliteOptions {
  prefix?: string
}

export function createIsolatedPgliteTestContext(
  options: IsolatedPgliteOptions = {}
) {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const originalPgliteDataDir = process.env.PGLITE_DATA_DIR
  let dataDir: string | undefined

  return {
    get dataDir() {
      return dataDir
    },
    async setup() {
      await closeDb()
      dataDir = await mkdtemp(
        path.join(tmpdir(), options.prefix ?? 'ditto-test-pglite-')
      )
      delete process.env.DATABASE_URL
      process.env.PGLITE_DATA_DIR = dataDir
    },
    async cleanup() {
      await closeDb()
      if (dataDir) {
        await rm(dataDir, { force: true, recursive: true })
        dataDir = undefined
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
    },
  }
}
