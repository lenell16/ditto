import { getDb } from '@workspace/db'

import { createAuth } from './create-auth'

// getDb() runs the pglite/Neon driver switch (and pglite's async migrate), so
// resolve it once at module load and hand the live instance to Better Auth.
const db = await getDb()
export const auth = createAuth(db)
