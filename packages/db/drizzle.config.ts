import path from 'node:path'
import { fileURLToPath } from 'node:url'

import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL
const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../..'
)

function getPgliteDataDir() {
  const configured = process.env.PGLITE_DATA_DIR
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(repoRoot, configured)
  }
  return path.join(repoRoot, '.data/pglite')
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  ...(url
    ? { dbCredentials: { url } }
    : {
        driver: 'pglite',
        dbCredentials: {
          url: getPgliteDataDir(),
        },
      }),
})
