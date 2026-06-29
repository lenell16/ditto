import { closeDb, getDb } from '@workspace/db'
import { user } from '@workspace/db/schema'
import { eq } from 'drizzle-orm'

import { DEV_BROWSER_AUTH } from '../src/dev/browser-auth'
import { auth } from '../src/lib/auth'

async function main() {
  if (process.env.DATABASE_URL) {
    console.error(
      'seed:dev-user only supports local pglite. Unset DATABASE_URL and retry.'
    )
    process.exit(1)
  }

  const db = await getDb()
  const rows = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, DEV_BROWSER_AUTH.email))
    .limit(1)

  if (rows.length > 0) {
    console.log(`Dev browser user already exists: ${rows[0].email}`)
    return
  }

  await auth.api.signUpEmail({
    body: {
      email: DEV_BROWSER_AUTH.email,
      password: DEV_BROWSER_AUTH.password,
      name: DEV_BROWSER_AUTH.name,
    },
  })

  console.log(`Created dev browser user: ${DEV_BROWSER_AUTH.email}`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await closeDb()
  })
