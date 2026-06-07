import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = path.resolve(packageRoot, '../..')

export function getPgliteDataDir() {
  const configured = process.env.PGLITE_DATA_DIR
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(repoRoot, configured)
  }
  return path.join(repoRoot, '.data/pglite')
}
