import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from 'drizzle-orm/pg-core'

import { EMBEDDING_DIMENSIONS } from '../constants'

export const memories = pgTable(
  'memories',
  {
    id: uuid().primaryKey().defaultRandom(),
    content: text().notNull(),
    embedding: vector({ dimensions: EMBEDDING_DIMENSIONS }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('memories_embedding_idx').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops')
    ),
  ]
)
