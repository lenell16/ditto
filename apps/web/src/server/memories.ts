import { createServerFn } from '@tanstack/react-start'
import { getDb, memories } from '@workspace/db'

export const listMemories = createServerFn({ method: 'GET' }).handler(
  async () => {
    const db = await getDb()
    return db.select().from(memories).limit(20)
  }
)
